# CODEX Rules For MaxHub

These rules apply to both human contributors and coding agents.

## 1. Runtime And Tooling

- Use Node `24.x`.
- Use npm commands defined in `package.json`.
- Preferred local flow:

```bash
npm run lint
npm run typecheck
npm test
```

For focused edits, prefer file-scoped lint first:

```bash
npm run lint:file -- <changed-files>
```

## 2. Auth And Access Control

- Never add new protected routes without auth guards.
- Use existing helpers in `lib/authz.ts`:
  - `requireUserContext`
  - `requireAdminUser`
  - `requireAppRead`
  - `requireAppEdit`
- Keep permission logic centralized; avoid duplicating checks in components.

## 3. Server Actions

- Mutations belong in `actions.ts` files with `"use server"`.
- `"use server"` modules must export async functions only.
- Parse and validate all form inputs with `zod` before DB writes.
- On successful writes, call `revalidatePath` for affected pages.

## 4. Data And Prisma

- Prisma schema is modular in `prisma/schema/*`.
- Any schema change must include a migration in `prisma/migrations`.
- After schema edits run:

```bash
npx prisma migrate dev --name <change_name>
npx prisma generate
```

- Never hand-edit generated Prisma client files.

## 5. App Modularity Rules

When adding/updating an app:
1. Register app in `lib/apps.ts`.
2. Ensure app is represented in permissions model (Prisma `AppCode` + migrations).
3. Gate read/edit paths with authz helpers.
4. Keep app-specific logic inside its app folder and related `lib/*` files.

## 6. UI Conventions

- Keep existing visual language (light, minimal, detailed cards/navigation).
- Reuse shared components before creating new ones.
- Tailwind classes should follow canonical patterns.

## 7. Storage Integrations

- R2 uploads must go through `lib/r2-images.ts` or `lib/r2-documents.ts`.
- Persist object metadata in DB for every uploaded file.
- Avoid hardcoding secrets; use environment variables only.

## 8. Before Opening PR / Finalizing Work

Run and pass at minimum:

```bash
npm run lint
npm run typecheck
npm test
```

If changes touch runtime flows, run targeted integration/e2e tests too.
