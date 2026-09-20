# ADR-0008 — Allocation-based availability and deterministic locks

**Status:** Amended design baseline; original accepted decision retained except where explicitly superseded below.
**Revision:** 1.1 — 19 September 2026
**Alignment:** Core Entities v1.1; OpenAPI/AsyncAPI v0.2.0; HLD v1.3; Technology Stack v2.2.

## Context and decision

Keep computed availability and transactionally serialized inventory decisions. Supersede the older total-minus-issued-minus-holds formula with the Core Entities v1.1 allocation model.

For each ticket type, and across the event:

```text
consumed = effective unexpired held allocations + issued allocations + withheld allocations
available = configured limit - consumed
```

Released and expired-held allocations do not consume stock. One OrderUnit identifies each purchased ticket unit; InventoryAllocation is authoritative. Counters and public availability caches are rebuildable projections.

## Serialization and transitions

1. Begin the mutation transaction; resolve replay and current domain prerequisites.
2. Lock the Event inventory guard first, then affected TicketType guards in stable ID order.
3. Evaluate capacity using server-authoritative time at the allocation decision after lock acquisition. A stale pre-lock time must not extend a hold.
4. Write the order-unit/allocation transition, effect identity, audit and outbox atomically.

The event-first order explicitly supersedes the original ADR's type-first/event-last order, aligning with HLD §9.1. Both orders can be consistent designs; mixing them across mutation paths is unsafe. Checkout, free issuance, late payment, releases, withholds and capacity changes must follow the same rule. Additional locks must be placed consistently in the implementation's global order.

Late confirmed payment either acquires the entire required unit set or issues no tickets and records a FinancialException. Preserve one-ticket-per-OrderUnit uniqueness. Refund stock return/withhold is independent of the permanent admission restriction.

## Consequences, alternatives and evidence

Cleanup improves storage/query cost but does not determine hold expiry. The event guard is a serialization hotspot to measure, not grounds to move authority to Redis. Short-lived projected counters may accelerate display; they cannot authorize a sale.

Verify final-ticket races, multiple ticket types, withheld stock, expiry during lock wait, free issuance versus paid issuance, duplicate confirmation and late success without enough stock. The existing NFR acceptance suite owns these tests.

This amendment corrects missing withheld stock and aligns the authoritative model/lock order; it does not change event or ticket-type product limits.
