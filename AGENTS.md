# Repository Guidelines

## Project Structure & Module Organization
This repository is a Next.js App Router project. Application routes live in `src/app`, including dynamic capsule pages under `src/app/capsules/[capsuleId]` and API handlers under `src/app/api`. Reusable UI and feature components live in `src/components`; low-level shadcn-style primitives are grouped in `src/components/ui`. Shared utilities and Prisma client setup live in `src/lib`. Database schema and migrations are in `prisma/`. Static assets belong in `public/`.

## Build, Test, and Development Commands
- `npm run dev`: start the local development server at `http://localhost:3000`.
- `npm run build`: deploy Prisma migrations, then build the production app.
- `npm run start`: run the production build locally.
- `npm run lint`: run ESLint across the project.
- `npx prisma migrate dev --name <change>`: create and apply a local migration while developing schema changes.
- `docker-compose up -d`: start local services if you are using the provided container setup.

## Coding Style & Naming Conventions
Use TypeScript and React function components. Follow the existing codebase style: prefer single quotes in app code, semicolons are mixed but should not be introduced gratuitously, and use 2-space indentation in Prisma files and the prevailing indentation in touched files elsewhere. Name components in PascalCase (`UploadForm.tsx`), helpers in camelCase, and route folders with Next.js conventions (`[capsuleId]`, `page.tsx`, `route.ts`). Run `npm run lint` before opening a PR.

## Testing Guidelines
There is currently no dedicated automated test suite in the repository. Until one is added, treat `npm run lint` and a successful local build as the minimum verification bar. For changes to uploads, pagination, or unlock behavior, manually test the affected route and API flow. If you add tests, place them near the feature or under a clear `src/__tests__` structure and use `*.test.ts` or `*.test.tsx`.

## Commit & Pull Request Guidelines
Recent history favors short, imperative commit subjects with prefixes such as `feat:` and `refactor:`. Keep commits focused, for example `feat: add capsule share page`. PRs should include a brief summary, note any schema or environment changes, link the related task or issue, and attach screenshots for UI changes. Call out new Prisma migrations explicitly so reviewers can validate deployment impact.

## Security & Configuration Tips
Keep secrets in `.env` only; do not commit credentials. The app depends on PostgreSQL, Cloudinary and Backblaze settings.
