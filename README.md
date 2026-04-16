This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Database Workflow

This project uses Postgres with Prisma for application data.

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

1. Copy `.env.example` to `.env`.
2. Start Postgres with `docker compose up -d`.
3. Prisma CLI commands read the connection string from `prisma.config.ts`, which loads `.env` via `dotenv`.
4. Generate the Prisma client with `pnpm db:generate`.
5. Validate or format the schema with `pnpm db:validate` and `pnpm db:format`.
6. Create local migrations with `pnpm db:migrate:dev` once the database is healthy.
7. Open Prisma Studio with `pnpm db:studio`.
8. Run the seed stub with `pnpm db:seed`.

Issue #1 only adds the Prisma foundation. The current schema contains a placeholder bootstrap model so later issues can introduce the real clinic, staff, session, and product models cleanly.

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
