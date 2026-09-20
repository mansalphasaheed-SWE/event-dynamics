# Event Dynamics API review and revision

**Contract version:** 0.2.0  
**Reviewed:** 19 September 2026  
**Baseline:** Core Entities and Domain Integrity v1.1  
**Status:** Revised design contract; implementation and integration evidence still required.

### Ordinary update

Read the resource named by the operation's `x-concurrency-resource`. Keep its strong ETag, for example `"r7"`. Send the permitted partial body with that `If-Match` and a fresh `Idempotency-Key` for the intended operation. Retry an uncertain request using the same key, body and precondition. A committed replay is found before rejecting the now-stale precondition, but current access is always checked first. A new edit uses a new key and a newly reviewed version.

When a command guards an aggregate such as Event or SalesSettings, the command advances that aggregate's revision atomically. Its response ETag belongs to that guard. It may differ from the revision of a nested result object. Do not use a collection ETag to edit a list item.

### Paid or free checkout

Read the current public offer and policy versions. Create a short-lived checkout session, then reserve an order with the accepted type revisions, exact prices and policy evidence. The result supplies an order-scoped access session. Free orders use explicit free confirmation. Paid orders create a durable provider operation and return a truthful pending/uncertain payment attempt while provider work proceeds.

Only trusted, matched provider evidence can establish payment success. Issuance is an independent atomic decision. If the hold expired, reacquire capacity for the entire eligible order or issue no tickets and create exception/refund work. A browser redirect never establishes payment. A duplicate successful charge does not issue duplicate tickets and does not invalidate tickets funded by the valid primary payment.

Email access grants are exchanged in POST bodies. Ticket-scoped grants cannot retrieve sibling tickets or order finances. QR credentials have a separate protected endpoint, and replacing a QR does not replace the ticket identity.

### Offline admission

Prepare an operator-bound device while online. Activate a verified encrypted dataset and a bounded signed admission lease. Each locally committed scan keeps one operation ID and its original authorization, dataset, credential version and trusted-time evidence across every retry.

The upload-only recovery credential permits evidence upload after admission rights expire; it does not permit new admission. A successful upload response means every submitted item has a durable accepted, replay, conflict or review acknowledgement. The client clears only the matching acknowledged record. A conflict preserves the reported physical occurrence; it is not permission to invent a valid ticket or erase the earlier scan.

### AI work

Quote the exact request, then explicitly accept its upper unit bound. Reserve eligible units and queue capacity before accepting work. A proposal is a typed set of supported manual-operation inputs, each with targets, dependencies and reviewed revisions. Approval binds content and does not remove the target operation's own permission, human-approval or integrity requirements.

Execution reports committed, failed and skipped steps truthfully. A pause prevents new automatic steps; it cannot erase committed effects. A material rule edit requires explicit authorization of the new automatic version. Rule triggers and action names use closed registries; the server does not execute a supplied script or arbitrary URL.

### Realtime updates

Use a fetch-based SSE client so bearer authorization and manual resume headers are available. Change messages are invalidations: fetch the current authorized REST representation instead of applying an untrusted or stale patch. Open and buffer the stream before refreshing state, coalesce notices, and never replace a newer resource revision with an older result. Refresh lists for deletion or scope changes.

All channels support ready, resync and revoked controls. Retained delivery cursors are separate from resource revisions. Invalid/expired cursors and buffer overflow require refresh and reconnection; the server must not silently skip a gap. Comment heartbeats and AI liveness messages do not advance replay cursors.

## Domain alignment map

This maps API work to the reviewed domain sections. It does not assert that every internal entity needs a public CRUD endpoint.

| Core v1.1 sections | Contract coverage |
|---|---|
| §§1–3: global rules, identity and authorization | Sessions/challenges, organization and event membership, effective access, shared/local custom roles, sensitive assignment and invitation approvals |
| §4: event operations and places | Lifecycle/publication/archive, sales settings, readiness versions, teams, assignment sets, availability/duty, venue/rooms/areas |
| §5: programme and planning | Working/effective session state, publication, attendee overlap, task dependencies, record links, comments, resource allocations, expense payments and risk/incident scope |
| §6: policy, privacy and knowledge | Versioned policies and decisions, recoverable privacy request status, personal/event/company memory, promotion decisions, item-specific templates |
| §7: sales and financial integrity | Order units, inventory guards, payment attempts, whole-unit/no-ticket refunds, typed ticket-order exceptions, cancellation cases; provider records remain internal |
| §8: ticket and admission integrity | Separate credentials, ticket-scoped access, stable scans, undo/conflict evidence, datasets, capped leases and upload recovery |
| §9: AI work and accounting | Quotes/caps, proposals/decisions, execution steps, section discussion, rule authorization, agreement history, unit lots and ledger views |
| §10: commercial access | Versioned purchase quotes, billing records, subscriptions versus event access grants, usage projections and exactly-once benefit activation requirements |
| §11: infrastructure records | Parent-bound files, scanning/quota rules, notifications/delivery, audit projections, import row decisions and protected export downloads |
| §§13–15: integrity, access and retention | Preconditions, retry semantics, current authorization, atomic effects/audit/outbox obligations, pagination and class-specific retention |

Unassociated provider triage and platform-billing exception adjudication remain restricted internal workflows; they are not exposed through the tenant ticket-order exception routes. A BillingRecord may report `review_required` while that work is unresolved. Internal tables, indexes and worker interfaces still need implementation design.



## Explicit engineering choices

The following operational defaults make the revised design concrete. They are proposals to implement and measure, not new commercial limits or claims of source-mandated values: a minimum 72-hour HTTP replay cache; 24-hour scoped API sessions bounded by their parent grant; 24-hour collection cursors; 10-minute AI quotes; 5-minute billing quotes; SSE buffers capped at 1000 messages or 1 MiB; reconnect backoff from 1–30 seconds; bounded text, arrays and pages. The existing 15-minute checkout hold and 15-minute SSE replay design are retained. Parent credential expiry, access periods and documented NFR requirements always take precedence over a longer default.

Public projections revalidate publication and visibility before cache reuse. Realtime change notices may require more REST reads than pushing full objects. Coalescing, backoff, authorization checks, replay storage and the stricter cache policy must be reflected in a revised capacity calculation. This review does not claim that the earlier cache-hit or request-rate assumptions still hold.

Provider onboarding, webhook verification, billing prices/terms, and device cryptography have explicit release gates. Paid sales and affected platform purchases must remain unavailable until their provider/configuration prerequisites are met. This is a known integration limit, not a hidden completed implementation.


