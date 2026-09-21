# Event Dynamics — Kernel Implementation Design

**Version:** 1.0 · **Date:** 20 September 2026  
**Scope:** HLD §22, Slice 0 — foundations  
**Status:** Design baseline for guided implementation. No application code has been implemented or tested by this document. Adapter verification and later-slice dependencies are explicitly recorded below.

## 1. How to use this document

You do not need to memorize this document. Understand the purpose of a component, then read its section when building it. This document turns the shared architecture into implementation responsibilities, data structures, workflows and test cases. It contains no implementation code or screen designs.

The kernel is the small collection of shared mechanisms used by business modules: tenancy, authorization, audit, idempotency, money, time and outbox. Business modules still own their product rules. For example, the kernel provides exact money calculations; ticketing decides which price applies.

### 1.1 Read only what you need

| Implementation piece | Read here | Relevant source reading |
|---|---|---|
| Project and module boundaries | §§2–4, 13 | HLD §§6, 22; Stack §§2–4 |
| Context and tenant isolation | §§4–5 | HLD §7.3; OpenAPI introductory authorization rules |
| Authorization policy engine | §6 | HLD §8.1; Core §2.5 and custom roles; NFR-SEC-01–04 |
| Shared transaction runner | §7 | HLD §§8.2–8.4, 10.1 |
| Audit storage and writer | §8 | Core §2.40; HLD §8.4; NFR-AUD-01–03 |
| Idempotent command execution | §9 | OpenAPI introductory idempotency/concurrency rules; HLD §§8.2–8.3 |
| Exact money and time | §10 | Stack §5; NFR-INT-02, NFR-UX-06, NFR-PER-16 |
| Outbox and background work | §§11–12 | HLD §10; Stack §7 |
| Verification and handoff | §§14–17 | HLD §22; NFR-ENG-01–04 |

### 1.2 Authority and source register

| Source | Authority used here |
|---|---|
| `event_dynamics_core_entities.md` — supplied file labels itself v1.0 | Available entity attributes and relationships; see version discrepancy below |
| `event_dynamics_functional_requirements.md` — FR-001–FR-263 | Required product behaviour; this document does not add product features |
| `event_dynamics_non-functional_requirements.md` | Security, integrity, retention, performance and engineering targets |
| `Event-Dynamics-HLD-v1.3.md` | Architecture, kernel responsibilities, transaction and delivery boundaries |
| `Event-Dynamics-Technology-Stack-v2.2.md` | NestJS, TypeScript, Drizzle/node-postgres, PostgreSQL, Zod and pg-boss choices |
| `event-dynamics-openapi.yaml` — v0.2.0 | Authoritative HTTP schemas, headers, errors, preconditions and protected operations |
| `event-dynamics-asyncapi.yaml` | Public realtime contract; internal outbox messages are not automatically public messages |
| `Implementation-Acceptance-Scenarios.md` | Existing cross-feature tests; kernel tests below support rather than replace them |
| Frontend Design v1.0 | Interface conventions for later slices; no kernel screens required |

The planning OpenAPI file is a generated view, not a competing editable contract. The traceability matrix is a navigation aid, not proof of implemented correctness. The review guide is explanatory; it does not override requirements or contracts.

**Source discrepancy discovered during validation:** the attached Core Entities file labels itself v1.0, while the reviewed HLD/API refer to v1.1. This document does not certify that this attachment is the revised v1.1. Its Audit Entry structure is used as an input, with the current NFR and revised HLD/API controlling the refinements here. Before implementing authoritative domain schemas, obtain the actual revised Core Entities version and reconcile any differences. The acceptance-scenarios file also ends with an older instruction to complete FR traceability; the supplied 263-row matrix is the current navigation artifact. Neither discrepancy requires inventing missing content or rewriting the kernel.

**Design additions in this document:** physical infrastructure table proposals, component interfaces in prose, a single-transaction short-command strategy, lease-fenced outbox dispatch, local-effect receipts, implementation order and test IDs. These refine the source architecture. They are not claims that the sources already specified every column or algorithm. New choices are identified where introduced. Where a source conflict is found during implementation, record and resolve it rather than silently choosing a convenient interpretation.

## 2. Slice boundary and learning workflow

### 2.1 Included now

- Shared context, policy and transaction interfaces.
- Tenant-aware repositories and database Row-Level Security (RLS: database rules controlling which rows a role can access).
- Audit, replay, outbox and local worker-effect infrastructure tables.
- Exact money and time primitives.
- Module-boundary checks, two-organization isolation fixtures, migrations and a minimal deployment/recovery pipeline.
- A test-only business operation proving the mechanisms work together.

### 2.2 Later slices

Real account/session, invitation, membership, role-management and revocation persistence workflows belong to Slice 1. Full event/task schemas belong to Slice 2. Inventory, payments, admission, offline protocols, notifications and AI business workflows follow HLD §22. We define the interfaces they will use, not their complete schemas now.

No production endpoint, login screen, task page, admin dashboard or real email/payment integration is required to demonstrate Slice 0. Test identity providers must never be registered in a production application.

### 2.3 Build and learn

For each piece: read the indicated section; walk through one normal and one failure case; implement with explanation; run its acceptance tests; record evidence and unresolved issues. Do not require reading the entire corpus before starting a piece.

**Before any implementation begins:** remind the user that they have something to show us. That reminder is due after this kernel design delivery, not after coding has begun.

