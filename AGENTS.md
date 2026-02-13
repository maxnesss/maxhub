# AGENTS.md

Project-level instructions for coding agents working in **MaxHub**.

## 1. Scope

- Follow this file as the first source of project conventions.
- Use `README.md`, `ARCHITECTURE.md`, and `CODEX_RULES.md` as supporting references.
- Keep changes focused, reversible, and aligned with existing architecture.

## 2. Runtime Baseline

- Node: `24.x` (see `package.json` engines)
- Package manager: `npm`
- Framework: Next.js App Router (`next@16`)
- Database: PostgreSQL via Prisma + `@prisma/adapter-pg`

## 3. Required Local Workflow

Use this default sequence after meaningful code changes:

```bash
npm run lint
npm run typecheck
npm test
```

For targeted edits first:

```bash
npm run lint:file -- <changed-files>
```

Database commands:

```bash
npx prisma generate
npx prisma migrate dev --name <change_name>
```

## 4. Architecture Guardrails

- Keep auth and permissions centralized in `lib/authz.ts`.
- Route protection entrypoint is `proxy.ts`.
- App registry lives in `lib/apps.ts`; update registry + permissions model together.
- Use Server Components by default.
- Mutations go in `actions.ts` with `"use server"`.
- In `"use server"` modules, export async functions only.
- Validate all form/action input with `zod` before DB writes.
- Revalidate affected routes after writes with `revalidatePath`.

## 5. Prisma Rules (Critical)

- Prisma schema is modular under `prisma/schema/`.
- All schema changes must include migration files under `prisma/migrations/`.
- Do **not** edit already-applied migrations unless user explicitly asks for migration recovery.
- Never reset/drop production data without explicit user approval.

### Migration Safety Notes

- Production deploy uses:

```bash
npm run vercel-build
# prisma migrate deploy && next build
```

- If production migration gets stuck (`P3009` / failed migration record), recover with:

```bash
npx prisma migrate resolve --rolled-back <migration_name>
npx prisma migrate deploy
```

- If local `migrate dev` reports drift, do not run destructive reset automatically. Explain options and ask.

## 6. Domain Conventions

### Auth & RBAC

- Roles: `USER | ADMIN`
- App permissions: `UserAppPermission` (`canRead`, `canEdit`)
- Enforce access via:
  - `requireUserContext`
  - `requireAdminUser`
  - `requireAppRead`
  - `requireAppEdit`

### Bamboo App

- Bamboo tasks are phase-based (`BambooTaskPhase`), not week-based.
- Use shared task constants/parsers from `lib/bamboo-tasks.ts`.
- Recommended capital scenario persistence uses `BambooCapitalScenario`.
- R2 file operations must go through:
  - `lib/r2-images.ts`
  - `lib/r2-documents.ts`

## 7. UI / UX Consistency

- Preserve current visual language: light, minimal, detailed cards.
- Reuse shared components (`TopNav`, `Breadcrumbs`, `Toast`, etc.) before adding new ones.
- Keep Tailwind classes canonical and lint-clean.

## 8. Testing Expectations By Change Type

- Small UI/text changes: targeted lint + typecheck.
- Logic/action/model changes: lint + typecheck + relevant unit/integration tests.
- Auth, routing, or key user flows: include E2E coverage updates when needed.

## 9. Git Hygiene

- Keep commits scoped and descriptive.
- Do not revert unrelated user changes.
- Do not use destructive git commands (`reset --hard`, checkout overwrite) unless explicitly requested.

## 10. When Unsure

- Prefer existing patterns in neighboring files.
- Prefer safe, incremental changes over broad rewrites.
- State assumptions clearly in the final response.
