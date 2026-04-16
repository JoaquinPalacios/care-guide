This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Database Workflow

This project uses Postgres with Prisma for application data.

Issue #2 replaces the temporary Prisma bootstrap model with the first real
clinic-scoped staff schema:

- `Clinic`
- `User`
- `ClinicMembership`
- `Account`
- `Session`
- `VerificationToken`

The Auth.js adapter models now use the canonical Prisma names for low-risk
adapter compatibility. To keep future product concepts unambiguous, any later
workflow/session domain model should use an explicit name such as
`ProcedureSession`, rather than reusing a generic `Session` name.

### Local Postgres

If you have Docker available, start the local database with:

```bash
docker compose up -d
```

Stop it with:

```bash
docker compose down
```

The expected local connection string for this repo is:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/care_guide?schema=public"
```

Auth.js also expects:

```bash
AUTH_SECRET="replace-with-a-long-random-string"
```

1. Copy `.env.example` to `.env`.
2. Start Postgres with `docker compose up -d`.
3. Prisma CLI commands read the connection string from `prisma.config.ts`, which loads `.env` via `dotenv`.
4. Generate the Prisma client with `pnpm db:generate`.
5. Validate or format the schema with `pnpm db:validate` and `pnpm db:format`.
6. Create local migrations with `pnpm db:migrate:dev` once the database is healthy.
7. Open Prisma Studio with `pnpm db:studio`.
8. Seed the demo clinic and staff accounts with `pnpm db:seed`.

### Seeded demo accounts

The seed creates one clinic plus two clinic-scoped staff users:

- Clinic: `Rivers Care Demo Clinic`
- Admin: `admin@care-guide.test`
- Staff: `staff@care-guide.test`
- Shared demo password: `CareGuideDemo123!`

### Issue #3 constraints

Issue #3 auth wiring should build on this schema without expanding into broader
product models:

- Treat clinic access as membership-derived, not as a single clinic field on `User`.
- Keep Auth.js on the canonical `Account`, `Session`, and `VerificationToken`
  Prisma models.
- Reserve explicit names such as `ProcedureSession` for later workflow/domain
  tables instead of introducing another generic `Session` concept.
- Keep the server auth surface minimal and internal-tool oriented.
- Do not add password reset, invites, OAuth providers, account settings, or
  extra auth UI in Issue #3.
- Do not build protected route behavior or dashboard shell behavior yet.

### Issue #3 auth server wiring

Issue #3 adds a server-first Auth.js setup with:

- `auth.ts` as the root Auth.js configuration
- `@auth/prisma-adapter` against the canonical Prisma models
- database-backed sessions
- a minimal internal credentials sign-in handler for seeded staff accounts
- reusable server helpers for the current signed-in user and clinic membership
  context

### Exercising auth before login UI exists

Before Issue #4 adds `/login`, auth is intended to be exercised through the
minimal auth API surface:

1. Start the app with `pnpm dev`.
2. `POST` JSON credentials to `/api/auth/login`.
3. Reuse the returned cookie when calling `/api/auth/me` or `/api/auth/session`.
4. `POST` to `/api/auth/logout` to clear the session and cookie.

Example login request:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@care-guide.test","password":"CareGuideDemo123!"}'
```

This keeps Issue #3 internal-tool oriented and avoids shipping a custom login
page before Issue `#4`.

Issue `#4` should consume this existing contract rather than replace it: the
MVP auth flow currently uses custom `/api/auth/login` and `/api/auth/logout`
endpoints layered on top of Auth.js database sessions and shared server-side
auth helpers.

### Clinic membership contract for MVP

Clinic context remains database-derived through `ClinicMembership` rather than
stored in the session payload.

For MVP, the auth helper layer assumes one effective clinic membership per
signed-in staff user. If multiple memberships exist for the same user, helper
resolution fails explicitly instead of silently choosing one. Issue `#4` must
respect this contract and should not introduce any implicit clinic selection.

## Getting Started

First, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