## 3. Component map and ownership

| Component | Receives | Returns / responsibility | Must not do |
|---|---|---|---|
| HTTP adapter/controller | Raw request and transport credentials | Validated command, response/error mapping | Invent business permissions or independently commit writes |
| Authentication adapter | Credentials appropriate to the entry point | Verified principal | Trust a browser-supplied actor ID |
| Context resolver | Verified principal, requested scope | Established organization/event context or refusal | Treat an identifier as authority |
| Authority provider port | Principal, scope, freshness requirements | Current authority facts and their version | Supply stale authority as current |
| Authorization resolver | Context, action, trusted target attributes, authority | Decision and permitted data/field scope | Mutate business records |
| Application service | Established principal/context and command | Business result | Bypass kernel policy through a non-HTTP path |
| Transaction runner | Context and bounded database operation | Committed result or classified failure | Perform provider/network work within the transaction |
| Scoped repository | Context, scope restriction, active transaction | Owned module records | Access another module's tables |
| Audit writer | Declarative action metadata, filtered changes, transaction | Audit entry | Infer success from an HTTP status or log message |
| Idempotent command runner | Scoped key, canonical digest, command | New committed result, replay or conflict | Repeat an uncertain external effect |
| Outbox writer | Versioned event and transaction | Durable follow-up obligation | Publish directly before commit |
| Dispatcher | Committed pending obligations | Durable queue jobs | Mark dispatch before durable enqueue |
| Worker-effect runner | Validated job identity, current execution context | Deduplicated local database effect | Treat a job payload as permission |

A **port** is an agreed interface: the kernel asks for authority facts without importing Identity's tables. Slice 0 supplies controlled fixtures; Slice 1 supplies the production Identity implementation. Business repositories remain private to their modules. NestJS guards/interceptors may adapt HTTP behaviour, but shared application services remain authoritative across HTTP, workers, scheduler and AI paths.

Dependencies point toward shared interfaces. The kernel does not import Planning or Commerce. A composition root—the startup wiring that chooses implementations—connects the kernel to module-owned providers. Module lint blocks cross-module repository imports and dependency cycles.

## 4. Operation context

### 4.1 Three stages of trust

1. **Raw request:** untrusted IDs, fields, headers and credentials.
2. **Authenticated principal:** identity established by a verified credential or a controlled internal execution mechanism.
3. **Established context:** organization/event ownership and an allowed access path established through trusted services. Specific action authorization is still required.

Keep raw requested scope separate from established context. A TypeScript type alone cannot prove trust; restrict context creation to the resolver and verify its behaviour through tests.

### 4.2 Context contents

| Information | Source and meaning |
|---|---|
| Request/attempt ID | Backend-generated identifier for one attempt; never reused as the business deduplication key |
| Correlation ID | Traces related work; validated incoming hints may be linked but grant no authority |
| Principal kind and stable ID | User, AI job, controlled system execution or verified provider operation |
| Authorizing human, if applicable | Requester/approver for AI or automation; preserve distinct actor and authorizer |
| Organization ID | Established tenant; mandatory for tenant operations |
| Event ID, where applicable | Verified child of the organization; absent for organization-level operations |
| Entry point | HTTP, worker, provider, scheduler or AI; diagnostic provenance, not a privilege |
| Authority version / evidence | Identifies facts used for checks; not a permanent grant |

Request context normally lives in memory. Relevant fields are copied into durable audit/outbox/replay records. Never put bearer credentials, passwords or raw provider secrets in context passed to logs or jobs.

Global authentication and public projection routes do not fake a tenant ID. They use narrow, explicit interfaces. Public projection access returns an allowlisted view; it does not obtain a generic authenticated repository.

### 4.3 Trusted context bootstrap

The resolver uses narrowly exposed Identity/Event ownership services to establish scope. These lookups cannot depend on an already-established tenant context. Their database interfaces must expose only the minimum ownership/access facts for a specified principal and candidate scope, not unrestricted business rows or global lists.

Implement bootstrap access through reviewed, narrowly granted database/service interfaces; if a privileged database function is used, fix its search path, validate all inputs, restrict execution grants and return minimal fields. Do not give the ordinary application role BYPASSRLS. Record each reviewed unscoped lookup. Failure to establish scope produces no ordinary repository access.

Background jobs reconstruct context from durable identities and current authority. A queued snapshot of permissions cannot authorize future work. Provider processing uses a verified provider receipt and restricted system capability, not an invented human membership.

## 5. Tenancy and scoped persistence

**Rule:** organization is the tenant boundary; event and record scopes narrow it further.

### 5.1 Application and database enforcement

Repositories require organization context and apply organization predicates to every read/write. Event-owned records also require matching event ownership. Authorization adds team, location, assignment, visibility and field restrictions where relevant. Apply restrictions before pagination, counting or aggregation.

The transaction runner sets transaction-local organization context on the exact pooled connection used for the queries. RLS read/write policies compare row ownership with that context. Missing context fails closed. Runtime roles must not be table owners, superusers or BYPASSRLS roles; migrations use a separate role. Connection return, rollback and transaction completion must not leave tenant state for the next borrower.

RLS is complementary protection, not an independent authorization engine: a privileged or compromised component that can set arbitrary trusted context can undermine it. Action and event restrictions still belong in application policy and scoped queries.

### 5.2 Relationship constraints

