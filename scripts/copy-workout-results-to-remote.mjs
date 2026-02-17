#!/usr/bin/env node

import crypto from "node:crypto";
import process from "node:process";

import pg from "pg";

const { Client } = pg;

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

    if (arg === "--email") {
      options.email = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg === "--as-email") {
      options.asEmail = argv[index + 1];
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
Copy workout round results from local DB to remote DB.

Required:
  --remote-url <postgres-url>

Optional:
  --local-url <postgres-url>  Default: process.env.DATABASE_URL
  --email <user-email>        Copy only this local user
  --as-email <user-email>     Write all imported rows to this remote user email
  --execute                   Perform insert (default is dry-run)

Examples:
  node --env-file=.env scripts/copy-workout-results-to-remote.mjs \\
    --remote-url "$POSTGRES_URL" \\
    --email "you@example.com" \\
    --execute
`;
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
    const sourceResults = await localClient.query(
      `
      SELECT
        u.email AS user_email,
        p.slug AS plan_slug,
        d."dayNumber" AS day_number,
        wr."roundNumber" AS round_number,
        wrr."targetSeconds" AS target_seconds,
        wrr."elapsedMs" AS elapsed_ms,
        wrr."completedAt" AS completed_at
      FROM "WorkoutRoundResult" wrr
      JOIN "User" u ON u.id = wrr."userId"
      JOIN "WorkoutPlan" p ON p.id = wrr."planId"
      JOIN "WorkoutDay" d ON d.id = wrr."dayId"
      JOIN "WorkoutRound" wr ON wr.id = wrr."roundId"
      WHERE ($1::text IS NULL OR u.email = $1::text)
      ORDER BY wrr."completedAt" ASC
      `,
      [options.email ?? null],
    );

    if (sourceResults.rows.length === 0) {
      console.log("No workout results found to copy.");
      return;
    }

    let copied = 0;
    let skippedDuplicate = 0;
    let skippedMissingUser = 0;
    let skippedMissingPlanDayRound = 0;

    if (options.execute) {
      await remoteClient.query("BEGIN");
    }

    for (const row of sourceResults.rows) {
      const targetEmail = options.asEmail ?? row.user_email;

      const userResult = await remoteClient.query(
        `SELECT id FROM "User" WHERE email = $1 LIMIT 1`,
        [targetEmail],
      );

      if (userResult.rows.length === 0) {
        skippedMissingUser += 1;
        continue;
      }

      const relationResult = await remoteClient.query(
        `
        SELECT
          p.id AS plan_id,
          d.id AS day_id,
          wr.id AS round_id
        FROM "WorkoutPlan" p
        JOIN "WorkoutDay" d ON d."planId" = p.id
        JOIN "WorkoutRound" wr ON wr."dayId" = d.id
        WHERE
          p.slug = $1
          AND d."dayNumber" = $2
          AND wr."roundNumber" = $3
        LIMIT 1
        `,
        [row.plan_slug, row.day_number, row.round_number],
      );

      if (relationResult.rows.length === 0) {
        skippedMissingPlanDayRound += 1;
        continue;
      }

      const ids = relationResult.rows[0];
      const userId = userResult.rows[0].id;

      const duplicateResult = await remoteClient.query(
        `
        SELECT 1
        FROM "WorkoutRoundResult"
        WHERE
          "userId" = $1
          AND "planId" = $2
          AND "dayId" = $3
          AND "roundId" = $4
          AND "completedAt" = $5
          AND "elapsedMs" = $6
          AND "targetSeconds" = $7
        LIMIT 1
        `,
        [
          userId,
          ids.plan_id,
          ids.day_id,
          ids.round_id,
          row.completed_at,
          row.elapsed_ms,
          row.target_seconds,
        ],
      );

      if (duplicateResult.rows.length > 0) {
        skippedDuplicate += 1;
        continue;
      }

      if (options.execute) {
        await remoteClient.query(
          `
          INSERT INTO "WorkoutRoundResult" (
            "id",
            "userId",
            "planId",
            "dayId",
            "roundId",
            "targetSeconds",
            "elapsedMs",
            "completedAt"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `,
          [
            crypto.randomUUID(),
            userId,
            ids.plan_id,
            ids.day_id,
            ids.round_id,
            row.target_seconds,
            row.elapsed_ms,
            row.completed_at,
          ],
        );
      }

      copied += 1;
    }

    if (options.execute) {
      await remoteClient.query("COMMIT");
    }

    console.log(`Mode: ${options.execute ? "EXECUTE" : "DRY-RUN"}`);
    console.log(`Source rows: ${sourceResults.rows.length}`);
    console.log(`Would copy / copied: ${copied}`);
    console.log(`Skipped (duplicate): ${skippedDuplicate}`);
    console.log(`Skipped (missing remote user): ${skippedMissingUser}`);
    console.log(`Skipped (missing remote plan/day/round): ${skippedMissingPlanDayRound}`);

    if (!options.execute) {
      console.log("Add --execute to perform inserts.");
    }
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
  console.error(error.message);
  process.exit(1);
});
