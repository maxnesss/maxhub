# MaxHub

MaxHub is a modular Next.js hub with centralized auth, app-level permissions, and multiple feature apps under one account.

## Current App Modules

- `Projects`
- `Calendar`
- `Bamboo` (business planning workspace)
- `Workout`
- `Smoothie`
- `Invoice`
- `Skating Bible`

## Tech Stack

- Next.js 16 (App Router, Server Components, Server Actions)
- React 19 + TypeScript 5
- Tailwind CSS 4
- NextAuth v5 (Credentials + JWT session)
- Prisma 7 + `@prisma/adapter-pg` + `pg` (PostgreSQL)
- Vitest (unit/integration) + Playwright (E2E)

## Prerequisites

- Node.js `24.x` (see `package.json` engines)
- npm
- PostgreSQL

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Copy env template:

```bash
cp .env.example .env
```

3. Generate Prisma client and run local migrations:

```bash
npx prisma generate
npx prisma migrate dev
```

4. Start the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

Optional: create a local user quickly:

```bash
npm run create:user -- <email> <password> [name] [--role=ADMIN]
```

## Environment Variables

Required:

- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_TRUST_HOST=true`

Optional:

- `AUTH_URL` (custom auth base URL)
- `REMOTE_DATABASE_URL` (used by data copy scripts)
- `R2_ENDPOINT`
- `R2_BUCKET`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`

## Daily Dev Workflow

Default validation flow after meaningful changes:

```bash
npm run lint
npm run typecheck
npm test
```

For targeted edits first:

```bash
npm run lint:file -- <changed-files>
```

Useful commands:

```bash
npm run lint:fix
npm run test:unit
npm run test:integration
npm run test:e2e
npm run db:studio
npm run db:migrate
npm run db:generate
```

## Testing

- `npm test` runs unit tests in `tests/unit`.
- Integration tests live in `tests/integration`.
- E2E tests live in `tests/e2e` and require working env/auth setup.

## Database and Migrations

- Prisma config: `prisma.config.ts`
- Schema is modular under `prisma/schema/`
- Migrations live in `prisma/migrations/` and should be committed
- Do not edit applied migrations unless doing explicit migration recovery

For schema changes:

```bash
npx prisma migrate dev --name <change_name>
npx prisma generate
```

## Architecture Guardrails

- Keep auth and permissions centralized in `lib/authz.ts`
- Route protection entrypoint is `proxy.ts`
- App registry is `lib/apps.ts`
- Use Server Components by default
- Put mutations in `actions.ts` with `"use server"` (async exports only)
- Validate action/form input with `zod` before writes
- Call `revalidatePath` after successful writes

See `ARCHITECTURE.md`, `CODEX_RULES.md`, and `AGENTS.md` for project conventions.

## Deployment

Production build command:

```bash
npm run vercel-build
```

`vercel-build` runs Prisma deploy migrations and then builds Next.js.
