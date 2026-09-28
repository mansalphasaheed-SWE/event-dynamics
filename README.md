# Event Dynamics

An event planning, logistics and ticketing platform.

## Development Progress

Implementation progresses through documented slices, beginning with
Slice 0: the shared technical foundation used by later features.

See the [Slice 0 progress tracker](docs/implementation-slices/slice-0-progress.md)
for completed work, pending tasks and verification results.

## Selected Technology Stack

- TypeScript and NestJS
- PostgreSQL
- Drizzle ORM with node-postgres
- Zod
- pg-boss
- Vitest with SWC
- pnpm workspaces

This is the selected stack. The progress tracker records which
components have been integrated and verified.

## Repository Structure

- `apps/api/` — NestJS API
- `packages/` — workspace location for shared packages
- `docs/` — requirements, architecture, implementation and development guides
- `compose.yaml` — local PostgreSQL configuration

## Development Setup

### Prerequisites

- Node.js and pnpm versions matching the root `package.json`
- Docker Desktop running for local database work

Use pnpm for dependency management and project scripts.

### Install Dependencies

From the repository root:

    pnpm install

### Configure the Environment

Copy `.env.example` to `.env` and supply your local values.

The API validates its application settings at startup.
Database initialization settings are used by Docker Compose.

### Start PostgreSQL

    pnpm db:up

See the [local database guide](docs/development/local-database.md)
for connection details, health checks, logs and persistent storage.

### Start the API

    pnpm dev

## Project Scripts

Run these from the repository root:

| Command | Purpose |
|---|---|
| `pnpm dev` | Start the API in development mode |
| `pnpm build` | Build the API |
| `pnpm lint` | Check lint rules, including module boundaries |
| `pnpm lint:fix` | Apply automatic lint fixes |
| `pnpm test` | Run all tests included in the Vitest configuration |
| `pnpm test:e2e` | Run only E2E tests |
| `pnpm --filter api test:integration` | Run the isolated API test against disposable PostgreSQL |
| `pnpm db:up` | Start local PostgreSQL in the background |
| `pnpm db:down` | Remove the database container while retaining its named volume |
| `pnpm db:logs` | Follow PostgreSQL logs |

## Documentation

- [Requirements and product brief](docs/requirements/)
- [System design and technology stack](docs/design/)
- [Architecture decision records](docs/adr/)
- [API specifications](docs/api/)
- [Implementation slices](docs/implementation-slices/)
- [Slice 0 kernel design](docs/implementation-slices/Event-Dynamics-Kernel-Implementation-Design-v1.0.md)
- [Slice 0 progress tracker](docs/implementation-slices/slice-0-progress.md)
- [Local database guide](docs/development/local-database.md)
- [Database permissions and verification](docs/development/database-permissions.md)
- [Debugging journal](docs/debugging/)

Consult the relevant requirements, design sections and architecture
decisions before implementing a component.

Update the progress tracker after meaningful checkpoints. Record
reusable debugging findings in the debugging journal.

## Configuration and Secrets

Do not commit passwords, API keys or real environment files.

Keep local values in ignored environment files. Use committed example
files with placeholders to document required configuration.

The PostgreSQL bootstrap administrator is for database setup and
administration. Application connections must use an appropriately
restricted database account.
