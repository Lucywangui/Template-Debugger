# SOMA APP

SOMA APP helps learners find, purchase, and practise curriculum learning materials with randomized multiple-choice questions.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `PORT=22202 BASE_PATH=/ pnpm --filter @workspace/soma-app run dev` — run the SOMA learner app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/soma-app/src/pages/` — onboarding and learner dashboard screens
- `artifacts/soma-app/src/components/` — material cards, viewers, wallet modal, and UI components
- `artifacts/soma-app/src/data/materials.ts` — curriculum material catalog
- `artifacts/soma-app/src/data/questions.ts` — question selection and answer-shuffling logic
- `artifacts/soma-app/src/components/Generators/questionTemplates.ts` — valid subject template banks
- `artifacts/soma-app/src/lib/storage.ts` — local learner, wallet, purchase, and quiz-result state

## Architecture decisions

- Question generation is offline and template-backed so a learner can open purchased materials without depending on an external AI service.
- Each material opening selects up to 15 subject-specific templates and shuffles both questions and answer choices while preserving the correct answer index.
- Learner progress, wallet balance, purchases, and quiz results remain in browser storage, matching the original app's offline flow.

## Product

- Learners complete a short onboarding flow, choose a curriculum level, search materials, purchase them with wallet funds, and open topical or exam practice.
- Every opened material presents 15 randomized multiple-choice questions from the repaired template banks.

## User preferences

- Keep the existing app structure and behavior; do not introduce a replacement framework or unrelated features.

## Gotchas

- The SOMA Vite config intentionally requires `PORT` and `BASE_PATH`; the preview workflow must provide both values.
- Run the root `typecheck` after editing generator templates because parser errors in one template can create thousands of misleading downstream diagnostics.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
