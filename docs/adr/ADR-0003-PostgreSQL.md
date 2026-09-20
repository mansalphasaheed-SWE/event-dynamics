# ADR-0003 — PostgreSQL as the business system of record

**Status:** Amended design baseline; original accepted decision retained except where explicitly superseded below.
**Revision:** 1.1 — 19 September 2026
**Alignment:** Core Entities v1.1; OpenAPI/AsyncAPI v0.2.0; HLD v1.3; Technology Stack v2.2.

## Context and decision

Keep one PostgreSQL primary, a synchronous standby in a separate availability zone, an asynchronous read replica, and recoverable backups/WAL history. These support multi-record transactions, inventory guards and the existing recovery objectives. PostgreSQL is authoritative for Event Dynamics business state; provider-confirmed financial facts remain authoritative about external payments.

Money uses integer minor units, stored as BIGINT and exposed within the API's safe-integer bounds. Constraints, locking, authorization and recovery procedures implement invariants; selecting PostgreSQL does not implement them automatically.

## Consequences and limits

- Use the primary for inventory, admission, authority and financial correctness. Replica lag is acceptable only for explicitly permitted reporting/derived reads; current access must still be checked.
- Synchronous standby covers its defined instance/AZ failure scope. It does not establish entire-region recovery. Specify independently available recovery copies, restore destination, archive lag and reconciliation time before claiming the regional RPO/RTO.
- Partitioning is optional physical design, not a promise that retention is always a partition drop. Retain legal holds, unresolved obligations and records whose latest associated activity extends retention. Prove uniqueness for provider effects, ticket issuance and admission operation IDs across the chosen partition scheme.
- PostgreSQL partitioned-table unique constraints have restrictions involving the partition key. The schema design must preserve domain-wide uniqueness explicitly. [PostgreSQL partitioning documentation](https://www.postgresql.org/docs/current/ddl-partitioning.html).

## Alternatives and revisit

Document stores, a separate ledger service and distributed SQL are not selected for this workload. This is a fit/complexity decision, not a claim that those technologies cannot support transactions.

Retain the review trigger of sustained database CPU above 60% of the tested envelope or working-set pressure. First inspect query/lock behavior and safe replica offload, then pruning/sizing, then engine reconsideration. The volume estimates are modelling inputs.

## Evidence and amendment

Required implementation evidence belongs in the existing acceptance work: commit latency, instance/AZ failover and regional restore/reconciliation against the NFR targets. None was supplied with the original ADR.

This revision retains the engine/topology choice, aligns money representation and narrows the original “all invariants enforceable” and “retention is a drop” claims. HLD §§7, 14–15 hold the detailed design.