For tenant-owned parents, expose a unique key containing organization ID and parent ID. A child references that pair. For event-owned parents, include organization, event and parent identity where needed. This prevents inserting an event-A child that references an event-B parent. Index child lookup columns used by checks and joins.

Immutable ownership comes from established context on create and cannot be patched. Ordinary domain deletion must not cascade into retained audit, financial or admission evidence.

### 5.3 Isolation fixture without premature domain schemas

Use a disposable test-only schema with minimal organizations, events and a sample work-record table. Seed organizations A/B, events A1/A2/B1, two teams and representative principals. Apply the same RLS and repository mechanisms used by infrastructure tables. Sample records have ID, organization, event, team, status and revision.

These fixtures are not production Organization/Event/Task schemas or public endpoints. Infrastructure migrations can initially carry logical organization/event UUIDs without creating placeholder domain tables. When Slice 1/2 adds authoritative parents, add and validate compatible foreign keys through explicit migrations after checking existing data. This deferred referential constraint is documented technical dependency, not a claim that a UUID alone verifies ownership.

## 6. Authorization decision contract

### 6.1 Inputs and outputs

Inputs: verified principal/context, a closed action identifier, trusted target attributes, current authority facts, current server time and applicable entitlement/approval facts.

Output: allow/deny, internal reason, public refusal category, permitted record predicate, field policy and authority-version evidence. A **predicate** is a condition limiting the database query, such as records belonging to an allowed team. Produce structured policy data; never accept SQL fragments from clients or role definitions.

Unknown actions, missing required facts and unsupported scope combinations deny access. Infrastructure failure is a technical failure with no access granted, not a fabricated ordinary permission denial.

### 6.2 Evaluation

1. Establish tenant/event scope and conceal inaccessible targets.
2. Resolve applicable organization inheritance or legitimate external event membership.
3. Check action capability, target scope and access period.
4. Check sensitive-field grants and their approvals where required.
5. Check commercial entitlement with the contract's issued-ticket/read-only/operational exceptions.
6. Check reserved owner approvals and fresh authentication where required.

Organization Owner inherits event-owner authority; Organization Admin inherits event-manager authority, not owner-only approvals. A suspended internal membership cannot fall back to an old external grant. Do not confuse scheduling status such as off-duty with revoked authority; Identity must map documented membership/access semantics explicitly.

Preserve capability/scope pairs when combining applicable grants. Never take the capability from one narrow grant and the wider scope of an unrelated grant to manufacture additional access. Restrictions within one grant combine as its policy defines; an alternate valid authority path does not bypass global suspensions or reserved approvals. Full fixed/custom-role matrices remain Slice 1 work, grounded in the brief and FRs.

### 6.3 Freshness and races

Correctness-critical authority reads use the primary database. New protected operations must honor committed revocation: before using cached permission data, confirm its authority version against current authoritative state. Inability to confirm blocks the protected operation. The five-second ceiling applies to cached online views/connections and cache residence; it is not permission to accept new revoked mutations for five seconds. Permission-cache lifetime cannot exceed five seconds and cannot outlive a known access expiry. Authority changes increment a revocation version and invalidate affected cached entries. A cached version is useful only if its own freshness is checked; storing a version number indefinitely does not detect revocation.

Design target: invalidate promptly and demonstrate enforcement within the five-second ceiling; do not claim that a five-second cache automatically proves every delivery path meets it. Long-running jobs reauthorize mutating steps. Offline authority follows the later offline protocol, not this online cache policy.

For protected mutations, use the authoritative access/version guard inside the transaction. Slice 1 must make revocation and protected commits coordinate on the same guard. Slice 0 proves that coordination with fixtures. Ordinary transaction snapshots alone do not serialize a permission change against a business write. A mutation already holding the valid guard may finish before the revocation commits; if revocation commits first, the mutation must re-evaluate and refuse the revoked authority. Keep this guarded interval short and free of external calls.

### 6.4 Refusal semantics

Cross-tenant or concealed target: 404 without private details. Legitimately reachable scope with a forbidden action: 403. Invalid/missing authentication follows the endpoint contract. All HTTP failures use the OpenAPI problem response and correlation ID. Internal policy reasons are filtered before exposure.

## 7. Transaction and concurrency contract

The application service owns the business unit of work. One transaction handle reaches the business repository, audit writer, outbox writer and completed replay writer. These components neither commit independently nor start independent nested transactions.

### 7.1 Protected short command

1. Authenticate, validate input and establish context.
2. Recheck current access before looking up a saved protected result.
3. Begin a transaction, install tenant context and claim the scoped idempotency identity where the operation requires it.
4. For a completed matching replay, return its permitted saved result without executing the mutation or rejecting it merely because its original If-Match is now stale.
5. For new work, check current target/action authority, strong precondition and business invariants inside the transaction. Acquire required guards/locks in documented order.
6. Write business change, required filtered audit, required outbox and completed replay result.
7. Commit once, then return the result. No network/provider action occurs within this database unit.

The request's operation metadata decides whether idempotency and If-Match apply; do not impose a new blanket rule on every PATCH or read. Missing required If-Match returns 428, stale returns 412; reject weak/wildcard forms as the contract requires. Check revisions as part of the guarded write so concurrent updates cannot both silently win.

### 7.2 Failure handling

