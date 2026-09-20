# ADR-0005 — Transactional outbox with PostgreSQL-backed queues

**Status:** Amended design baseline; original accepted decision retained except where explicitly superseded below.
**Revision:** 1.1 — 19 September 2026
**Alignment:** Core Entities v1.1; OpenAPI/AsyncAPI v0.2.0; HLD v1.3; Technology Stack v2.2.

## Context and decision

Keep the domain mutation, attributable audit and outbox obligation in one PostgreSQL transaction. Acknowledged provider receipt includes a durable event identity and recoverable processing obligation. Use PostgreSQL-backed worker lanes with independent consumers and bounded concurrency; pg-boss is the stack's selected queue library.

The outbox-to-queue dispatcher can use a separate transaction. It must never mark work dispatched before durable enqueue. A crash after enqueue but before marking may cause a duplicate, which is harmless only with stable job/effect identities and idempotent consumers. Use an atomic enqueue/mark where supported by the actual adapter, otherwise retain this replay-safe handoff.

## Consequences

- Being in the same database does not make two independent commits atomic.
- Delivery remains at least once. Queue retries do not guarantee exactly-once business effects; database uniqueness, state guards and provider-operation identities do.
- Cleanup may remove disposable payloads only after preserving unresolved obligations and required long-lived deduplication/effect identities.
- pg-boss owns its internal schema. Do not impose handwritten partition/claim DDL on library tables without a supported migration path. “Postgres-backed” is the decision; queue partitioning is not mandatory.
- Queue load shares database resources with business transactions. Separate workers still need connection budgets and interference tests.

## Alternatives and revisit

Kafka, RabbitMQ, SQS and Redis-backed queues remain unselected to limit operational surfaces. They can also be fed safely through an outbox; they are not intrinsically incompatible with durable delivery. The rejected design is an unrecoverable business-write/message dual write.

Revisit when measured enqueue/claim load consumes approximately 20% of database write capacity or independent replay needs exceed retained outbox history. The modelled 150 events/s is a test input, not throughput evidence.

## Amendment

Retains transactional outbox and isolated Postgres-backed lanes; clarifies dispatcher crash recovery, library schema ownership and the reason for declining a separate broker. HLD §10 holds lane/deadline details.
