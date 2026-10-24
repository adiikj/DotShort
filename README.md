# DotShort

A URL shortener built as a pnpm/Turborepo monorepo.

## Structure

- `apps/frontend`: Next.js (App Router) + TypeScript
- `apps/backend`: Express + TypeScript + MongoDB/Mongoose

## Getting started

```bash
pnpm install
pnpm dev
```

Runs both apps in parallel via Turborepo. Use `pnpm dev:web` or `pnpm dev:api` to run just one.

Copy `.env.example` to `.env` in each app before running.