| Situation | Required behaviour |
|---|---|
| Business/audit/outbox/replay write fails | Roll back all successful-effect writes |
| Deadlock or serialization failure with confirmed rollback | Bounded retry of the whole local transaction, with fresh checks; never retry only its last statement |
| Response lost after commit | Reuse the key and recover committed result |
| Commit acknowledgement lost | Treat as uncertain; lookup/retry the same operation identity, never start a new external effect |
| Authorization denied | No business mutation; record minimized failed-attempt evidence when policy requires |
| External provider timeout | Durable operation remains pending/reviewable; provider-specific recovery belongs to its slice |

**New implementation default:** at most three immediate attempts for confirmed transient database aborts, with short jittered delay and a total request-deadline bound. Exhaustion returns a retryable technical failure. This is tunable engineering configuration, not a product latency guarantee. Lock ordering and bounded transactions are still necessary.

## 8. Audit schema and writer

An audit entry is evidence, not an unrestricted copy of a record. The kernel action catalogue declares auditable operations, actor/provenance requirements, change-field policy and business retention class. The application service supplies semantic changes through this contract; HTTP interceptors alone are insufficient.

### 8.1 Proposed `audit_entries` table

All fields are required unless marked optional. Types below are PostgreSQL design types, not migration code.

| Column | Type | Rule / purpose |
|---|---|---|
| id | UUID | Primary key |
| organization_id | UUID | Tenant; RLS and indexed |
| event_id | UUID, optional | Null for organization-level activity |
| actor_type | text with check | user, ai_agent, system, provider |
| actor_id | UUID | Stable user/job/provider-operation identity according to actor type |
| authorizer_id | UUID, optional | Human authorizer when applicable |
| action | text | Closed structured action catalogue |
| target_entity_type / target_entity_id | text / UUID | Logical target reference; tenant ownership verified by owner module |
| previous_values / new_values | JSONB, optional | Filtered changes, not whole unrestricted entities |
| changed_sensitive_fields | JSONB array | Field names only; empty by default |
| request_id / correlation_id | UUID / text | Attempt identity and bounded diagnostic linkage |
| effect_id | UUID, optional | Stable business effect, independent of HTTP retries |
| device_id / admission_mode / rule_reference | text, optional | Validated provenance only where applicable |
| outcome | text with check | success, failure, partial |
| occurred_at / created_at | timestamptz | Server-established event time and insertion time |
| retention_class / retention_subject_id | text / UUID | Associated class and subject whose policy governs expiry |
| schema_version | integer | Positive audit format version, initially 1 |

`occurred_at` is the physical name for Core Audit Entry's `timestamp`; map explicitly if exposed through an API. Device-reported occurrence time is separate provenance, never substituted for server time. A system actor uses a durable execution/job identity, not a fabricated user. A target reference is polymorphic (can identify different entity types), so it cannot have one ordinary foreign key to all domain tables. Owner services validate it before audit creation.

Indexes: (organization_id, event_id, occurred_at, id) for event history; (organization_id, target_entity_type, target_entity_id, occurred_at, id) for record history; (organization_id, actor_type, actor_id, occurred_at, id) for investigations. Add request/correlation lookup indexes only where justified by actual diagnostic queries.

Prevent deletion of a membership from erasing its historical actions. Do not use cascading membership/user deletion on audit references. Privacy transformations follow the controlled retention workflow and retain necessary attribution without preserving unnecessary identity.

### 8.2 Privileges and minimization

Runtime mutation roles receive scoped insert and permitted read, not update/delete/truncate or table ownership. The retention role is separate. Corrections append another entry. These grants do not make data impossible for a privileged administrator to alter.

Allowlist fields per action/entity. For emergency, food/access needs and raw AI prompt fields, record only that the field changed. Never copy bearer tokens, passwords, QR secrets or full provider payloads. Restrict audit reading and exports by tenant, event, action and field policy.

Successful changes and required audit commit together. A required failure-attempt record is written through a separate minimized transaction after rollback; otherwise rollback would erase that evidence. If even that fails, emit a sanitized operational alert and retain a technical-failure response—never claim durable audit was recorded.

### 8.3 Retention and partitioning

Audit follows its associated business class: financial evidence follows the product's seven-year minimum and holds; operational evidence follows the applicable operational/event policy. Financial clocks use latest associated activity as specified in NFR-PRI-02, not the audit row's creation date alone. A retention policy service resolves current eligibility and legal/dispute holds from the owning domain. Unresolved policy means retain and alert, not guess.

Start with an unpartitioned table for foundation correctness. HLD §7.5 explicitly treats partition layouts as candidates. Introduce partitioning only after proving uniqueness, retention and migration behaviour. Never drop a time partition merely because its creation dates are old.

## 9. Idempotency schema and execution

### 9.1 Identity and canonical input

The scoped identity consists of principal kind/ID (or checkout-session identity), organization, stable operation name, target scope and client key. Include the event in target scope for event commands. Use a non-null target-scope representation; do not rely on nullable unique columns accidentally enforcing uniqueness.

The fingerprint covers the contract-normalized path, material query/body fields and material preconditions such as If-Match. Preserve omitted versus explicit null and order-sensitive arrays. Exclude transport credentials, tracing IDs and the idempotency key itself. Use deterministic serialization and a versioned SHA-256 digest. Reject unknown input fields before digesting. Never hash raw JSON formatting and treat reordered keys as changed business intent.

### 9.2 Proposed `idempotency_records` table

