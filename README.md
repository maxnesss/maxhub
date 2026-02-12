# MaxHub

MaxHub is a modular personal hub built on Next.js. It currently includes:
- Core authentication, profile, and admin permission management
- Apps overview with app-level RBAC
- `Projects` app
- `Bamboo` app (business plan workspace with tasks, inventory, shop planning, documents)

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

## Environment

1. Copy env template:

```bash
cp .env.example .env
```

2. Set required values in `.env`:

```env
DATABASE_URL="postgresql://..."
AUTH_SECRET="..."
AUTH_TRUST_HOST=true
```

3. Optional/required for Bamboo file uploads (Cloudflare R2):

```env
R2_ENDPOINT="https://<account-id>.r2.cloudflarestorage.com"
R2_BUCKET="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
```

## How To Run

Install dependencies:

```bash
npm install
```

Generate Prisma client:

```bash
npx prisma generate
```

Apply local migrations:

```bash
npx prisma migrate dev
```

Run dev server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Command Contract (Explicit)

Use these commands as the default workflow:

```bash
npm run lint
npm run typecheck
npm test
npx prisma migrate dev
npx prisma generate
```

Additional useful commands:

```bash
npm run lint:file -- <file1> <file2>
npm run lint:fix
npm run test:unit
npm run test:integration
npm run test:e2e
npm run db:studio
npm run create:user -- <email> <password> [name] [--role=ADMIN]
```

## Testing

- `npm test` runs unit tests (`tests/unit`).
- Integration tests are in `tests/integration` and use env-backed services.
- E2E tests are in `tests/e2e` and expect the app + auth flow to be available.

## Database & Prisma

- Prisma config: `prisma.config.ts`
- Schema is split by domain in `prisma/schema/`:
  - `00-base.prisma`
  - `10-auth.prisma`
  - `20-projects.prisma`
  - `30-bamboo.prisma`
- Migrations are in `prisma/migrations/` and must be committed.

When changing schema:

```bash
npx prisma migrate dev --name <change_name>
npx prisma generate
```

## Deployment (Vercel)

- Build script uses:

```bash
npm run vercel-build
```

- `vercel-build` runs database deploy migrations + Next build.
- Ensure production `DATABASE_URL`, auth, and R2 env vars are set in Vercel.
