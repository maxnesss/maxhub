# MaxHub Architecture

## Goals

- Keep MaxHub modular so new apps can be added without rewriting core auth/permissions.
- Share users, roles, and app permissions across all apps.
- Keep business logic close to feature routes using Server Actions and domain libs.

## High-Level Structure

- `app/`: Next.js App Router pages and server actions
- `components/`: reusable UI and feature components
- `lib/`: domain logic, app registry, validation, authz helpers, R2 services
- `prisma/`: Prisma config, split schema, migrations
- `tests/`: unit, integration, and e2e suites

## Core Runtime Decisions

1. Auth
- NextAuth credentials provider in `auth.ts`
- Session strategy is JWT
- Login page is `/login`

2. Route Protection
- Global gatekeeping in `proxy.ts`
- Public routes are only `/` and `/login` (+ auth API)
- All app-level authorization goes through `lib/authz.ts`

3. Authorization Model
- Global role: `USER | ADMIN`
- Per-app permissions via `UserAppPermission` (`canRead`, `canEdit`)
- Admin bypasses app permission checks

4. Data Access
- Prisma client in `prisma.ts` with pooled PG adapter
- Schema split by concern to keep growth manageable
- Migrations are linear and committed

5. Storage
- Cloudflare R2 for Bamboo images/documents
- Object metadata stored in PostgreSQL
- Signed URLs generated on demand

## App Catalog Pattern

App registry lives in `lib/apps.ts`:
- Defines app codes
- Defines labels/descriptions/routes
- Drives permissions UI and authorization checks

When adding a new app module:
1. Add app code in Prisma enum (`AppCode`) and create migration.
2. Add app definition in `lib/apps.ts`.
3. Enforce access with `requireAppRead("<APP>")` / `requireAppEdit("<APP>")`.
4. Add app tile/entry in UI via shared registry.

## Bamboo Module

Location: `app/apps/bamboo/**`

Bamboo is organized by subdomains:
- Overview
- Tasks/timeline
- Company setup and legal/compliance
- Inventory (ideas, producers, import, inventory budget)
- Shop (location, concept, budget)
- Finance/recommended capital/estimated setup cost
- Documents

Domain data models are in `prisma/schema/30-bamboo.prisma`.

## Conventions

- Use Server Components by default.
- Put mutations in `actions.ts` files with `"use server"`.
- In a `"use server"` file, export async functions only.
- Validate incoming form data with `zod`.
- Revalidate paths after writes using `revalidatePath`.
- Use `lib/authz.ts` helpers instead of inline permission logic.
- Reuse shared UI primitives (`TopNav`, `Breadcrumbs`, `Toast`, value helps).

## Tests

- `tests/unit`: pure domain/utils validation
- `tests/integration`: server action behavior and data flow
- `tests/e2e`: browser-level critical user journeys
