# Event Dynamics — Technology Stack

**Company:** Tabempa Engineering
**Document:** Technology Selection Record
**Version:** 2.2
**Date:** 19 September 2026
**Follows:** Event Dynamics HLD v1.3, Core Entities v1.1, OpenAPI/AsyncAPI v0.2.0 — every decision below implements a normative architecture/contract decision and never invents an external provider wire detail.
**Status:** Technology baseline reconciled with the eight reviewed ADRs; vendor, device, cost and performance acceptance remains outstanding.

**Scope note.** This is a **technology and vendor selection record**, not an architecture document. It answers "which language, framework, database, and hosting provider" for decisions the HLD already made at the architecture level — for example, "PostgreSQL as the system of record" is an HLD decision; "PostgreSQL on AWS RDS Multi-AZ" is this document's decision. It is **not** a Deep Dive in the system-design-interview sense of the term. Deep, failure-mode-level treatment of the hardest problems in this system — inventory contention under concurrent load, payment idempotency, offline conflict resolution, AI job scheduling fairness — already exists in HLD §9 (Critical Flow Designs) and §20 (Architecture Decision Records), with sequence diagrams and rejected-alternative reasoning at that level of depth. A dedicated Deep Dives document, if one is produced, would extend that material further rather than duplicate what this document covers.

Each decision below is recorded as: the requirement that forces it → the real options considered → the decision → what was rejected and why. Choices marked **provisional** remain behind a measurement, provider, or ADR gate; they are not launch commitments. Section 17 is the full stack at a glance.

---

## 1. Backend language and runtime — TypeScript on Node.js

**Constraint.** HLD ADR-0007 already requires three separate frontend clients, all necessarily web/JS-based technology (an edge-cached storefront ships minimal JS by design; a native mobile shell for check-in still runs a JavaScript engine; a rich SPA needs a modern framework). TypeScript is therefore already the frontend language regardless of backend choice. The remaining question is whether the backend matches it.

**Reasoning.**
- A single OpenAPI spec becomes the source of truth for types across the entire stack — backend request/response shapes and all client API clients generated from the same file. A mismatch between what the backend sends and what a client expects becomes a compile error rather than a runtime bug. For a single-engineer team with no second reviewer to catch integration drift, this is one of the highest-leverage decisions in the stack.
- The workload is expected to involve substantial database/provider I/O. Capacity §10 estimates 3.15 sustained and 7.53 burst core-equivalents; these are modelling inputs, not measured results. Verify Node event-loop latency and CPU-heavy work under mixed load.
- SSE (HLD ADR-0001) holds long-lived, mostly-idle connections — again the shape Node's event loop is built for. Python's asyncio can do this too, but as a secondary pattern in an ecosystem that still defaults to synchronous code; Node's non-blocking model is the default.

**Where Python was the stronger contender, and why it was set aside.** Python's `Decimal` is a first-class stdlib type, more natural for NFR-INT-02's exact-money requirement than anything in JS out of the box, and the AI/ML ecosystem has historically been Python-first. Neither tips the decision: money is handled by storing integer minor units (§5), a technique that works identically in any language and avoids the floating-point problem entirely rather than depending on a nicer decimal type. And this system calls a hosted AI API rather than training models — Anthropic's and OpenAI's TypeScript SDKs are equally complete to their Python equivalents, including tool-calling.

**Decision: TypeScript on Node.js (LTS), across the backend and all frontend clients.**

Strict mode (`strict: true`) is required in `tsconfig.json` from the first commit. A loosely-typed TypeScript codebase forfeits the safety benefit above while keeping the syntactic overhead.

---

## 2. Backend framework — NestJS

**Constraint.** HLD §6 specifies enforced module rules (MOD-1 through MOD-5): modules cannot reach into each other's tables, dependencies must be acyclic, and tenancy/authorization/audit/idempotency must be structurally impossible to bypass. This requires a framework with real scaffolding for enforcement, not hand-rolled discipline.

**Options considered.**

| Framework | Assessment |
|---|---|
| Express / Fastify (bare) | Minimal and fast, but no opinion on module structure. Every enforcement mechanism (guards, interceptors, module boundaries) would be built from scratch. |
| NestJS | Has a first-class `Module` concept mapping directly onto the HLD's module architecture, built-in dependency injection, Guards (a direct fit for the tenancy/authorization checks in HLD §8.1), Interceptors (a direct fit for idempotency and audit-writing, which must wrap every request identically), and first-class OpenAPI generation. |

**Decision: NestJS.** Its structure maps onto the HLD directly:

