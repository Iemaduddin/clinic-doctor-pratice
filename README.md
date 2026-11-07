# Clinic Doctor Practice

Clinic appointment booking and management app built with Nuxt, Prisma, and PostgreSQL.

## Setup

Requirements: Node.js 22 and PostgreSQL.

```sh
npm ci
Copy-Item .env.example .env
```

Set `DATABASE_URL` to your PostgreSQL connection string, `BETTER_AUTH_SECRET` to a random secret of at least 32 characters, and `BETTER_AUTH_URL` to the app's base URL. Keep `.env` private.

## Database

Create the configured database, then apply migrations and seed initial data:

```sh
npm run db:generate
npm run db:migrate
npm run db:seed
```

`npm run db:studio` opens Prisma Studio.

## Run and check

```sh
npm run dev
npm run typecheck
npm test
npm run build
```

Development server runs at http://localhost:3000.
