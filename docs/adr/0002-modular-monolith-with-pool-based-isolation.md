# ADR-0002 — Modular monolith with pool-based isolation

**Status:** Accepted
**Context:** Severe correctness requirements (tenant isolation, no overselling, exactly-once issuance) combined with a small measured workload (3.15–7.53 core-equivalents) and a small team. Core invariants span what would otherwise be separate service boundaries.
**Decision:** One application artifact organised into enforced modules, deployed into four independently scaled pools (critical, workspace, public, stream), plus a bulkheaded worker fleet.
**Consequences:** Core invariants stay in single database transactions. Resource isolation is achieved by pool and queue separation rather than network separation. Module boundaries are enforced in CI so future extraction is cheap. Cost: discipline must be maintained by tooling, since the compiler does not enforce a network boundary.
**Alternatives rejected:** Microservices (converts transactional invariants into sagas with no capacity benefit); single pool (violates NFR-CAP-03); serverless (cold start hostile to the latency budgets over a long RTT).
**Revisit when:** A module demonstrably needs an independent scaling or availability profile that pools cannot provide, evidenced by measurement.