- The HLD's kernel (tenancy/context, authorization resolver, audit, idempotency, money, time, outbox) is implemented as application services and transaction-aware policies. NestJS Guards/Interceptors are boundary adapters for HTTP concerns only; they are not the authority. Worker, provider-callback, scheduler, AI, offline-sync, export, and SSE paths call the same kernel/application services directly. Idempotency, authorization, audit, and invariant checks therefore cannot be bypassed by avoiding an HTTP route.
- The HLD's modules (Identity, Planning, Commerce, Intelligence, Platform) become literal NestJS `@Module()` boundaries. Dependency injection means one module reaches another's functionality only by injecting its service — the mechanical enforcement of MOD-1, provided repositories are never injected across a module boundary, only services.
- MOD-1 through MOD-5 are enforced as a CI check, not a convention: `eslint-plugin-boundaries` (or NestJS's own module-graph validation) fails the build if one module imports another's internals directly.

**Rejected: bare Fastify/Express.** Faster in raw benchmarks, but at the measured load (3–8 cores) that difference is irrelevant, and the structural guardrails NestJS provides for free would otherwise need to be rebuilt by hand.

---

## 3. Database access — Drizzle ORM with hand-written SQL migrations

**Constraint.** The HLD places unusual demands on the database layer:
- Explicit `SELECT ... FOR UPDATE` locking in a deterministic order (HLD §9.1) for inventory holds — must be exact, not abstracted away by an ORM.
- Row-Level Security policies (HLD §7.3) — raw SQL, not something most ORMs generate.
- Declarative table partitioning by month or quarter depending on the table (HLD §7.5) — most ORM migration tools have no model for partitioned tables.
- Session variables set per transaction for RLS tenant context (HLD §7.3) — requires precise control over transaction boundaries.

**Options considered.**

| Tool | Assessment |
|---|---|
| Prisma | Best-in-class developer experience and migration tooling for typical CRUD, but works against hand-written partitioned tables, RLS policies, and precise lock ordering inside a specific transaction shape — raw SQL ends up needed anyway, now fighting Prisma's migration format to stay in sync. |
| Drizzle ORM | Deliberately thin — close to writing SQL directly, with TypeScript type safety layered on top. Does not try to own migrations; raw SQL and Drizzle's query builder interoperate freely in the same transaction. |
| Raw `node-postgres` (pg), no query builder | Maximum control, but no compile-time type safety on queries. Strictly worse than Drizzle with no offsetting benefit. |

**Decision: Drizzle ORM on `node-postgres`, with migrations for partitioning, RLS, and triggers written as hand-authored `.sql` files** rather than generated by Drizzle's auto-diff tool. Drizzle's generator remains fine for straightforward new tables.

Every migration that creates a partitioned table, an RLS policy, or a trigger requires manual review before merge — the same seriousness the HLD's MOD-5 rule already applies to the Inventory and Payments modules.

---

## 4. Data validation — Zod

**Constraint.** Every request entering the system needs validation at the boundary, before reaching business logic — the concrete implementation of "deny by default" (HLD Principle 2), and the first line of defense against malformed input reaching the deterministic validation layer the AI containment model depends on (NFR-AI-05).

**Decision: Zod**, integrated with NestJS via `nestjs-zod` (or equivalent). The v0.2.0 OpenAPI document is the authoritative wire contract; `openapi-typescript` (or equivalent) generates client/server wire types from it. Zod is the runtime validation layer for parsed input and domain-adapter boundaries, and its schemas are checked/generated against the OpenAPI contract rather than silently becoming a competing source of truth. Domain invariants remain in application services, not in schema parsing.

**Rejected: `class-validator`** (NestJS's own default). A reasonable, decorator-heavy alternative, but less suitable for keeping runtime validation aligned with the authoritative OpenAPI contract across HTTP, workers, and native clients.

---

## 5. Money — integer minor units, never floating point

**Constraint.** NFR-INT-02: monetary arithmetic must be exact; binary floating-point rounding must not alter charges, refunds, or totals. This is a zero-tolerance requirement, not a style preference.

**Decision.** Every monetary amount is stored and computed as an integer count of the currency's minor unit (e.g. cents, or the smallest SLE denomination) — a `bigint` in TypeScript, a `BIGINT` column in Postgres. A dedicated `Money` value type in the kernel wraps this integer and is the only way application code touches monetary values.

**Why this beats a decimal library** (e.g. `decimal.js`): a decimal library still permits accidentally mixing a `Decimal` with a raw JS `number` somewhere in a large codebase, silently reintroducing float error. An integer `bigint` is a distinct TypeScript type from `number` — the compiler rejects adding a raw float to a money value. The safety comes from the type system, not from consistently remembering to use a library correctly.

The `Money` kernel type is built first, in the Foundations slice of the implementation roadmap — every downstream module depends on it existing correctly before use.

**Wire rule.** Internal `bigint` values are never handed to JSON serialization and are never mixed with JavaScript `number`. API adapters serialize nonnegative `amountMinor` values as JSON integers within the safe-integer bound required by OpenAPI; signed derived budget values are separate types. Boundary tests reject overflow, negative paid amounts, currency mismatch, and accidental decimal strings.

---

## 6. Password hashing — Argon2id via the `argon2` package

**Constraint.** NFR-SEC-06 names the exact algorithm and parameters: Argon2id, minimum 19 MiB memory, 2 iterations, parallelism 1.

**Decision:** the `argon2` npm package, using native bindings rather than a pure-JS reimplementation — Argon2's memory-hardness is the entire point of the algorithm, and a slow pure-JS implementation either fails to deliver that property or becomes a CPU bottleneck under the concurrent-login-burst scenario the HLD's capacity model describes (Capacity §9.2). This requirement is fully specified already; the only task is implementing it as written.

---

## 7. Background jobs and queues — pg-boss

**Constraint.** ADR-0005 retains transactional outbox plus PostgreSQL-backed lanes. The invariant is a recoverable committed obligation, not a ban on all separate brokers. pg-boss implements queue mechanics behind the dispatcher; it does not replace domain idempotency.

**Decision: `pg-boss` behind an explicit transactional-outbox dispatcher** — a Node library built around Postgres claiming semantics, with retries, backoff, priorities, and scheduled jobs. The domain mutation, audit entry, and outbox row commit together; a dispatcher publishes the committed row to a distinctly-named pg-boss lane (`payment.fresh`, `payment.replay`, `admission.sync`, etc.). Queue publication is retried by outbox identity and never dual-written with the business mutation. Each lane has its own worker process/concurrency and deadline; pg-boss configuration cannot replace the HLD's lane and resource bulkheads.

**Rejected: BullMQ.** A Redis-backed queue would add another durable operating surface. It could be fed safely by an outbox, but no measured need currently justifies that change.

---

## 8. Caching, rate limiting, and SSE fan-out — Redis via `ioredis`

Already decided architecturally in HLD §5.4: Redis for cache, rate limiting, and pub/sub fan-out, never authoritative for anything. The remaining decision is the client library.

**Decision: `ioredis`** — the standard, most complete Redis client for Node, with cluster support available if ever needed. For SSE fan-out, Redis's native `PUBLISH`/`SUBSCRIBE` commands implement the bus described in HLD §11.1 directly.

---

## 9. AI provider integration

**Constraint.** HLD §12's containment model requires the agent to call through the same application services a human would, with tool-calling providing the seam where a deterministic validation gate sits between the model's proposal and any actual mutation.

### 9.1 Model provider — Anthropic's TypeScript SDK

**Decision (provisional until the provider gate is recorded):** Anthropic's official TypeScript SDK (`@anthropic-ai/sdk`), using tool use (function calling) as the mechanism by which the model proposes actions — the model's text output is never parsed and trusted directly. Every callable tool is a thin adapter handing off to the closed action registry and deterministic application-service gate before touching any state. Provider availability, retention, data-processing, and web-search capabilities are integration evidence, not assumptions in this stack record.

Building a multi-provider abstraction is deferred deliberately: the containment model (principal-based authority, deterministic validation, reserved-approval gates) is provider-agnostic by design, and building that abstraction before a single working agent exists is speculative. The tool-layer/validation-gate boundary is kept clean specifically so that adding a provider later is a contained change.

### 9.2 Orchestration layer — Vercel AI SDK

**Constraint.** Every agent in HLD §12.2 runs a loop — call a tool, receive its result, decide the next step, repeat — sometimes several times before producing a final proposal. Something has to manage that loop: hand-rolling it is real, error-prone work (retries, streaming, step limits); a heavy framework risks working against the requirement that matters most here.

**Options considered.**

| Option | Assessment |
|---|---|
| Hand-rolled loop, raw SDK only | Fully transparent, but rebuilds retry logic, step-limit handling, and streaming from scratch. |
| LangChain.js / LangGraph.js | Capable — LangGraph specifically is built around controllable agent state machines, a legitimate approach in general. Both wrap tool execution in more abstraction than this project can safely afford: NFR-AI-05 requires that nothing sit between "the model proposed this" and "the code validated it." Framework abstraction around that exact seam is a structural risk, not a style consideration. |
| Vercel AI SDK (`ai` + `@ai-sdk/anthropic`) | A tool's `execute` function is plain TypeScript, but the SDK is not an authority boundary. The application-service closed action registry and transaction gate must remain outside the adapter; the SDK only manages the model loop. |

**Decision: Vercel AI SDK** (`ai` package, `@ai-sdk/anthropic` provider). Concretely:

- Each model tool is defined with a Zod input schema and maps to a typed action in the application registry. Its `execute` function invokes (but does not replace) HLD §12.1's deterministic validation/application-service gate — capacity checks, permission checks, arithmetic, valid-transition checks, current rule revision, and entitlement — before any mutation.
- Multi-step reasoning (HLD §12.2's `background_plan`, `effect_review` job classes) uses the SDK's step-chaining controls to let an agent call several tools in sequence, without hand-built loop machinery and without a framework hiding what each step did.
- The whole stack stays in TypeScript, with tool schemas in Zod carrying the same compile-time safety net used elsewhere in this document.

**Rejected: CrewAI, AutoGen.** Both Python-first — rejected on the same grounds Python was set aside in §1.

### 9.3 Web research capability — provider-gated adapter

**Constraint.** The Planning agent (HLD §12.2) needs to research venues, vendors, and comparable events as part of producing a draft plan — an actual search capability available as a callable tool, not a text-generation call alone.

**Decision (provisional):** a provider web-search adapter may be enabled only after its current capability, data-processing, citation/attribution, timeout, cost, and availability evidence is recorded. It is declared as an external, non-tenant tool and cannot call Event Dynamics services. If the provider gate is not complete, the Planning agent runs without web search or uses a separately approved adapter.

**Reasoning.**
- A hosted search capability may avoid building and operating a separate search service, but this is a cost and availability hypothesis until the gate is complete.
- Public search remains subject to job authority, budget, cancellation and outbound-data controls. Queries must not disclose private attendee, payment or restricted planning data. Label tools by data destination and allowed actions; there is no ungated external-tool class. Search results remain untrusted data.
- Composes with §9.2 without special-casing — from the orchestration layer's perspective it is just another callable tool, but it remains outside the tenant-data authority path and is disabled until its gate passes.

---

## 10. Frontend architecture — three clients, three different tools

HLD ADR-0007 requires three separately built and deployed clients with materially different runtime needs.

### 10.1 Public storefront — Astro

**Constraint.** NFR-PER-17's budget — ≤300 KB compressed JS/CSS, ≤200 KB initial images — and NFR-PER-14's Core Web Vitals targets on real mobile hardware in Sierra Leone (HLD §4.3).

**Decision: Astro.** Ships zero JavaScript by default — pages are static HTML unless a component explicitly opts into interactivity (an "island"). For a storefront that is mostly a description page plus a checkout flow, this is the only realistic way to consistently hit the 300 KB budget without constant manual vigilance.

**Rejected: Next.js.** Ships considerably more JavaScript runtime by default (React hydration on every page unless deliberately avoided), making the 300 KB budget a constant fight rather than the framework's default behavior.

### 10.2 Check-in app — Expo (React Native)

**Constraint.** HLD §9.4 and §22 name offline admission as the single highest-risk flow in the system, with zero tolerance for data loss (NFR-OFF-04 requires a durable write before the operator sees a success screen, surviving app reload).

**Reasoning.** The supplied ADR-0007 confirms Expo/React Native as the accepted client choice. Its cited iOS incident only refers back to the HLD, so the amendment removes that unverified comparative claim. Retain the native storage/runtime choice and demonstrate durable admission/recovery on the device matrix; no framework guarantees it automatically.

**Decision retained after ADR-0007 review: Expo/React Native for installed iOS and Android check-in clients**, using:
- `expo-sqlite` for the local ticket dataset and pending-admission queue — an embedded SQLite database with explicit transaction and recovery handling; validate persistence under the supported device lifecycle and storage conditions.
- `expo-camera` for QR scanning. Measure the sub-2-second decode target separately from validation on the supported device matrix, including lower-end Android hardware; framework choice alone does not establish scan performance.
- EAS Build, Expo's cloud build service, for the iOS binary — building an iOS app normally requires a Mac with Xcode; EAS Build removes that requirement, which is the practical factor making App Store shipping realistic for a single-engineer team without existing Apple hardware.
- EAS Update for over-the-air JavaScript updates, governed by the same rule the browser-based design had for its service worker: an update is downloaded but never silently applied mid-admission-window, applied only on explicit operator action or app restart outside a live event.

**Trade-off.** Expo/React Native is a genuinely different runtime from the Vite+React web apps — it renders native UI components, not HTML, so component-level UI sharing with the organizer workspace is lost. What remains shared: business logic, the generated API client and types from the OpenAPI spec, validation schemas, and state-management logic — all plain TypeScript, portable to either runtime. Only the UI layer stops being shared, and the check-in app's UI is small (scan screen, manual search, sync status, admission history) relative to what is lost.

A side effect worth noting: this also simplifies the stack overall. Dexie.js and Workbox, needed for the browser-based design, drop out entirely.

**Alternative not selected: Capacitor.** Native packaging and storage plugins are possible; the current preference is React Native's UI/runtime fit. A future comparison should measure durability, camera behavior, UI reuse and distribution/maintenance cost rather than assuming Capacitor lacks native distribution.

### 10.3 Organizer workspace — Vite + React + TanStack Query

**Constraint.** Feature-rich, authenticated, warm-navigation budget of 1 second (NFR-PER-11).

**Decision: Vite + React**, with **TanStack Query** managing server state — implementing the "warm navigation" caching pattern the HLD describes (cached-but-revalidating data, explicit invalidation on mutation) without a hand-rolled cache invalidation system. Full component-level sharing with the check-in app is no longer available following the §10.2 decision (see §10.4); the workspace and check-in app share only generated types and portable business logic.

### 10.4 Shared across clients

- Generated TypeScript types from the OpenAPI spec (via `openapi-typescript` or similar), consumed by all three clients — the native app consumes the same generated types as the two web apps, since types are plain TypeScript, not UI components.
- A shared design **tokens** package (colors, spacing, type scale) consumed by all three. Full component sharing is workspace-only; the check-in app's native components are not the same artifact as the workspace's web components.

---

## 11. Repository structure — a monorepo

**Constraint.** Three frontends and one backend consume the same generated types from the same OpenAPI spec; the shared design tokens need a location reachable by every consumer without publishing a versioned package for every small change during early development.

**Decision:** a single monorepo using **pnpm workspaces** (lighter and faster than npm/yarn workspaces, with better disk usage via its content-addressable store). **Turborepo** can be layered on later once build times start to matter — not needed until the repository has enough packages for a full build to take real time.

```
event-dynamics/
  apps/
    api/              — NestJS backend (all 4 pools + worker fleet, one codebase)
    storefront/        — Astro
    checkin/            — Expo (React Native) native app
    workspace/          — Vite + React SPA
  packages/
    shared-types/        — generated from OpenAPI, consumed by all apps (web and native)
    design-tokens/         — colors, type, spacing — consumed by all three
    design-system/          — full web components — workspace only
    kernel/                 — the shared kernel, if extracted as an internal package
```

**Rejected: separate repositories per app.** Would require publishing and versioning an internal npm package just to share generated types — real overhead for a single-engineer team, with no offsetting benefit at this team size.

---

## 12. Hosting and infrastructure

### 12.1 The requirement that overrides the simplest option

Two HLD requirements narrow the field considerably from the typical hosting recommendation:

1. **NFR-REC-02 / ADR-0003:** RPO ≤ 1 minute for critical records, via the replication/durability mechanism accepted by ADR-0003 — the primary database must not acknowledge a critical write before the required durability point.
2. **HLD §4.3 / risk R2:** the 1-second admission budget is already tight after real-world RTT to Sierra Leone. Every extra network hop between application server and database consumes that budget directly. Application and database need to be genuinely co-located, not merely "in the same cloud region" loosely.

**Separate requirements from mechanisms.** NFR-REC-02 specifies a recovery-point target; the HLD selects synchronous standby replication. Evaluate alternatives against durability, latency and recovery objectives. Missing evidence in this review does not prove another platform cannot meet them.

**AWS RDS candidate.** Multi-AZ DB instance deployments use a synchronous standby in another Availability Zone; it cannot serve reads, so a read replica is separate. [AWS documentation](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZSingleStandby.html). Typical failover is 60–120 seconds and can take longer, correcting the earlier under-60-second claim. [AWS failover documentation](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.Failover.html). Measure commit latency and recovery including reconnect/reconciliation; Multi-AZ alone does not prove regional recovery.

### 12.2 The decision

**Decision (provisional): AWS, as a single cloud provider for both compute and data**, so that application and database are genuinely co-located in the same network rather than spread across providers. It becomes a launch commitment only after RTT, RPO/RTO, load, operational effort, and monthly-cost gates pass.

| Component | Choice | Rationale |
|---|---|---|
| Database | AWS RDS for PostgreSQL, Multi-AZ (candidate) | Candidate for the HLD durability target; RPO/RTO, commit latency, read-replica behavior, and SKU cost require evidence against ADR-0003/NFR-REC-02. |
| Compute (app pools + workers) | AWS ECS on Fargate | Runs multiple independently-scaled services (the 4 pools + worker fleet) from one deployment, in the same VPC as the database — no OS patching, no server management, genuine network co-location with RDS. |
| Cache / rate-limit / SSE bus | AWS ElastiCache for Redis | Same VPC, same latency benefit. |
| Object storage | AWS S3 | Attachments, exports, offline packages, backups. Natively supports the expiring presigned URLs NFR-DAT-05 requires. |
| CDN / edge | AWS CloudFront | Origin-shields S3/storefront content; integrates natively with the rest of the stack. |
| Container registry | AWS ECR | Stores the Docker image built in CI before ECS can run it — Fargate has nothing to run without it. |
| Load balancer + WAF | AWS ALB with AWS WAF attached | The concrete implementation of the "Load balancer / API gateway, TLS, rate limiting, WAF" box in HLD §4.2's container diagram, and the role a self-managed reverse proxy would otherwise play. |
| DNS | AWS Route 53 | Routes the domain to the ALB. The MVP is single-region; RDS endpoint failover is not the same as cross-region DNS failover, so Route 53 health routing is not counted as an implemented DR mechanism. |
| Secrets management | AWS Secrets Manager | The concrete tool behind HLD §16.2's requirement that secrets never live in source control or client bundles. |

**Note on CloudFront and Sierra Leone:** edge proximity and cache-hit behavior must be measured from the launch market. CDN caching does not substitute for the one-round-trip admission design or offline path.

**Region choice.** An EU region is the HLD candidate, but which region has the lowest real RTT to Freetown is a measurement, not an assumption. Before committing infrastructure: run RTT and application-journey tests from representative Sierra Leone connections to candidate EU regions, then select using tail latency, service availability, RPO/RTO, and total monthly cost.

### 12.3 Rejected alternative: Fly.io / Render as primary platform

Both are genuinely lower-effort platforms for a single-engineer team to operate. The trade-off:

- **Gain from choosing them:** meaningfully less operational complexity — simpler deployment model, less AWS-specific knowledge required, faster initial deployment.
- **Risk:** no confirmed evidence that either platform's managed Postgres offering meets the durability/latency target accepted by ADR-0003. Running compute on one of these platforms with the database hosted elsewhere for real synchronous durability reintroduces the co-location problem from §12.1 — every database query on the admission path would then cross a network boundary between two infrastructure providers, worse for the tightest latency budget in the system than staying on one provider throughout.

AWS requires more upfront learning and a steeper initial setup. It is the current candidate because the requirements are strict, not because the platform is automatically affordable. If its operational load or cost proves prohibitive, the fallback path is to verify a specialist provider's actual replication guarantees and run the same latency, recovery, security, and cost tests before switching — never downgrade the requirement quietly because a platform is easier.

**Sizing and cost review.** Price minimum tasks, database standby/read replica, networking, logs, backups and staging before procurement. A temporary prototype can measure service times, but production acceptance must preserve the HLD's separate critical capacity and worker isolation. Consolidating pools or workers requires HLD/ADR review and interference/failure evidence; this record does not authorize it. A smaller development setup cannot establish production availability or capacity.

### 12.4 Deployable containers — one image, a measured service split

Fargate runs containers, so a Docker image is required — not a server to patch or manage, but a `Dockerfile` producing the image ECS runs. The following 12-service shape is **provisional**: it expresses the HLD bulkheads, but the smallest launch topology must prove lane isolation and cost before every row becomes an always-on ECS service.

**Principle (HLD ADR-0002): one build artifact, deployed many times with different configuration.** This is one Docker image containing the complete NestJS application, started twelve different ways via an environment variable (e.g. `APP_ROLE=critical`, `APP_ROLE=worker:payment-fresh`) that determines which part of the codebase activates on boot.

| # | ECS service | `APP_ROLE` | Runs | Maps to HLD |
|---|---|---|---|---|
| 1 | `api-critical` | `critical` | Admission, checkout, payment ingest, secure-link access | §5.3 Critical pool |
| 2 | `api-workspace` | `workspace` | Authenticated organizer CRUD, dashboards, admin | §5.3 Workspace pool |
| 3 | `api-public` | `public` | Unauthenticated event data, availability, programme | §5.3 Public pool |
| 4 | `api-stream` | `stream` | SSE connections, fan-out | §5.3 Stream pool |
| 5 | `worker-payment-fresh` | `worker:payment-fresh` | New successful payment events → issuance | §10.2, sized for the full burst |
| 6 | `worker-payment-replay` | `worker:payment-replay` | Duplicate/terminal-state payment events | §10.2, isolated per ADR-0009 |
| 7 | `worker-admission-sync` | `worker:admission-sync` | Offline batch ingestion, conflict detection | §10.2 |
| 8 | `worker-notify` | `worker:notify` | Notification workers; transactional and operational lanes remain separately throttled even if they share an image | §10.2 |
| 9 | `worker-pdf` | `worker:pdf` | Ticket PDF rendering | §10.2 — isolated; the lane HLD risk R7 flags as a capacity threat if shared |
| 10 | `worker-bulk` | `worker:bulk` | CSV import/export | §10.2 |
| 11 | `worker-ai` | `worker:ai` | AI job orchestration and execution | §10.2, §12.3 |
| 12 | `scheduler` | `scheduler` | Hold expiry, retention, reconciliation, lease expiry, aggregate refresh | §10.4 — single leader-elected instance, with the advisory-lock mechanism the HLD specifies as the safety net if ECS briefly runs two during a deploy |

**Payment-fresh and payment-replay retain separate workers and reserved capacity.** ADR-0009 has now been reviewed. Protect urgent restriction-producing events from replay backlog; only proven nonurgent work receives the relaxed deadline. Any consolidation needs HLD/ADR amendment and mixed-load evidence.

**PDF rendering has its own service** rather than sharing with bulk import/export — the risk register treats PDF cost as a real, unmeasured threat to critical capacity (R7); isolating it means a rendering spike during a large on-sale cannot compete with checkout or admission for the same container's CPU.

### 12.5 Email and payment integration

- **Email:** any transactional email provider with strong deliverability and a webhook for delivery/bounce events. AWS SES, already inside the chosen ecosystem, is the path of least friction and directly serves NFR-FRE-05's delivery-tracking needs — a lower-stakes decision than the database choice, and any reputable provider would satisfy the requirement.
- **Payments:** Monime is the product-named provider, but no paid path is enabled from this document alone. The Provider Integration Gates must verify credentials, callback authentication on raw bytes, payload/event identity, status lookup, release behavior, idempotency, reconciliation, and refund evidence. Until then the system supports a disabled/pending integration state and does not fabricate an outbound refund API.

---

## 13. Observability — OpenTelemetry, exported to a managed backend

**Constraint.** HLD §8.5 requires per-operation latency histograms tagged by the governing NFR identifier, queue-age tracking, and business-rejection counters kept separate from technical-error counters — an observability pipeline needed from the start, not added before launch.

**Decision:** instrument with OpenTelemetry (the vendor-neutral standard; NestJS has solid OTel integration via interceptors, which are also the natural place to tag each operation with its governing NFR ID as a metric dimension, per HLD §8.5). Export to a managed backend with a workable low-cost tier for early stage — **Grafana Cloud** is a reasonable default: metrics, logs, and traces in one place, genuinely OTel-native, with synthetic monitoring available for the 1-minute critical-journey probes NFR-AVL-02 requires.

Instrumenting against the vendor-neutral standard rather than a provider SDK directly means the observability backend remains a swappable choice later (the reversibility principle in HLD §3) — instrumentation code does not need rewriting if the project outgrows a free tier and moves providers.

---

## 14. Testing strategy

**Constraint.** HLD §19.1's CI gate list is specific: tenant isolation suite, authorization suite, financial/admission integrity suite with zero tolerance, migration safety, module boundary lint.

**Decision.**
- **Vitest** for unit and integration tests — fast, TypeScript-native, with configuration that shares cleanly across a monorepo.
- **Testcontainers** for integration tests requiring a real PostgreSQL instance — necessary for the concurrency/retry/failure suite HLD MOD-5 mandates for the Inventory and Payments modules. `SELECT FOR UPDATE` locking behavior, deadlock avoidance, and RLS policies cannot be honestly tested against an in-memory fake database; it has to be real Postgres, spun up fresh per run.
- **Playwright** for end-to-end tests across the storefront and workspace, including network-condition simulation for degraded-connectivity scenarios. The check-in app's offline path is tested separately, in its own native test harness, since it is no longer a browser-based client.

---

## 15. CI/CD — the deployment pipeline

**Constraint.** HLD §14.3 specifies deployment order (Workspace → Public → Stream → Critical, with Critical never touched during a live admission window without a recorded exception), and §19.1 lists CI gates that must block a bad deploy before it ships. Both constraints need to be encoded in the pipeline itself rather than left as manual steps.

**Decision: GitHub Actions**, one workflow triggered on push to `main`, structured as blocking stages:

| Stage | Runs | Blocks deploy if |
|---|---|---|
| 1. Test | Vitest (unit + integration via Testcontainers against real Postgres) | Any failure |
| 2. Integrity gates | HLD §19.1's list: tenant isolation suite, authorization suite, financial/admission integrity suite (zero-tolerance per NFR-MET-06), module boundary lint (MOD-1..5), dependency vulnerability scan | Any failure — the integrity suite is a hard stop, never a warning |
| 3. Build | One multi-stage `Dockerfile` build, producing the image described in §12.4 | Build failure |
| 4. Push | Image pushed to ECR, tagged with the git commit SHA | Push failure |
| 5. Migrate | Database migrations run as a one-off ECS task, not part of any service's boot sequence — avoids concurrent migration races and keeps failures visible as their own step | Migration failure — nothing downstream runs |
| 6. Deploy, fixed order | See below | A stage's health check failing |
| 7. Verify | Synthetic probes against the five critical journeys named in HLD §8.5, run immediately after the Critical pool updates | Failure triggers the tested service rollback or safe forward-fix runbook |

**Deploy order (stage 6):** `api-workspace` → `api-public` → `api-stream` → the four non-critical workers (`worker-notify`, `worker-pdf`, `worker-bulk`, `worker-ai`) → `worker-payment-replay` → `worker-admission-sync` → `worker-payment-fresh` → `api-critical` last, since it serves the admission endpoint itself.

HTTP services use load-balancer health checks; workers and the scheduler use process health checks and queue-progress probes. Service rollback cannot undo committed migrations or effects from another pool. NFR-ENG-03 requires tested task rollback and expand/contract or safe forward-fix procedures. Disaster restore/reconciliation has the separate RTO targets in HLD §15.3.

**One manual gate:** deploying `api-critical` requires an explicit approval (a GitHub Actions environment protection rule) only during a window flagged as an active live-event admission period. Outside that window, the full pipeline runs unattended on push to `main` — the literal implementation of HLD §5.3's rule, without requiring manual approval on every deploy.

**Staging** deploys automatically on every push to a `staging` branch or PR merge into it, using the identical pipeline — what makes staging genuinely production-representative per HLD §14.2.

---

## 16. Deliberately undecided

Consistent with HLD §1.3, the following stay open until the specific module that needs them is being built:

- **Virus/malware scanning provider** (NFR-DAT-01) — vendor remains open, but the adapter, quarantine state, scan result, timeout/failure behavior, and clean-before-release gate are mandatory now. A file is never served or imported merely because a scanner vendor is undecided.
- **PDF rendering approach** — HLD risk R7 already flags this as unresolved, recommending measurement of actual render cost and serious consideration of on-demand generation over pre-rendering before committing to a library.

---

## 17. The stack at a glance

| Layer | Choice |
|---|---|
| Language | TypeScript (backend + all frontends) |
| Backend framework | NestJS |
| Database | PostgreSQL (AWS RDS Multi-AZ candidate; ADR-0003 reviewed; measurement pending) |
| DB access | Drizzle ORM + hand-written SQL for critical DDL |
| Validation | OpenAPI v0.2.0 authoritative wire contract + Zod runtime adapters |
| Money | Integer minor units (`bigint` internally, safe JSON integer on wire), dedicated kernel type |
| Password hashing | Argon2id via `argon2` |
| Queues / background jobs | Transactional outbox dispatcher → pg-boss (Postgres-backed lanes) |
| Cache / rate limit / SSE bus | Redis (AWS ElastiCache) via `ioredis` |
| AI provider SDK | Anthropic TypeScript SDK, tool use (**provisional/provider-gated**) |
| AI orchestration | Vercel AI SDK (`ai` + `@ai-sdk/anthropic`), application registry remains authority |
| AI web research | Provider-gated external search adapter; disabled until evidence |
| Public storefront | Astro |
| Check-in app | Expo (React Native), `expo-sqlite`, `expo-camera`, EAS Build/Update (ADR-0007 reviewed; device acceptance pending) |
| Organizer workspace | Vite + React, TanStack Query |
| Repo structure | pnpm workspaces monorepo |
| Compute | AWS ECS on Fargate — 1 Docker image, measured/provisional service split (§12.4) |
| Container registry | AWS ECR |
| Load balancer / WAF | AWS ALB + AWS WAF |
| DNS | AWS Route 53 |
| Secrets | AWS Secrets Manager |
| Object storage | AWS S3 |
| CDN | AWS CloudFront |
| Observability | OpenTelemetry → Grafana Cloud |
| Testing | Vitest, Testcontainers, Playwright |
| CI/CD | GitHub Actions — ordered rolling deploy, service rollback + migration forward-fix/recovery runbooks, one manual gate (§15) |

---

*The supplied eight ADRs are reviewed. Remaining uncertainty concerns implementation measurements, provider capabilities and cost; possession of an ADR is not acceptance evidence. Deep dives should explain the detailed implementation without duplicating these decision records.*

## 18. Change record

| Version | Date | Change |
| --- | --- | --- |
| 2.0 | 19 September 2026 | Initial technology/vendor selection record following HLD v1.1. |
| 2.1 | 19 September 2026 | Reconciled with HLD v1.2 and API/Core Entities v1.1/v0.2.0: authoritative OpenAPI/Zod boundary, kernel use outside HTTP, money wire serialization, outbox/pg-boss boundary, provider-gated AI/payment choices, native-client ADR evidence, AWS/RDS and cost gates, lane isolation, migration rollback truth, and mandatory malware-scan gate. |
| 2.2 | 19 September 2026 | Reconciled the eight supplied ADRs, retained native-client and isolated-worker choices, corrected broker rationale and urgent payment routing, and removed obsolete missing-ADR conditions. |