| Column | Type | Rule |
|---|---|---|
| id | UUID | Primary key |
| organization_id | UUID | Tenant boundary |
| principal_kind / principal_id | text / UUID | Verified caller or checkout identity |
| operation / target_scope / key | text | Non-null, bounded by API and internal catalogues |
| fingerprint_version / request_digest | integer / bytea | Digest algorithm/normalization version and 32-byte SHA-256 |
| state | text with check | in_progress, completed, failed_retryable |
| effect_id | UUID | Stable local operation identity |
| response_status / response_body / response_headers | integer / JSONB / JSONB, optional | Allowlisted replay representation |
| first_accepted_at / expires_at | timestamptz | Expiry at least 72 hours from first acceptance |
| completed_at | timestamptz, optional | Required on completed records |
| request_id / correlation_id | UUID / text | Originating attempt provenance |
| lease_owner / lease_until / lease_generation | UUID / timestamptz / bigint, optional | Reserved for explicitly designed durable orchestration; unused for short commands |

Unique constraint: (organization_id, principal_kind, principal_id, operation, target_scope, key). Index completed expiry for cleanup. Validate completed response metadata and timestamp consistency. Do not log keys or response bodies indiscriminately. Scoped records prevent one caller replaying another caller's response.

Replay bodies must exclude secrets unless a separately designed protected credential workflow explicitly permits secure replay storage. Store only headers needed for replay, such as Location and ETag; regenerate current correlation/security headers. Recheck current read/field access before replay. If the snapshot can no longer be safely disclosed, refuse it rather than leaking it; do not rerun the original operation.

### 9.3 Chosen short-command algorithm

**New refinement of HLD §8.2:** insert the claim and complete the effect in one transaction. An uncommitted in-progress row may block a competing unique insert. Use a bounded idempotency-claim lock wait; on contention roll back that attempt and return 409 `operation_in_progress` with Retry-After. A subsequent attempt reads the committed record or becomes the new owner if the original transaction rolled back. This path does not require a separately committed lease claim.

For an existing committed row: compare digest before returning a result; mismatch is 409 `idempotency_conflict`. For a matching completed row, authorize access and replay before evaluating the old If-Match as a new mutation. Only the owning transaction inserts business/audit/outbox effects.

Uncommitted crashes roll back the short-command claim and effects together. A persisted in-progress row from another orchestration mode must not be stolen merely because time passed; use that mode's fencing and recovery contract. The kernel does not enable an unfinished second claim strategy by default.

### 9.4 Async operations and retention boundary

A long-running command commits an accepted job/operation plus audit/outbox and its HTTP acceptance response. The replay is that acceptance result; it is not fabricated job completion. Subsequent job steps have stable effect identities. Provider uncertainty belongs in ProviderOperation and reconciliation, not in an open HTTP transaction.

Cleanup selects resolved, eligible records after the replay window; unresolved work is not erased. Expiry removes retry-response protection, not permanent domain uniqueness. Future tickets, admissions and financial effects require their own durable identity constraints. A new key for a genuine new operation is allowed even if the inputs resemble an earlier operation.

## 10. Money and time primitives

### 10.1 Money

The money value contains integer minor units and a currency identifier. Use internal TypeScript bigint and database BIGINT. Validate storage bounds; API nonnegative amounts also remain within JavaScript's exact JSON integer maximum, 9,007,199,254,740,991. Convert at the boundary only after validation. Never hand bigint directly to JSON serialization.

Operations: construct/validate, compare, add/subtract same-currency values, multiply by an integer quantity and explicitly allocate a total. Signed derived budgets use a distinct representation; negative charges/refunds remain invalid. Paid ticket currency is SLE; do not assume platform billing uses the same currency.

Percentage calculation uses integer numerator/denominator and requires an explicit rounding mode and policy version. The kernel supplies the exact mechanism; a domain must choose its approved commercial rounding rule before enabling that calculation. There is no silently selected global rounding rule. For split allocations, require a documented stable remainder distribution so shares sum exactly to the original total.

No money table is required. Persist monetary values in the owning module's tables when those modules are designed. Format localized display at presentation boundaries; currency precision comes from a controlled currency catalogue.

### 10.2 Time

Persist instants as timestamptz and separately preserve the applicable IANA zone, such as Africa/Freetown. A database timestamp does not retain the originally entered named zone. Event schedules and validity use the event zone as authority. Reject ambiguous local-only timestamps unless a documented input flow resolves them.

Provide a clock interface for current instants and a separate monotonic timer for elapsed durations. Tests inject a controlled clock. Expiry checks use authoritative server/database time; the browser's countdown cannot extend a deadline. Evaluate expiry at the guarded decision point, including after material lock waits; do not use an old transaction-start time to extend rights.

**New default for intervals:** start inclusive, end exclusive—valid at the start, expired at the end—unless a domain contract expressly specifies otherwise. Null access end means resolve the domain's default, not infinite access by accident. Reject nonexistent local times at clock changes; ambiguous times require an explicit offset/choice rather than silent guessing.

A reservation fixture proves expiry without a real ticket schema. Offline trusted-time anchors, device reboot/rollback detection and uncertainty handling remain Slice 6.

## 11. Outbox schema and dispatch

### 11.1 Event envelope

An internal event describes a committed fact or follow-up obligation. Include event ID, type, schema version, organization/event scope, target identity/revision, occurrence time, correlation, origin effect and minimal payload. One outbox obligation targets one named consumer route; fan-out creates separate obligations sharing the original event identity.

