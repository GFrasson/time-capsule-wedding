# Repository Guidelines

## How to work in this repository

This project uses the Agent Skills workflow as the default way of working.

Always determine whether a relevant skill applies before starting.
If a matching skill exists, use it.
Do not skip required phases for non-trivial work.

Default workflow for substantial tasks:
1. /spec
2. /plan
3. /build
4. /test
5. /review
6. /code-simplify
7. /ship

If the request is vague or underdefined, do this first:
- use idea-refine
- clarify goals, constraints, tradeoffs, and success criteria
- then continue to /spec

## Phase routing

Use the skill that matches the current phase or problem:

- idea-refine
  - for vague, exploratory, or incomplete requests

- spec-driven-development
  - for new features, meaningful changes, or anything that needs requirements first

- planning-and-task-breakdown
  - for turning a spec into small ordered tasks

- incremental-implementation
  - for implementing in small, verifiable slices

- test-driven-development
  - for behavior changes, regression protection, and proof that the change works

- debugging-and-error-recovery
  - for bugs, regressions, flaky behavior, runtime failures, and root-cause analysis

- code-review-and-quality
  - for review, quality gates, edge cases, maintainability, and correctness checks

- code-simplification
  - for removing unnecessary complexity after the solution works

- shipping-and-launch
  - for release readiness, rollout, rollback, monitoring, and final delivery checks

Use additional supporting skills when relevant, especially for UI, APIs, framework-specific work, security, performance, documentation, CI/CD, migrations, and git workflows.

## Required behavior by step

### 1) /spec
Before coding non-trivial work:
- define scope, goals, constraints, assumptions, risks, and acceptance criteria
- state what is in scope and out of scope
- identify impacted files, interfaces, and user-visible behavior

Do not start implementation until the task is clear enough.

### 2) /plan
Break the work into:
- small, ordered, testable tasks
- clear dependencies
- explicit acceptance criteria for each task

Prefer thin vertical slices over broad rewrites.

### 3) /build
Implement incrementally:
- make small, reversible changes
- follow existing project patterns unless there is a good reason not to
- avoid unrelated refactors during feature work
- prefer clarity over cleverness

### 4) /test
Validate all behavior changes:
- add or update tests
- reproduce bugs before fixing when possible
- verify the changed flow, not only internal implementation
- do not claim success without evidence

### 5) /review
Run a quality pass for:
- correctness
- readability
- maintainability
- edge cases
- security and performance when relevant

### 6) /code-simplify
Before finishing:
- remove unnecessary complexity
- reduce indirection
- remove dead code
- simplify abstractions when possible

### 7) /ship
Before considering work complete:
- ensure tests/build/lint/typecheck pass when applicable
- update docs if behavior or setup changed
- note rollout and rollback considerations for risky changes
- make sure the result is ready for handoff or release

## Non-skipping rules

Do not:
- jump straight to coding for non-trivial requests
- skip planning for multi-step work
- skip tests for behavior changes
- skip review because the change seems small
- skip simplification because the code already works
- claim something is done without validation

If time is limited, reduce scope, not rigor.

## Delivery rules

Prefer:
- small diffs
- atomic changes
- explicit verification
- clear handoff notes

Avoid:
- mixed-purpose changes
- speculative abstractions
- giant rewrites without staging
- untested behavior changes

## Definition of done

Work is done when:
- the appropriate workflow steps were followed
- the result matches the request
- the change was validated
- important risks or tradeoffs were surfaced
- the output is ready for handoff, merge, or release

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
There is currently no dedicated automated test suite in the repository. Until one is added, treat `npm run lint` and a successful local build as the minimum verification bar. For changes to uploads, pagination, or unlock behavior, manually test the affected route and API flow. If you add tests, place them near the feature and use `*.test.ts` or `*.test.tsx`.

## Commit & Pull Request Guidelines
Recent history favors short, imperative commit subjects with prefixes such as `feat:` and `refactor:`. Keep commits focused, for example `feat: add capsule share page`. PRs should include a brief summary, note any schema or environment changes, link the related task or issue, and attach screenshots for UI changes. Call out new Prisma migrations explicitly so reviewers can validate deployment impact.

## Security & Configuration Tips
Keep secrets in `.env` only; do not commit credentials. The app depends on PostgreSQL, Cloudinary and Backblaze settings.
