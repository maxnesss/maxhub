#!/usr/bin/env node

import process from "node:process";

import pg from "pg";

const { Client } = pg;

const TABLES = {
  overview: "SkatingBibleOverview",
  brainstorm: "SkatingBibleBrainstorm",
  idea: "SkatingBibleIdea",
  taskGroup: "SkatingBibleTaskGroupEntity",
  task: "SkatingBibleTask",
};

function parseArgs(argv) {
  const options = {
    execute: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--execute") {
      options.execute = true;
      continue;
    }

    if (arg === "--local-url") {
      options.localUrl = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg === "--remote-url") {
      options.remoteUrl = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg === "--help" || arg === "-h") {
      options.help = true;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function usage() {
  return `
Copy Skating Bible data from local DB to remote DB.

Required:
  --remote-url <postgres-url>

Optional:
  --local-url <postgres-url>  Default: process.env.DATABASE_URL
  --execute                   Perform remote replace (default is dry-run)

Notes:
  - Copies only Skating Bible tables.
  - In execute mode this script REPLACES remote Skating Bible data.

Example:
  node --env-file=.env scripts/copy-skating-bible-to-remote.mjs \\
    --remote-url "$REMOTE_DATABASE_URL" \\
    --execute
`;
}

async function fetchRows(client, tableName, orderBy) {
  const result = await client.query(
    `SELECT * FROM "${tableName}"${orderBy ? ` ORDER BY ${orderBy}` : ""}`,
  );
  return result.rows;
}

async function getRemoteCounts(client) {
  const [overview, brainstorm, idea, taskGroup, task] = await Promise.all([
    client.query(`SELECT COUNT(*)::int AS count FROM "${TABLES.overview}"`),
    client.query(`SELECT COUNT(*)::int AS count FROM "${TABLES.brainstorm}"`),
    client.query(`SELECT COUNT(*)::int AS count FROM "${TABLES.idea}"`),
    client.query(`SELECT COUNT(*)::int AS count FROM "${TABLES.taskGroup}"`),
    client.query(`SELECT COUNT(*)::int AS count FROM "${TABLES.task}"`),
  ]);

  return {
    overview: overview.rows[0].count,
    brainstorm: brainstorm.rows[0].count,
    idea: idea.rows[0].count,
    taskGroup: taskGroup.rows[0].count,
    task: task.rows[0].count,
  };
}

async function insertRows(client, tableName, columns, rows) {
  if (rows.length === 0) {
    return;
  }

  const columnSql = columns.map((column) => `"${column}"`).join(", ");
  const valuesSql = columns.map((_, index) => `$${index + 1}`).join(", ");
  const query = `INSERT INTO "${tableName}" (${columnSql}) VALUES (${valuesSql})`;

  for (const row of rows) {
    const values = columns.map((column) => row[column] ?? null);
    await client.query(query, values);
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    console.log(usage().trim());
    return;
  }

  const localUrl = options.localUrl ?? process.env.DATABASE_URL;
  const remoteUrl = options.remoteUrl ?? process.env.REMOTE_DATABASE_URL;

  if (!localUrl) {
    throw new Error("Missing local database URL. Use --local-url or DATABASE_URL.");
  }

  if (!remoteUrl) {
    throw new Error("Missing remote database URL. Use --remote-url or REMOTE_DATABASE_URL.");
  }

  const localClient = new Client({ connectionString: localUrl });
  const remoteClient = new Client({ connectionString: remoteUrl, ssl: { rejectUnauthorized: false } });

  await localClient.connect();
  await remoteClient.connect();

  try {
    const [overviewRows, brainstormRows, ideaRows, taskGroupRows, taskRows] = await Promise.all([
      fetchRows(localClient, TABLES.overview, `"id" ASC`),
      fetchRows(localClient, TABLES.brainstorm, `"createdAt" ASC`),
      fetchRows(localClient, TABLES.idea, `"createdAt" ASC`),
      fetchRows(localClient, TABLES.taskGroup, `"createdAt" ASC`),
      fetchRows(localClient, TABLES.task, `"createdAt" ASC`),
    ]);

    const localCounts = {
      overview: overviewRows.length,
      brainstorm: brainstormRows.length,
      idea: ideaRows.length,
      taskGroup: taskGroupRows.length,
      task: taskRows.length,
    };

    const remoteCountsBefore = await getRemoteCounts(remoteClient);

    console.log(`Mode: ${options.execute ? "EXECUTE" : "DRY-RUN"}`);
    console.log("Local Skating Bible row counts:");
    console.log(localCounts);
    console.log("Remote Skating Bible row counts (before):");
    console.log(remoteCountsBefore);

    if (!options.execute) {
      console.log("Add --execute to replace remote Skating Bible data.");
      return;
    }

    await remoteClient.query("BEGIN");

    await remoteClient.query(`DELETE FROM "${TABLES.task}"`);
    await remoteClient.query(`DELETE FROM "${TABLES.idea}"`);
    await remoteClient.query(`DELETE FROM "${TABLES.brainstorm}"`);
    await remoteClient.query(`DELETE FROM "${TABLES.taskGroup}"`);
    await remoteClient.query(`DELETE FROM "${TABLES.overview}"`);

    await insertRows(
      remoteClient,
      TABLES.overview,
      ["id", "projectName", "summary", "goal", "techStack", "keyFeatures", "createdAt", "updatedAt"],
      overviewRows,
    );

    await insertRows(
      remoteClient,
      TABLES.brainstorm,
      ["id", "title", "createdAt", "updatedAt"],
      brainstormRows,
    );

    await insertRows(
      remoteClient,
      TABLES.taskGroup,
      ["id", "name", "createdAt", "updatedAt"],
      taskGroupRows,
    );

    // Insert ideas with null parent first, then restore hierarchy.
    const ideaRowsWithoutParent = ideaRows.map((row) => ({
      ...row,
      parentId: null,
    }));

    await insertRows(
      remoteClient,
      TABLES.idea,
      ["id", "brainstormId", "title", "notes", "parentId", "posX", "posY", "createdAt", "updatedAt"],
      ideaRowsWithoutParent,
    );

    for (const row of ideaRows) {
      if (!row.parentId) {
        continue;
      }

      await remoteClient.query(
        `UPDATE "${TABLES.idea}" SET "parentId" = $1 WHERE "id" = $2`,
        [row.parentId, row.id],
      );
    }

    await insertRows(
      remoteClient,
      TABLES.task,
      ["id", "title", "details", "taskGroupId", "status", "createdAt", "updatedAt"],
      taskRows,
    );

    await remoteClient.query("COMMIT");

    const remoteCountsAfter = await getRemoteCounts(remoteClient);
    console.log("Remote Skating Bible row counts (after):");
    console.log(remoteCountsAfter);
  } catch (error) {
    if (options.execute) {
      await remoteClient.query("ROLLBACK");
    }
    throw error;
  } finally {
    await localClient.end();
    await remoteClient.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