Do not publish internal payloads directly to browsers. Realtime projection, filtering and AsyncAPI messages belong to Slice 7.

### 11.2 Proposed `outbox_entries` table

| Column | Type | Rule |
|---|---|---|
| id / event_id | UUID / UUID | Obligation primary key and stable source event identity |
| organization_id / event_scope | UUID / text | Tenant and explicit organization/event scope |
| event_type / schema_version | text / integer | Registered internal event contract |
| target_type / target_id / target_revision | text / UUID / bigint, optional revision | Trusted origin record |
| origin_effect_id / consumer_route | UUID / text | Stable source effect and registered destination |
| payload | JSONB | Minimal validated data, no credentials |
| occurred_at / created_at / available_at | timestamptz | Event, storage and next dispatch times |
| status | text with check | pending, leased, dispatched, blocked |
| attempt_count / lease_generation | integer / bigint | Nonnegative; generation advances on each claim |
| lease_owner / lease_until | UUID / timestamptz, optional | Required while leased |
| dispatched_at / queue_job_id | timestamptz / text, optional | Set only after durable enqueue |
| correlation_id / retention_class | text / text | Trace and inherited obligation class |
| last_error_code | text, optional | Sanitized classification, never raw secret-bearing exception |

Unique (organization_id, event_id, consumer_route). Add a ready-work index on (status, available_at, created_at, id), an expired-lease index and a tenant/effect lookup index. Validate lease/status consistency and known route/type/version combinations. No ordering claim follows from timestamps alone; consumers use revisions and owning-domain rules when order matters.

### 11.3 Dispatcher workflow

1. In a short transaction, claim a bounded ready batch with row locking and skip locked rows. Set lease owner, expiry and incremented generation; commit.
2. Validate the registered route/version. Enqueue with the stable obligation identity in the appropriate pg-boss lane.
3. Only after durable enqueue, mark dispatched in a separate transaction guarded by obligation ID, lease owner and generation.
4. On recoverable failure, schedule retry with backoff. On repeated or nonretryable failure, retain a visible blocked obligation and alert. Never silently discard it.

**Fencing** means an old worker cannot update state after a newer worker has taken over: its lease generation no longer matches. An expired dispatcher may still enqueue a duplicate, which is why consumer effect identity remains necessary.

The dispatcher requires cross-tenant discovery, but not unrestricted business access. Use a separate role/interface confined to claim/acknowledge outbox obligations and pg-boss operations. Tenant application roles cannot use this administrative path. Workers re-establish the job's tenant context and use normal business interfaces.

Adapter verification must confirm durable enqueue and how ambiguous enqueue outcomes are recovered. An atomic enqueue/mark adapter is optional, not assumed. The baseline tolerates the crash between enqueue and marking. pg-boss owns its own schema/migrations; do not hand-edit or partition its internal tables.

## 12. Worker effects, retries and recovery

### 12.1 Proposed `consumer_effects` table

| Column | Type | Rule |
|---|---|---|
| organization_id / consumer_name / effect_id | UUID / text / UUID | Composite primary key |
| input_digest / digest_version | bytea / integer | Detect same identity with changed input |
| completed_at | timestamptz | Server completion time |
| result_reference | JSONB, optional | Minimal durable result identity |
| retention_class / retention_subject_id | text / UUID | Inherit effect's domain retention |

For a local database effect, insert/check this receipt in the same transaction as the effect, audit and downstream outbox. A conflict with matching digest means already applied; a changed digest is an integrity error, retained for investigation. An uncommitted receipt is not a completed effect. Queue acknowledgement occurs after commit. If acknowledgement is lost, redelivery observes the receipt and does not repeat the effect.

Receipt retention must cover the permitted redelivery/recovery horizon. Financial/admission identities inherit their stronger domain requirements; do not give every effect the 72-hour HTTP replay expiry. Owning modules may use their own stronger uniqueness instead of duplicating receipts, with explicit evidence of equivalent protection.

### 12.2 External effects

An email or payment cannot share a PostgreSQL transaction. Use a durable delivery/provider operation with stable identity, provider-supported idempotency where available and reconciliation after uncertainty. Do not mark an effect complete before sending, or assume a crash after sending means nothing happened. Slice 0 uses a controlled fake external provider to demonstrate the uncertainty boundary; actual provider schemas and APIs remain later-slice work.

### 12.3 Queue operation

Retain HLD lane separation: fresh payments and admission synchronization are protected from AI, bulk jobs and replay traffic. A queue priority setting alone does not isolate CPU or memory. Slice 0 wires a sample worker and configuration conventions; future lanes add separately bounded processes as their modules arrive.

Expose pending/blocked obligation counts, oldest pending age, dispatch latency, duplicate receipts, lease recoveries and sanitized failure reasons. Queue depth without age can hide a stuck obligation. On shutdown stop claiming new work, allow a bounded completion window and leave unfinished leases/jobs recoverable. Verify actual adapter behaviour before selecting production timeout and retry values.

## 13. Physical delivery and engineering foundations

### 13.1 Migration plan

1. Separate migration/runtime/dispatcher/retention roles and schemas; prove privilege limits.
2. Create infrastructure tables in §§8–9, 11–12 with constraints, indexes and RLS.
3. Declare a data/recovery class for every table and a retention-policy owner.
4. Install test-only domain fixtures only in disposable test environments.
5. Add production parent foreign keys with Slice 1/2 as described in §5.3; validate before dependent production features are enabled.

