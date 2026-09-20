# ADR-0009 — Two-lane payment processing with prompt restrictions

**Status:** Amended design baseline; original accepted decision retained except where explicitly superseded below.
**Revision:** 1.1 — 19 September 2026
**Alignment:** Core Entities v1.1; OpenAPI/AsyncAPI v0.2.0; HLD v1.3; Technology Stack v2.2.

## Context and decision

Retain fresh-success and replay/other lanes, implemented as payment.fresh and payment.replay in the HLD, with independent workers, reserved capacity and bounded database connection use. The modelled burst motivates isolation; it does not establish that a 15-second P99 deadline is met.

Classify only after provider authentication and durable event/processing-obligation receipt. Classification is an internal scheduling hint, not provider financial truth.

## Routing rules

- A new trusted success capable of fulfilling an order, or an ambiguous event that may require prompt financial work, goes to the fresh lane.
- Only known duplicate/completed effects and proven nonurgent status work receive the relaxed replay deadline.
- A refund, reversal, dispute or other restriction-producing event must not wait behind a replay backlog. Use protected priority within the fresh lane or another explicitly reserved consumer arrangement; preserve the required ticket-restriction behavior.
- A duplicate delivery whose original obligation is unfinished recovers that obligation; it must not be discarded as “already processed.”
- Recheck durable state on claim. A concurrent state change can invalidate an ingress classification.

## Consequences and limits

An order's terminal workflow state does not mean every later payment is harmless. A second successful charge can require an exception/refund obligation; late success may require whole-order reacquisition. Historical PaymentConnection and ProviderOperation identities remain the matching authority.

Size reserved capacity using measured service times, mixed urgent events, replay storms and database contention. Aggregate throughput of 150/s alone cannot prove tail latency or meet a burst when arrival and service rates leave no headroom.

## Amendment and evidence

Retains conservative routing and two-lane isolation. Replaces “the issuance deadline is met” with a testable capacity hypothesis and closes the risk of routing all non-success events to delayed work. Provider wire verification remains deferred to payment implementation under the existing Provider Integration Gates. HLD §§9.2 and 10.2 own flow and capacity budgets.
