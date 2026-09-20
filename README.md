# Event Dynamics

An event planning, logistics and ticketing platform.

## Project status

**Status updated:** 20 September 2026

The project is preparing for implementation. The design corpus is organized, and the next setup step is to initialize Git and create the first project checkpoint.

Slice 0 is the first implementation slice. It covers the shared kernel foundations used by later features:

- tenancy and authorization;
- audit;
- idempotency;
- money and time;
- transactional outbox;
- migration, testing and deployment foundations.

The application has not yet been scaffolded. Follow the current implementation handoff and the relevant slice design document for the next action.

## Development status

The project progresses through documented implementation slices. The README gives the project overview; the current handoff records the exact next step and completed work.

Update the handoff after each meaningful checkpoint.

## Selected technology stack

- TypeScript and NestJS
- PostgreSQL
- Drizzle ORM with node-postgres
- Zod
- pg-boss
- pnpm as the package manager

## Documentation

- [Requirements and product brief](docs/requirements/)
- [System design and technology stack](docs/design/)
- [Architecture decision records](docs/adr/)
- [API specifications](docs/api/)
- [Implementation slices](docs/implementation-slices/)
- [Slice 0 kernel implementation design](docs/implementation-slices/Event-Dynamics-Kernel-Implementation-Design-v1.0.md)

Consult the relevant requirements, design documents and architecture
decisions before implementing a feature.

## Development setup

Setup instructions will be added as the application is scaffolded.
Use pnpm for dependency management and project scripts.

## Configuration and secrets

Do not commit passwords, API keys or real environment files.
Use example environment files containing placeholders to document
required configuration.