Money and time have no dedicated storage table. Context is in memory. Authority storage is module-owned; the kernel consumes a port. There is deliberately no complete platform schema here.

Hand-review RLS, triggers and any later partitioning SQL. Verify clean install and forward upgrade with seeded data. Use expand/contract changes: add compatible structure first, migrate usage/data, remove old structure only after no deployed reader/writer needs it. Old workers must understand queued event versions during deployment; incompatible messages remain recoverable instead of being discarded.

### 13.2 Build and deployment checks

The pipeline performs type/static checks, contract checks, module-boundary lint, real-PostgreSQL integration tests and affected concurrency/failure tests. Exact dependency versions are pinned when implementation begins; this document does not invent package APIs or claim compatibility was tested.

The minimal deployment demonstrates reproducible configuration, secret injection outside source control, database migration sequencing, app/worker startup, health/progress checks and bounded shutdown. Record a rollback or forward-fix rehearsal preserving pending outbox/jobs and committed effects. The NFR's 15-minute deployment recovery target remains an acceptance target, not a design result.

Required configuration categories: database and role connections, permitted origins, request/transaction/lock deadlines, idempotency wait/retry settings, dispatcher batch/lease limits, queue lane concurrency, audit field policies, retention-policy versions and monitoring destinations. Reject missing security-critical settings at startup; never enable test authentication as a fallback.

## 14. Acceptance plan

**All tests below start as NOT RUN.** A scenario description is not test evidence. Use real PostgreSQL for constraints, RLS, locks, rollback and process termination. Unit tests suffice for pure money/time logic. One test-only command changes a fixture record, writes audit/outbox and stores replay; a test worker changes a separate fixture projection with a receipt.

| ID | Scenario and required observation | Source |
|---|---|---|
| K-01 | Missing/forged context cannot read or write tenant records | HLD §7.3; NFR-SEC-01 |
| K-02 | A/B tenant swaps fail across get/list/write/count and referenced-parent cases | HLD §7.3; NFR-SEC-03 |
| K-03 | Same organization, wrong event/team: no out-of-scope rows or totals | HLD §8.1 |
| K-04 | External membership succeeds without org membership; suspended internal access cannot use stale external fallback | OpenAPI authorization |
| K-05 | Return a connection after commit and rollback; next tenant cannot inherit its scope; raw SQL still obeys RLS | HLD §7.3 |
| K-06 | Runtime roles cannot bypass RLS, update/delete audit or invoke dispatcher-only interfaces | HLD §§7.3, 8.4 |
| K-07 | Equivalent manual/AI/worker attempts receive equivalent policy decisions for the same authority | NFR-SEC-03 |
| K-08 | Revoke/change authority; cache and guarded writes enforce the defined freshness and race policy | NFR-SEC-04; §6.3 here |
| K-09 | Unknown permission and forged custom-role escalation deny; grant composition cannot widen scope accidentally | HLD §8.1 |
| K-10 | Inject failure at business, audit, outbox and replay writes: no partial successful effect commits | NFR-AUD-01; NFR-INT-07 |
| K-11 | Kill process before commit: rollback; after commit before response: one effect and replayable result | HLD §8.2 |
| K-12 | Concurrent same-key requests: one effect; contenders replay or receive operation_in_progress with Retry-After | OpenAPI idempotency |
| K-13 | Same key with changed payload or material If-Match: idempotency_conflict | OpenAPI idempotency |
| K-14 | Completed same-key replay with original now-stale If-Match succeeds after access check; new stale mutation fails 412; missing precondition fails 428 | HLD §8.3; MUT-01–03 |
| K-15 | Access revoked before replay: saved private response is not disclosed; effect is not repeated | OpenAPI authorization/idempotency |
| K-16 | Digest normalization preserves null/omission and ordered arrays; harmless object-key reordering matches | §9.1 refinement |
| K-17 | Replay expiry leaves domain/effect identities intact; unresolved obligations are not cleaned | NFR-INT-04; MUT-04 |
| K-18 | Sensitive audit changes contain field names only; actor/authorizer provenance survives membership removal | NFR-AUD-02–03 |
| K-19 | Required failed-attempt evidence survives business rollback; unavailable evidence storage produces visible technical failure | HLD §8.4 |
| K-20 | Money rejects currency mismatch, float/fractional minor input, overflow and negative paid values; exact allocations preserve totals | NFR-INT-02 |
| K-21 | Expiry at exact boundary and after lock wait; client clock/reload cannot extend it | NFR-PER-16; NFR-UX-06 |
| K-22 | Named-zone clock changes, ambiguous/nonexistent times and midnight/multi-day boundaries behave explicitly | NFR-UX-06 |
| K-23 | Crash before enqueue: lease recovery dispatches; crash after enqueue before marking: duplicate is safe | HLD §10.1 |
| K-24 | Stale dispatcher lease cannot acknowledge a newer claim; blocked jobs remain visible/recoverable | §11.3 refinement |
| K-25 | Worker dies after effect commit before acknowledgement: redelivery creates no second effect/audit | NFR-INT-04/07 |
| K-26 | Same effect identity with changed digest is rejected; wrong tenant job cannot access another tenant | NFR-SEC-01; §12 |
| K-27 | Fake external provider succeeds then times out: result remains uncertain and original identity is reconciled | NFR-INT-06 |
| K-28 | Retention respects associated activity and holds; cleanup cannot cascade into retained evidence | NFR-PRI-02–05 |
| K-29 | Cross-module internal import and missing table classification fail CI | HLD §§6–7 |
| K-30 | Clean/upgrade migration and deployment recovery preserve pending work; test identity wiring is absent in production | NFR-ENG-02–04 |

