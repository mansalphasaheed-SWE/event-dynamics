# Slice 0 Progress

## Objective

Establish the shared technical foundation required by later Event Dynamics modules.

## Status

In progress.

## Completed

- [x] pnpm workspace created
- [x] NestJS API scaffolded
- [x] Git repository initialized
- [x] Boundary lint rules added
- [x] Vitest configured with SWC
- [x] Unit test migrated from Jest to Vitest
- [x] E2E test migrated from Jest to Vitest
- [x] Jest configuration and dependencies removed
- [x] Lint passes
- [x] Unit tests pass
- [x] E2E tests pass
- [x] API build passes
- [x] CI requirements reviewed

## Current work

- [x] Add the CI workflow

## Verification

| Check | Result | Date |
|---|---|---|
| `pnpm lint` | Passed |  |
| `pnpm test` | Passed |  |
| `pnpm test:e2e` | Passed |  |
| `pnpm build` | Passed |  |
| GitHub Actions CI | Pending first push |  |

## Pending

- [ ] Add PostgreSQL development setup
- [ ] Add environment configuration
- [ ] Add Drizzle ORM
- [ ] Add migration workflow
- [ ] Add transaction infrastructure
- [ ] Add database integration tests
- [ ] Implement remaining Slice 0 kernel components

## Verification

| Check | Result | Date |
|---|---|---|
| `pnpm lint` | Passed |  |
| `pnpm test` | Passed |  |
| `pnpm test:e2e` | Passed |  |
| `pnpm build` | Passed |  |

## Related commits

| Commit | Purpose |
|---|---|
| Add commit hash | Jest-to-Vitest migration |

## Decisions

- One Vitest configuration is used for unit and E2E discovery.
- Unit and E2E suites are separated by file patterns and scripts.
- Jest is removed only after Vitest replacement tests pass.
- CI will run lint, tests, and build.

## Open questions

- Which CI provider will host the first workflow?
- Will PostgreSQL run through Docker locally and as a CI service?