For each implemented test record test name/path, revision, environment, run time, observed outcome and evidence location. Do not mark the wider payment/offline/SSE scenarios passed merely because their shared kernel fixtures passed.

## 15. Implementation order and exit checklist

| Step | Deliverable | Tests / review focus |
|---|---|---|
| 0A | Project wiring, module rules, configuration, real database harness | K-29; production/test separation |
| 0B | Money/time primitives | K-20–22 |
| 0C | Context, authority ports, tenant repository and RLS fixtures | K-01–09 |
| 0D | Transaction runner and audit migration/writer | K-10, K-18–19 |
| 0E | Idempotent command runner and replay storage | K-11–17 |
| 0F | Outbox dispatcher, pg-boss adapter, worker receipts | K-23–27 |
| 0G | End-to-end fixture, retention safety, migration/deployment rehearsal | K-10–11, K-28–30 |

Exit requires: all applicable kernel tests passing with evidence; two-organization isolation suite green; audit transactionality demonstrated; module lint blocking; restart recovery demonstrated; migrations/deployment repeatable; test-only identities absent in production wiring. A runnable fixture is not a production-ready identity system or evidence that every NFR target is achieved.

## 16. Decisions and implementation gates

| Item | State / resolution point |
|---|---|
| Seven kernel mechanisms and chosen stack | Established by HLD/Stack; retained |
| Single-transaction short-command idempotency | Selected here; verify contention behaviour in K-12 |
| Outbox enqueue then fenced mark; duplicate-safe consumers | Selected here; prove with real process crashes |
| Unpartitioned kernel tables initially | Selected here under HLD's candidate-partition policy; reassess with measured need |
| pg-boss and transaction adapter APIs | Inspect pinned library APIs during 0F; do not assume atomic enqueue/mark or provider exactly-once effects |
| Dispatcher lease/batch/timeouts | Tune during 0F against observed operation times; short leases must not cause uncontrolled duplicate traffic |
| Production identity, revocation guard and role matrix | Slice 1; fixture port behaviour is specified now |
| Attached Core Entities version mismatch | Obtain revised v1.1 before production domain schemas; compare against the supplied v1.0-labelled attachment |
| Authoritative Organization/Event foreign keys | Slice 1/2 migration dependency, explicit validation before dependent features launch |
| Commercial rounding, prices and billing currency | Owning feature before enabling affected charges; no arbitrary price/policy chosen here |
| Monime requests, signatures and reconciliation APIs | Payment slice, deferred by user; no payment integration enabled here |
| Offline time/keys/device durability | Slice 6 |
| Privacy wording and market obligations | Launch gate per NFR-PRI-07; product retention rules are not legal advice |
| Full throughput, disaster recovery and NFR acceptance | Measured in relevant slices and hardening; not certified by this design |

These are bounded implementation/provider dependencies, not a reason to redesign the whole platform. Resolve a gate immediately before the piece that needs it. Record substantive design changes in this document and the authoritative contract/ADR if affected.

## 17. Handoff for the next conversation

**Current state:** kernel design documented; no repository initialized or application code written in this task; all K-tests not run. Existing HLD v1.3, Stack v2.2 and API v0.2.0 remain the baseline. Earlier conversational examples were teaching examples, not implemented endpoints or schemas.

**User workflow:** learn through implementation, one piece at a time; no requirement to memorize or read the whole corpus first. Start at 0A and establish the actual repository/environment instead of assuming one exists.

**Future chat continuity:** attach this document to project sources alongside the current authoritative corpus. At each piece/slice completion, update this section with repository/branch/commit, files changed, tests and evidence, open gates and exact next step. A new chat should read that current handoff and relevant sections; it should not infer progress from a past plan.

**Screens:** none needed for Slice 0. For later slices, prepare a separate-chat wireframe brief containing users, workflow, permission boundaries, API data/actions, loading/empty/error/success states and the frontend visual reference. Bring the result back for contract/workflow review. A mockup is not approval to change domain or API rules.

### Small glossary

| Term | Plain meaning |
|---|---|
| Kernel | Shared safety and reliability mechanisms used by modules |
| Port | Agreed interface through which a component obtains a capability |
| Adapter | Implementation connecting an interface to HTTP, a database or a library |
| Predicate | Condition restricting which records a query may access |
| Transaction handle | Reference keeping participating writes in the same transaction |
| Fingerprint | Stable digest of the material request contents |
| Lease | Temporary ownership of work, with an expiry |
| Fencing generation | Increasing claim version that prevents stale owners changing newer state |
| Outbox | Committed obligation to process follow-up work |
| Effect receipt | Durable evidence that a specific consumer already applied a local effect |
| Expand/contract migration | Add compatible structure, move usage, then retire the old structure |

### Revision history

| Version | Change |
|---|---|
| 1.0 | Consolidated kernel teaching/design decisions into scoped implementation guidance; specified infrastructure schemas, failure recovery, Slice 0 engineering work and 30 acceptance scenarios. |
