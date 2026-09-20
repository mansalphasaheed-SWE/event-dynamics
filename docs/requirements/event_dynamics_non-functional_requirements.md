# Event Dynamics — Non-Functional Requirements

**Version:** 1.0  
**Date:** 14 September 2026  
**Status:** Decided engineering baseline for user review and system design.  
**Scope:** Event Dynamics MVP: organization workspaces, planning/logistics, ticketing, admission, AI assistance, and platform billing.



The targets below are requirements to demonstrate, not claims about an already-built system. They are internal acceptance objectives, not a published contractual SLA. An unmet target requires remediation or an explicit recorded revision before the affected capability is represented as supported. Production evidence may justify later revisions; it does not silently change this baseline.

Product-backed guarantees include tenant isolation, matching payment confirmation, no duplicate ticket issuance, capacity protection, offline-conflict preservation, optional AI, permission-controlled actions, and issued-ticket continuity. Numerical latency, workload, recovery, security-token, storage, and operating targets in this version are engineering decisions unless the brief already states them. External standards inform selected requirements; they do not establish Event Dynamics' measured capacity.

The specification defines required outcomes. It does not mandate a monolith or microservices, a database vendor, an application framework, a queue product, a client rendering strategy, or a model provider.

---

## 1. Measurement conventions

| ID | Requirement |
|---|---|
| **NFR-MET-01** | Every performance result shall identify operation, start/end boundaries, environment, dataset, offered workload, cache state, test duration, and relevant device/network profile. Different operations shall not be pooled into one percentile. |
| **NFR-MET-02** | Backend latency shall run from receipt at the application service boundary through response completion, including application queueing, authorization, validation, connection waiting, and required durable writes. It excludes the user's network. External-provider time shall be reported separately and included when an explicitly end-to-end target calls for it. |
| **NFR-MET-03** | Client latency shall run from the stated user/application trigger to the required visible result. QR validation timing starts when a QR payload has been successfully decoded; camera acquisition/decoding shall be measured separately. Successful admission feedback requires the authoritative online admission commit or a durable offline admission record. |
| **NFR-MET-04** | P95 means 95% of measured operations meet the stated budget; P99 means 99%. Report technical errors, timeouts, expected business rejections, and throughput alongside latency. Fast failures shall not count as successful service. Timeouts shall count against reliability and deadline attainment rather than being silently excluded. |
| **NFR-MET-05** | Each launch performance scenario shall pass three consecutive runs on a production-representative configuration. Publish sample counts and raw distributions; repeated burst runs shall provide at least 10,000 operation observations before treating P99 as a stable acceptance estimate. Load generators shall maintain the offered rate independently of server slowdown. |
| **NFR-MET-06** | Security and business-integrity invariants shall not receive a percentile error allowance. Any observed unauthorized access, overselling, duplicate issuance, lost acknowledged work outside the defined disaster model, or incorrect admission decision in the supported online model shall fail acceptance. |

### Controlled test profiles
These are reproducible laboratory profiles, not claims about typical Sierra Leone connectivity.

| Profile | Definition |
|---|---|
| **Mobile M1** | 1.6 Mbps download, 750 Kbps upload, 150 ms added network RTT, no injected packet loss; warm connection unless a cold-load case specifies otherwise. |
| **Degraded mobile M2** | 500 Kbps download, 250 Kbps upload, 400 ms added RTT, 1% injected packet loss; validate usable waiting/error/offline behavior and correctness, without imposing M1 latency budgets. |
| **Broadband B1** | 20 Mbps download, 5 Mbps upload, 50 ms added RTT, no injected packet loss. |

- **Physical device floor:** An Android phone with 4 GB RAM and a supported OS/browser, plus an iPhone running the oldest supported iOS major version. Before implementation acceptance, record actual model, processor, OS, browser, available storage, and camera configuration. RAM alone is not a device benchmark.
- **CPU simulation:** A fixed, documented lab host with 4x CPU slowdown provides regression comparison only; it does not replace physical-device tests.
- **QR acquisition test:** Printed and phone-displayed tickets, normal indoor light and a separately recorded dim-light case, with the camera already open and permission granted. At least 95% of readable presented codes shall decode within 2 seconds on the supported physical-device matrix. Damaged/unreadable codes shall lead to manual-search guidance, not invented validation.

---

## 2. Workload and capacity baseline

The following are chosen validation scenarios, not adoption forecasts or new commercial plan limits. The brief's 10,000 attendees and 150 team members per Operations event, and 20 active events per Operations organization, remain product commitments. An active planning event is not automatically a concurrently operating event.

| Workload | Required validation scenario |
|---|---|
| **Large-event data** | 10,000 attendees/tickets, 150 event team members, and 50 prepared check-in devices. Device count tests software support, not the staffing needed to clear a queue. |
| **Planning data per large event** | 1,000 sessions/activities, 10,000 tasks/subtasks, 2,000 run-of-show items, 500 vendor records, 2,000 resource records, and 10,000 expense records. These are deliberately bounded test fixtures, not new product caps. |
| **Platform data fixture** | 500 organizations, 100 recently active organizations, 300 active events, and an additional archived history fixture with 1 million ticket/admission-related records. This tests tenancy and historical-data effects; it predicts no acquisition rate. |
| **Admission scenarios** | Planning: 5,000 arrivals in 30 minutes. Concentrated: 10,000 arrivals in 30 minutes. |
| **Admission sustained** | 6 validation attempts/second for 30 minutes per busy event. |
| **Admission burst** | 20 validation attempts/second for 60 seconds per busy event. |
| **Checkout sustained** | 12 checkout-start attempts/second for 15 minutes per busy sale. |
| **Checkout burst** | 36 checkout-start attempts/second for 60 seconds per busy sale. |
| **Public browsing** | 60 event/ticket page loads/second sustained for 15 minutes; 180/second for a 60-second burst per busy sale. Page loads shall be translated into the application's actual request mix. |
| **Payment-event ingestion** | 50 provider-event deliveries/second sustained for 15 minutes; 150/second for a 60-second burst, platform-wide. Include duplicates, delayed events, unsuccessful attempts, and replay cases; unique paid tickets remain bounded by available stock. |
| **Organizer collaboration** | 300 connected team sessions across two busy organizations, with 30 permitted record mutations/second and 100 read requests/second platform-wide. |
| **Simultaneous event operations** | Two busy events at their full admission targets, plus eight light live events at 1 admission attempt/second each: 20/second aggregate sustained, or 48/second when both busy events burst. |
| **Simultaneous sales** | Two organizations each at the full checkout and browsing targets: 24 checkout attempts/second and 120 page loads/second sustained; 72 and 360 respectively in a simultaneous burst. |
| **Mixed critical work** | Run the sustained simultaneous-sales and simultaneous-admission scenarios together, with collaboration, payment ingestion, one 10,000-row import, one 100,000-row export, and 50 accepted AI jobs across at least 10 organizations: 40 simple context questions and 10 bounded background planning jobs. Admission and checkout budgets shall still hold. |

*Notes:* The admission sustained rate rounds above $10,000 / 1,800 = 5.56$ arrivals/second. Checkout sustained demand rounds above $10,000\text{ single-ticket orders} / 900 = 11.11$ orders/second. The browsing ratio of five page loads per checkout attempt and the repeated callback workload are chosen stress assumptions. Bursts are approximately three times sustained operation rates. Legitimate sold-out responses are expected once finite inventory is exhausted; tests shall never replenish stock by silently bypassing product rules.

| ID | Requirement |
|---|---|
| **NFR-CAP-01** | The release shall demonstrate its performance budgets under the workload scenarios above using realistic permission checks, audit writes, connected records, and storage. Stubbed payment/model latency may be used for controlled load generation, with separate real integration tests. |
| **NFR-CAP-02** | Large inventories and concurrent operations shall preserve per-ticket-type and overall capacity. Test final-ticket contention, free invitations, session registration, held stock, and walk-in registration; a high response rate does not permit overselling. |
| **NFR-CAP-03** | Under supported mixed load, AI, reports, uploads, and imports shall not cause critical ticketing/admission latency or reliability objectives to fail. Beyond the accepted envelope, throttle or queue lower-priority work and produce clear responses rather than corrupting records or accepting unbounded work. |
| **NFR-CAP-04** | Measure the saturation point by increasing concurrent workloads beyond the acceptance scenario. Record achieved capacity, operating cost, bottlenecks, and recovery after overload. Do not market untested aggregate capacity. |

---

## 3. Performance and responsiveness

Unless a row says otherwise, targets apply under the relevant sustained and burst workload, with realistic data and background work. P95/P99 are separate complete-operation measurements. These targets supersede the earlier 20–100 ms universal internal-query requirements.

| ID | Operation and boundary | P95 | P99 |
|---|---|---|---|
| **NFR-PER-01** | Online admission: backend receives decoded ticket validation through authoritative decision/admission commitment and response completion. | 1 second | 2 seconds |
| **NFR-PER-02** | Online admission: decoded payload submitted through final visible decision on M1, foreground prepared or unprepared device. | 1.5 seconds | 3 seconds |
| **NFR-PER-03** | Offline admission: decoded payload through local validation, durable admission recording, and visible result on a prepared reference device with 10,000 tickets. | 500 ms | 1 second |
| **NFR-PER-04** | Manual attendee search: explicit submission through first useful page of results on M1, or local results when offline, with 10,000 attendees. Typing/debounce delay shall be reported separately. | 2 seconds | 3 seconds |
| **NFR-PER-05** | Authorized online check-in undo: backend request receipt through correction and audit commitment and response. | 1 second | 2 seconds |
| **NFR-PER-06** | Public event/ticket data: backend request receipt through response, including current sale availability where requested. | 500 ms | 1 second |
| **NFR-PER-07** | Checkout reservation/order creation: backend request receipt through atomic capacity decision and durable hold/order result. Includes correct sold-out results. | 1 second | 2 seconds |
| **NFR-PER-08** | Checkout reservation: purchaser submission through rendered reservation result on M1, excluding any later Monime call. | 2 seconds | 4 seconds |
| **NFR-PER-09** | Standard workspace reads and permitted edits: backend request receipt through response and, for edits, required mutation/audit commitment. Excludes explicitly asynchronous reports and AI. | 500 ms | 1 second |
| **NFR-PER-10** | Cold workspace navigation: user navigation through useful interactive content on M1. Large datasets may show a first page; the result shall not be only a spinner. | 3 seconds | 5 seconds |
| **NFR-PER-11** | Warm workspace navigation: navigation through useful visible cached or freshly retrieved content on M1. Cached information must follow authorization and freshness requirements. | 1 second | 2 seconds |
| **NFR-PER-12** | Verified provider-event durable acceptance through acknowledgment; business completion measured separately. | 500 ms | 1.5 seconds |
| **NFR-PER-13** | Valid successful payment event durably accepted through correct ticket issuance or explicit financial-review state, including matching amount/currency/order and capacity checks. | 5 seconds | 15 seconds |

| ID | Additional requirement |
|---|---|
| **NFR-PER-14** | Public event, ticket selection, and order-access experiences shall target LCP $\le$ 2.5 seconds, INP $\le$ 200 ms, and CLS $\le$ 0.1 at P75, segmented by mobile/desktop. Before field data exists, use cold-load laboratory tests and representative scripted interactions; after launch use real-user measurement. See the Web Vitals source in Section 16. |
| **NFR-PER-15** | A user-triggered operation taking more than 300 ms shall provide visible pending/progress feedback without representing an uncommitted protected action as successful. An optimistic display shall distinguish pending state and recover visibly from rejection. |
| **NFR-PER-16** | A ticket hold countdown shall display remaining time from the server-established expiry. Client response delay, refresh, retries, or clock drift shall not silently extend the hold. |
| **NFR-PER-17** | Public ticket selection's initial compressed HTML/CSS/JavaScript shall be $\le$ 300 KB; its initial visible image payload shall be $\le$ 200 KB. Check-in's initial compressed executable/style assets shall be $\le$ 750 KB, excluding the separately reported ticket dataset and live camera frames. Lazy-loaded assets needed before the first usable interaction count toward the initial budget. |
| **NFR-PER-18** | Standard foreground displays shall remain interactive during synchronization, search, and AI work. No mandatory virtualization threshold, debounce interval, framework, or per-query ceiling is imposed; implementations must meet the measured user-facing budgets. |

---

## 4. Freshness, notifications, and synchronization latency

| ID | Requirement |
|---|---|
| **NFR-FRE-01** | A committed run-of-show or public-programme update shall appear in eligible connected foreground views within 2 seconds P95 and 5 seconds P99. Readiness/dashboard recomputation shall complete within 5 seconds P95 and 15 seconds P99 after a relevant committed change. |
| **NFR-FRE-02** | Authoritatively accepted online admissions shall appear in attendance aggregates within 2 seconds P95 and 5 seconds P99. Unique admitted attendees, total entry events, re-entry, corrections, and unresolved conflicts shall not be conflated. |
| **NFR-FRE-03** | After reconnection, a 100-admission upload batch shall be durably processed and reflected in counts/conflict indicators within 5 seconds P95 and 15 seconds P99 from complete batch receipt. Each batch shall be safe to retry. Backlogs and queue age shall be visible. |
| **NFR-FRE-04** | Connected foreground recipients shall see an authorized operational announcement within 3 seconds P95 and 10 seconds P99 of committed dispatch. Audio is optional and depends on device/browser permissions and user preferences. Background or disconnected clients shall display missed relevant updates on resume/reconnection. No SMS, WhatsApp, or push product is added to the MVP by this requirement. |
| **NFR-FRE-05** | Required ticket/transactional emails shall be submitted to the email service within 30 seconds P95 and 2 minutes P99 of the triggering committed event, when the dependency is available. Provider submission, provider-reported delivery, and actual inbox receipt shall remain distinct. Failures shall be retried and exposed; a successful purchase shall retain secure ticket-page access. |
| **NFR-FRE-06** | Online order pages shall show a newly committed payment/ticket result within 3 seconds P95 and 10 seconds P99. If pending longer, retain truthful pending/review information. |
| **NFR-FRE-07** | Reconnected/resumed clients shall refresh effective access and important current state before enabling protected actions. Browser timers are display conveniences, not an authority for ticket expiry, role expiry, or actual activity completion. |

---

## 5. Security, authentication, and organization isolation

| ID | Requirement |
|---|---|
| **NFR-SEC-01** | Organization data shall be isolated across storage queries, caches, files, jobs, AI retrieval, logs, dashboards, exports, and notifications. Multiple memberships grant independent valid access; they do not merge organizations' data. |
| **NFR-SEC-02** | Protected operations shall authorize the applicable actor: team account/membership, scoped purchaser/attendee credential, approved device/operator, or authenticated provider/system operation. Default deny applies. Organization inheritance, event roles, record scope, time limits, and owner-only approvals shall follow the brief. |
| **NFR-SEC-03** | The same authorization outcomes shall apply across manual screens, APIs, AI, exports, aggregates, and files. Parent-record restrictions govern attachments/notes/comments. A custom event role shall never acquire organization administration through a differently named permission. |
| **NFR-SEC-04** | New protected server operations shall honor committed access revocation and current authority. Recheck authority immediately before delayed/background mutations. Cached online views/connections shall stop receiving unauthorized updates within 5 seconds of revocation; inability to confirm authority shall block protected mutation. Already viewed/downloaded data cannot be remotely unlearned. Offline exceptions are explicitly bounded in Section 7. |
| **NFR-SEC-05** | Public and internal service transport carrying credentials or private data shall use authenticated encrypted transport. Sensitive production data, files, backups, and offline payloads shall be protected at rest, with access to keys separated from ordinary data access. Secrets shall not be shipped in public clients or committed to source control. |
| **NFR-SEC-06** | Passwords shall use uniquely salted Argon2id hashes, initially at least 19 MiB memory, 2 iterations, and parallelism 1, with work factors benchmarked and reviewed. Raw passwords shall never be persisted or logged. This baseline follows OWASP guidance linked in Section 16. |
| **NFR-SEC-07** | Password-recovery tokens shall be single-use and expire after 30 minutes; verification links after 24 hours; membership invitations after the brief's 7 days. Resend/replacement shall invalidate the previous recovery/invitation credential where applicable. Successful password reset shall revoke existing account sessions. |
| **NFR-SEC-08** | Team sessions shall expire after 12 hours without activity and after 7 days absolutely; warn and preserve unsaved permitted work where feasible. Ownership, payment-account connection, billing purchases, and destructive organization operations shall require password reauthentication within the preceding 10 minutes. Offline admission uses the separately bounded device authorization, not an indefinitely valid login. |
| **NFR-SEC-09** | Purchaser/attendee links shall be revocable, scoped, and unguessable with at least 128 bits of cryptographic randomness or equivalent security. A secure-link session shall expire after 24 hours; a new access link may be obtained through the order's verified delivery channel. Individual emailed access credentials expire after 30 days and may be reissued. Ticket access shall remain recoverable through the admission period and applicable post-event access period without joining the team. QR credential lifetime is separate. |
| **NFR-SEC-10** | Account login/recovery, invitation acceptance, secure-link access, and checkout shall enforce configurable per-identity and network abuse controls. Initial recovery-email limits are 3 per address per hour; repeated login failures shall trigger increasing delays after 5 failures in 15 minutes per account. Do not let unauthenticated traffic permanently lock out an account or let a shared venue IP alone block all approved scanners. |
| **NFR-SEC-11** | Sessions, QR secrets, secure-link tokens, payment credentials, and sensitive attendee notes shall not appear in URLs sent to third-party analytics, ordinary logs, or error messages. Support access shall be least-privilege, attributable, and recorded. |

---

## 6. Integrity, payment reliability, and auditability

| ID | Requirement |
|---|---|
| **NFR-INT-01** | Online ticket holds, confirmed sales, free issuance, approved stock return, session registration, and venue registration shall preserve the brief's capacity invariants under concurrency. Expired holds shall no longer reserve inventory even if cleanup has not run. Approved type over-allocation does not allow sales above the overall sales limit. |
| **NFR-INT-02** | Order prices/currency/accepted totals shall remain immutable snapshots of the purchase agreement. Monetary arithmetic shall be exact for the supported currency precision; binary floating-point rounding shall not alter charges, refunds, or totals. |
| **NFR-INT-03** | Paid issuance shall require trusted provider confirmation matching the expected order, amount, currency, and payment destination/context. Browser return alone shall never establish payment. Retries/repeated provider messages shall not duplicate tickets or move an order backward to an obsolete state. |
| **NFR-INT-04** | Retried writes and offline uploads shall protect against duplicate effects. A repeated legitimate re-entry is distinct from retrying the same admission submission. Duplicate successful charges and late success without capacity shall create visible financial exception work rather than another usable ticket. |
| **NFR-INT-05** | Refund approval shall immediately disable the affected ticket in authoritative state. Failed/pending money movement shall not restore validity. Reversals/disputes shall restrict unused affected tickets while preserving prior admissions. Online decisions use current state; prepared offline decisions follow Section 7. |
| **NFR-INT-06** | Monime uncertainty shall remain pending/reviewable. A timeout shall not be interpreted as proof an operation failed; retries shall recover/reuse the original provider operation where appropriate. Checkout shall retain the original hold deadline. Event Dynamics shall not collect raw payment credentials or move organizer refund money in the MVP. |
| **NFR-INT-07** | Provider events and their processing state shall survive an application/worker restart once acknowledged. Business processing and required follow-up jobs shall be recoverable after partial failure. Email generation/delivery shall not be required to acknowledge a valid durably accepted payment event. |
| **NFR-INT-08** | Pending/unresolved payment operations shall be rechecked against provider state at least every 5 minutes while provider access is available, with a daily reconciliation of successful payments and recorded refunds. Respect provider limits and expose delayed reconciliation. Mismatches shall be recorded and assigned for operational resolution; this does not add a new customer-facing reporting module. |
| **NFR-INT-09** | Confirmed connected-record edits shall not silently overwrite a conflicting newer edit. Stale high-impact approvals shall be revalidated against affected current records; material differences require renewed approval. Multi-record actions shall expose partial completion and safe recovery rather than falsely reporting full success. |
| **NFR-AUD-01** | Important user, agent, provider-driven, and automatic-system activity shall be attributable and retained. Record actor/authorizer, organization/event, action, target, timing, outcome, and previous/new values where relevant; include device/admission provenance and approval/rule references where applicable. |
| **NFR-AUD-02** | Normal application users shall not modify or erase historical audit entries. Corrections shall append attributable records. Removal of a membership shall preserve its historical actions. Retention/anonymization operations may transform protected identity fields under authorized policies, with the transformation itself recorded. |
| **NFR-AUD-03** | Audit storage and technical logs shall minimize sensitive content. Do not copy unrestricted attendee notes or complete raw AI prompts into broadly accessible history. Investigator access to sensitive traces shall be separately restricted and audited. |

---

## 7. Offline admission and device behavior

| ID | Requirement |
|---|---|
| **NFR-OFF-01** | Normal online admission shall receive an authoritative server decision before displaying final admission success. Local QR decoding/cache lookup may give preliminary feedback. When the service cannot be reached, a prepared approved device may use clearly indicated offline admission; unprepared devices cannot safely invent offline validity. |
| **NFR-OFF-02** | Offline admission shall require a prepared event dataset and an authorization lease valid for at most 12 hours after the last successful authorization refresh, bounded earlier by the operator's access end or the final applicable admission window. Multi-day operation shall refresh at least every 12 hours. Show remaining offline authorization and last successful sync. A device may be prepared earlier, but its usable authorization must satisfy this lease at admission time. |
| **NFR-OFF-03** | Offline operation cannot instantly observe server-side revocation, refunds, cancellations, QR replacement, newly issued tickets, or another device's admissions. Display this limitation; reject expired local authorization, and route unknown tickets to online validation or staff review. Reconnection shall refresh restrictions before further normal online admissions. |
| **NFR-OFF-04** | Each offline success shall durably store a unique operation identifier, ticket/event, operator, device, admission time, applicable entry location/type, and synchronization state before successful feedback. App reload or ordinary restart shall not discard pending records. Physical device loss or destruction before synchronization is an explicit residual risk, not covered by server backup RPO. |
| **NFR-OFF-05** | Synchronization shall preserve conflicting admissions and corrections, including locally accepted tickets invalidated after preparation. Preserve the reported device time and server receipt time without assuming all device clocks agree. Manager resolution shall retain provenance. |
| **NFR-OFF-06** | Check-in undo shall require online authorization and authoritative commitment in the MVP. A disconnected staff member may record a note for review but shall not silently reset globally shared admission validity. This resolves the unspecified offline-undo behavior without removing the brief's authorized undo capability. |
| **NFR-OFF-07** | Offline datasets shall contain only the validation/search fields permitted for the operator's admission work. Financial data and sensitive food/access/emergency notes shall be excluded. Protect device-held data from unauthenticated use and remove expired validation data within 24 hours after final admission, on the next opportunity the application executes. Browser suspension cannot guarantee wall-clock deletion while the device is off. |
| **NFR-OFF-08** | Expiring validation data shall not erase unsynchronized admissions. After admission authorization expires, permit a restricted authenticated upload/recovery path, with no new admission rights. Pending records shall remain encrypted until acknowledged or explicitly handled through an audited recovery procedure; show an overdue-sync warning after 24 hours. |
| **NFR-OFF-09** | A 10,000-ticket prepared package shall be $\le$ 10 MB compressed before encryption, and its validation/search data plus 10,000 pending admission records shall fit within 50 MB measured client storage. Preparation shall finish within 30 seconds P95 on B1 and 120 seconds P95 on M1. Include permission filtering, download, integrity checks, and durable ingestion. Measure realistic field lengths and indexes. |

---

## 8. Availability, continuity, and external dependencies

| ID | Requirement |
|---|---|
| **NFR-AVL-01** | Public event/ticket access, checkout operations, payment-event acceptance, and online admission shall target 99.9% time-based availability per calendar month, measured 24/7. Core organizer manual operations shall target 99.5%. These are internal operating objectives, not customer SLA guarantees. |
| **NFR-AVL-02** | Measure critical journeys with continuous telemetry and one-minute synthetic probes. Attribute failures separately to Event Dynamics, networks, and providers, but do not remove externally caused end-to-end failures from the user-journey report. Legitimate sold-out/closed-sale/invalid-ticket outcomes are successful operation of the service. |
| **NFR-AVL-03** | Count maintenance and deployments that interrupt supported service against availability. Also report each live event's admission-window outages and maximum interruption; a monthly average shall not hide an event-day failure. Offline admission is resilience, not evidence that online admission remained available. |
| **NFR-AVL-04** | While organizational AI is disabled, exhausted, queued, or unavailable, permitted manual planning and operations shall remain usable. AI workload shall not exhaust resources reserved for admission, payment handling, and ordinary manual use. |
| **NFR-AVL-05** | Monime failure shall suspend unavailable paid-payment steps truthfully while preserving permitted free registration, existing tickets, and manual operations. Email failure shall retain secure order/ticket access and retryable delivery work. Existing operations shall not depend on an AI response to authorize ordinary manual use. |
| **NFR-AVL-06** | Pilot/pass expiry shall retain the brief's minimum 30-day read-only/export protection. Subscription payment failure shall have a 7-calendar-day recovery period from first failed renewal, disclosed at purchase. Thereafter allow billing/export, essential admission and corrections for issued tickets, and required attendee-protection/financial-resolution work. Expiry shall not invalidate issued tickets or delete records. |
| **NFR-AVL-07** | External requests shall have finite connect/read/overall timeouts and bounded retries with backoff. Initial Monime session-creation deadline is 15 seconds overall, with pending feedback within 1 second and a connection-establishment budget of 3 seconds. Timeout leaves a recoverable uncertain operation, not an automatic new charge. Actual provider limits/contracts shall be respected. |

*Notes:* For a 30-day month, 99.9% corresponds to approximately 43.2 minutes of unavailability, and 99.5% to 216 minutes. The disaster objectives below do not grant permission to consume those amounts routinely. A severe incident may breach availability even if disaster restoration meets RTO; record both outcomes and prioritize remediation.

---

## 9. Durability, backups, and disaster recovery

RTO is the maximum target restoration time after the defined disruption begins. RPO is the maximum time window of committed changes potentially unavailable after restoring from the defined disaster. It is not a count of records. Recovery includes verification and reconciliation needed for safe service, not just starting a database.

| ID | Requirement |
|---|---|
| **NFR-REC-01** | An ordinary application/worker restart or a single application-instance failure shall not lose acknowledged committed server records or acknowledged jobs. Retried work shall preserve idempotency. Offline device records have their own durability boundary in Section 7. |
| **NFR-REC-02** | For catastrophic loss of the active production data store, ticketing, payment, refund, admission, role, and audit records shall have RPO $\le$ 1 minute. Other planning records shall have RPO $\le$ 15 minutes. If records share recovery infrastructure, the stricter applicable objective governs that shared recovery. |
| **NFR-REC-03** | Catastrophic-disaster RTO shall be $\le$ 60 minutes for critical ticketing, online admission, and the access services they need; $\le$ 4 hours for the remaining manual workspace; $\le$ 8 hours for AI and historical analytics. Routine recoverable application incidents shall target critical-service restoration within 15 minutes. These objectives require demonstrated procedures. |
| **NFR-REC-04** | Disaster recovery shall reconcile provider-confirmed financial operations, surviving durable event/job records, device admissions, and potentially stale permissions before reopening affected mutations. Where safety cannot be established, retain restricted/review operation rather than restoring revoked access or reselling uncertain inventory. Include reconciliation time in RTO. |
| **NFR-REC-05** | Automated encrypted backups and recovery records shall support point-in-time restoration meeting the required RPO. Keep operational recovery history for 30 days in an independently protected failure boundary; backup credentials shall not be available to ordinary application users. |
| **NFR-REC-06** | Perform a complete restore/reconciliation exercise before launch, quarterly thereafter, and after material recovery changes. Record actual recovery time, recovered point, integrity checks, and exceptions. Alert on backup/recovery-record failures within 15 minutes. |
| **NFR-REC-07** | Document device loss, regional/provider outage, accidental deletion, corrupted deployment, and credential compromise procedures. Backup retention is not the seven-year financial-record retention policy. Restored data shall reapply recorded deletion/anonymization restrictions before ordinary user access resumes. |

---

## 10. Privacy, retention, and controlled access to data

| ID | Requirement |
|---|---|
| **NFR-PRI-01** | Required processing consent, optional attendee marketing consent, optional Event Dynamics customer emails, and organizational AI agreement shall remain separately recorded and independently enforceable. Optional choices shall not be preselected. Material AI agreement changes shall not authorize newly covered processing without owner acceptance. |
| **NFR-PRI-02** | Attendee profile and attendance information shall default to 24 months after event end, with permitted shorter organization settings. Order/payment/refund/consent/financial records shall remain for at least seven years, and longer under an applicable legal hold. For engineering scheduling, use the latest associated financial/consent activity as the seven-year start, subject to launch policy/legal validation. |
| **NFR-PRI-03** | Retention expiry shall be evaluated daily and eligible live data removed/anonymized within 7 days. Approved deletion requests shall be completed within 30 days unless a documented legal or active-dispute obligation requires restriction/retention. These are product operating deadlines, not an assertion of local law. |
| **NFR-PRI-04** | Expired/deleted data may persist in restricted backups only until the 30-day operational backup cycle expires. It shall not be restored to ordinary use. Retained financial evidence shall minimize unnecessary attendee identity and sensitive needs information. |
| **NFR-PRI-05** | Routine diagnostic logs shall be retained 30 days; restricted security/incident investigation logs 90 days; identified evidence may follow a documented case/legal hold. Audit records shall follow their associated business retention class. Restricted raw AI debugging traces shall be off by default and, when needed, retained no longer than 7 days. |
| **NFR-PRI-06** | AI processing shall send only permitted task-relevant data. Provider arrangements shall not allow organization content to be used for unrelated model training by default. Document processor locations, retention, and terms; disclose approved cross-border processing. Sierra Leone launch scope does not itself establish a data-residency law. |
| **NFR-PRI-07** | Launch requires approved organizer-facing privacy/consent/retention wording and validation of applicable market obligations. This does not block engineering design or turn the NFR document into legal advice. |

---

## 11. AI quality, responsiveness, safety, and cost

AI completion targets apply to the declared job class and accepted workload when dependencies respond within their measured operating envelope. Provider outages and timeouts remain visible failures; they are not silently counted as successful completions. A tool-call acknowledgment or generic placeholder shall not count as a substantive answer.

| ID | Requirement |
|---|---|
| **NFR-AI-01** | No organizational AI processing shall occur before owner enablement or after disablement takes effect. Agents shall use the same record permissions and validations as manual operations. Retrieved documents, messages, and research content shall be treated as data, not authority to change permissions or authorize actions. |
| **NFR-AI-02** | Human-required approvals shall remain binding. Financial approval, cancellation approval, role/access changes, payment-account changes, and other restricted work shall never be authorized by general AI agreement alone. The brief's Recommend only, Ask before acting, and explicitly ruled automation modes shall govern execution. A direct instruction in Ask before acting mode shall not silently bypass its approval step. |
| **NFR-AI-03** | Background AI work shall require an active rule defining scope, triggers, reads/writes, authorizer, allowed actions, duration, recipients, and approval requirements. Recheck rule, permission, plan, and AI-enabled state before every mutating step. Organization/event pause controls shall stop new automatic mutating steps within 5 seconds; retain history and pending proposals. Previously committed effects remain recorded. |
| **NFR-AI-04** | Material assumptions, research sources, cost effects, affected records, recipients, and unresolved conflicts shall be visible before approval. Distinguish confirmed facts, prior-event facts, preferences, suggestions, and assumptions. Readiness scores shall derive from visible checks rather than an unexplained model judgment. |
| **NFR-AI-05** | Deterministic rules such as capacity, permission, arithmetic, valid transitions, and known scheduling constraints shall be validated by application logic against current records. An AI assertion shall not substitute for these checks. Practical reversal/partial-failure limits shall be disclosed before applying high-impact changes. |
| **NFR-AI-06** | Accepted interactive AI requests shall receive a visible acknowledgment within 1 second P95 and 2 seconds P99. Under the accepted mixed workload, interactive execution shall start within 60 seconds P95; show queue state until then. A simple question over already available event context shall show substantive output within 10 seconds P95 and 30 seconds P99 from execution start. Report submission-to-output time as well; do not disguise queue waiting as immediate response. |
| **NFR-AI-07** | A bounded direct instruction needing no external research and inspecting no more than 100 related records shall produce a disambiguation request or reviewable action preview within 30 seconds P95 and 90 seconds P99. Larger changes shall be classified as background jobs rather than truncating effect analysis to meet latency. |
| **NFR-AI-08** | Whole-event plans and research jobs shall be accepted as trackable background work within 1 second P95 and 2 seconds P99. Under the accepted queue load, start execution within 5 minutes P95; target a useful completed draft within 10 minutes P95 of execution start for a bounded one-event job. Stop or request an explicit continuation at a 15-minute execution budget. The initial acceptance fixture is one event with up to 10 planning sections and 20 retrieved research pages. |
| **NFR-AI-09** | Running jobs shall expose truthful stage/status and a liveness update at least every 10 seconds while the foreground connection is active. Percent complete is optional and shall be used only when meaningful. Navigation and permitted manual work shall remain interactive. |
| **NFR-AI-10** | A cancellation request shall be acknowledged within 1 second P95 and recorded within 2 seconds P99. No new mutating step may start after cancellation is recorded; running cooperative local work shall stop within 10 seconds. External work already dispatched may finish, but its result shall not trigger new mutations. Report effects already committed and any practical reversal separately. |
| **NFR-AI-11** | The platform shall support the 50-job class mix specified in the mixed-load test, not 50 simultaneously executing research jobs. Initially allow at most 10 executing jobs platform-wide, 2 per organization, and at most 100 waiting jobs platform-wide/20 per organization. Use fair scheduling with interactive work protected from a background-only queue. Accept work only when its start budget can be met; excess submissions receive a clear retry/queue-full response without charge. A queued job waiting 10 minutes without starting shall fail visibly and release reserved units. |
| **NFR-AI-12** | Show an estimated AI-unit amount or range before every user-initiated job and obtain explicit approval for its upper spending bound. An automatic rule shall have a per-run and daily unit ceiling set by its authorizer. Do not exceed an approved bound or purchase top-ups automatically. The unit-to-work schedule shall be versioned and visible; this NFR does not set new plan or top-up prices. |
| **NFR-AI-13** | Unit accounting shall resist duplicate deductions under retries, spend included monthly units before purchased units, preserve purchased units for at least 12 months, and return units for Event Dynamics failures. A multi-record request is one measured job. Manual operations consume no AI units. |
| **NFR-AI-14** | Before launch and material model/prompt/tool changes, evaluate at least 100 representative cases covering planning, ambiguity, permissions, cross-organization retrieval, malicious retrieved instructions, capacity changes, partial failure, and cancellation. Require no unauthorized mutations/data disclosure, no fabricated successful tool actions, and at least 90% task-appropriate correct outcomes on the versioned fixture. Research cases require source inspection; automation precision shall not be inferred from fluent prose. |

---

## 12. Usability, accessibility, compatibility, time, and currency

| ID | Requirement |
|---|---|
| **NFR-UX-01** | Onboarding, public checkout, secure ticket access, organizer core flows, and check-in shall meet WCAG 2.2 AA for the Event Dynamics-controlled interface. Test keyboard operation, focus, contrast, zoom/reflow, status announcements, and non-color-only results. Camera admission shall have a usable manual-search alternative. |
| **NFR-UX-02** | Core web flows shall support the current and previous stable major versions of Chrome, Edge, Firefox, and Safari on desktop at release qualification; mobile Chrome on supported Android and Safari on current/previous iOS majors. Maintain a versioned tested matrix. Offline check-in approval requires passing preparation, restart, storage, camera, sync, and expiry tests on that actual device/browser; basic browsing support alone is insufficient. |
| **NFR-UX-03** | Validate key phone flows at 360 CSS pixels width without two-dimensional scrolling, except inherently wide optional data views with an accessible alternative. Permission, pending-payment, expired-hold, offline, and failed-job messages shall explain the state and available next action. Audio is optional; visible accessible feedback is required. |
| **NFR-UX-04** | Before launch, at least 4 of 5 representative first-time organizer testers shall complete account/organization onboarding through manual exploration without facilitator intervention in 10 minutes, excluding waiting for email delivery/payment. At least 4 of 5 trained temporary-staff testers shall complete QR admission, manual lookup, and identification of a duplicate/offline state without critical error in a scripted exercise. Record problems and repeat failed critical flows after fixes. |
| **NFR-UX-05** | English is the launch interface language. Text and formatting shall support later localization without changing underlying business data; no additional launch translation is promised. Use Unicode for names and content. |
| **NFR-UX-06** | Store unambiguous instants and the applicable named time zones. Event schedules and ticket validity shall use the event time zone as authority; where shown in a user's preferred zone, label the zone clearly. Test midnight boundaries, multi-day events, clock changes, and disagreement between client and server clocks. |
| **NFR-UX-07** | Paid ticketing shall use SLE and one selling currency per event as the brief requires. Platform billing currency is separate. Display currency codes unambiguously; do not mix dollar reference plan prices with collected local amounts. Localization shall not introduce multi-currency ticketing, automatic exchange pricing, or new tax-calculation scope. |

---

## 13. Files, imports, exports, and storage

| ID | Requirement |
|---|---|
| **NFR-DAT-01** | Initially permit PDF, JPG/JPEG, PNG, WebP, DOCX, XLSX, CSV, and TXT uploads up to 25 MB each. Validate actual content/type and size, quarantine until malicious-content checks complete, prevent executable/active-content delivery, and enforce parent-record permissions on download. CSV imports have the additional limit below. |
| **NFR-DAT-02** | The initial attachment quota is 2 GB per event, shown before approaching the limit. At 80% and 95% notify authorized event administrators. Exceeding it may block new attachments but shall not block required ticket, payment, admission, or audit records. Count uploaded files and stored derivatives; financial/admission record retention is not constrained by an attachment quota. This is a new engineering/storage allowance requiring clear product display. |
| **NFR-DAT-03** | A guest CSV import shall accept up to 10,000 rows and 10 MB. Durably accept a completed upload within 2 seconds P95; validate and present import/duplicate-review results within 60 seconds P95 and 120 seconds P99 under the mixed workload. Never silently merge uncertain identities. Per-event plan limits govern applied records, not whether a file can be inspected. |
| **NFR-DAT-04** | Exports above 1,000 rows shall run as background work. An export of up to 100,000 permitted rows/50 MB shall finish within 2 minutes P95 and 5 minutes P99 under the mixed workload. Larger organization exports shall be split into bounded jobs without losing required export capability. |
| **NFR-DAT-05** | Export download credentials shall expire after 24 hours and recheck current permission before delivery; generated files shall be removed within 7 days. Large CSV files shall neutralize spreadsheet-formula injection. Financial exports shall preserve distinct payments, refunds, fees, and expected organizer revenue. |
| **NFR-DAT-06** | Private documents and exports shall not be placed in publicly discoverable storage. Previously downloaded content cannot be revoked remotely; this limitation shall not excuse continued unauthorized downloads from the platform. |

---

## 14. Observability and operational support

| ID | Requirement |
|---|---|
| **NFR-OPS-01** | Collect structured technical logs, service metrics, and request/job correlation information for critical operations, separate from customer-visible activity history. Measure latency distributions, technical error rate, throughput, queue age, dependency performance, saturation, and cost. Tracing coverage may be sampled, but errors and financial/admission operation identities must remain investigable. |
| **NFR-OPS-02** | Monitor authentication abuse, authorization failure, hold contention, ticket issuance, provider-event backlog, reconciliation mismatches, email failures, unsynced admission counts, offline conflicts, AI failures/costs, backup health, and storage quotas. Observability shall not expose secrets or unrelated tenant data. |
| **NFR-OPS-03** | Page the designated operator within 5 minutes of detecting a critical outage, critical payment-processing backlog exceeding 5 minutes, suspected integrity/security violation, or sustained admission/checkout failure. During scheduled supported live-event windows, an assigned operator shall acknowledge the alert within 15 minutes. Outside those windows, acknowledgment target is 30 minutes. Arrange coverage before accepting live-event commitments. |
| **NFR-OPS-04** | Under each accepted critical workload, technical failure/timeout rate shall be $\le$ 0.1%. Expected business refusals shall be reported separately. After a 60-second burst, critical processing backlog shall return to its sustained-load level within 2 minutes while normal arrivals continue. Do not interpret the error allowance as permission for integrity/security failures. |
| **NFR-OPS-05** | Expose truthful user-facing failures and support references. Internal investigation shall use scoped access with activity recording, not shared administrator credentials. Runbooks shall identify ownership, safe retries, recovery, escalation, and customer communications for each critical failure class. |
| **NFR-OPS-06** | Review real workload/latency/cost after the first three live events and monthly thereafter. Trigger a capacity review when sustained use exceeds 70% of measured safe capacity or an upcoming event exceeds tested conditions. Any target revision shall record evidence, impact, and the new version. |

---

## 15. Maintainability, release safety, and acceptance

| ID | Requirement |
|---|---|
| **NFR-ENG-01** | Business rules and authorization outcomes shall be testable independently of UI and AI wording. Maintain clear ownership of domain logic and external integrations; do not duplicate divergent permission/payment rules across manual and AI paths. This does not prescribe deployment topology. |
| **NFR-ENG-02** | Every release shall pass affected automated checks for tenant isolation, authorization, financial/admission integrity, migrations, and core journeys. Changes to critical write paths require concurrency/retry/failure tests. Changes to AI behavior require the defined evaluation fixture. |
| **NFR-ENG-03** | Releases and schema changes shall preserve existing tickets, valid sessions within policy, pending payments, and queued work. A failed deployment shall be recoverable within 15 minutes through a tested rollback or safe forward-fix procedure. Irreversible migrations require verified recovery and may not rely on an untested rollback claim. |
| **NFR-ENG-04** | Production configurations, dependency versions, infrastructure assumptions, data migrations, and recovery procedures shall be reproducible and version controlled. Secrets remain outside source control. Review dependencies for known exploitable vulnerabilities before release; no known exploitable critical issue may ship. |
| **NFR-ENG-05** | Monitor operating cost per event, ticket workflow, retained GB, and AI job. Notify the responsible operator at 80% and 100% of the configured monthly infrastructure/provider spending budget. Cost controls may queue low-priority work, but shall not invalidate issued tickets or discard financial/admission evidence. |

### Required acceptance evidence
The following are release gates, not additional product features:
- **Capacity/performance:** three passing runs of relevant sustained, burst, simultaneous, and mixed scenarios; sufficient samples for reported percentiles; test configuration and costs retained.
- **Integrity:** no invariant violations during final-stock races, repeated/delayed provider events, duplicate submissions, free issuance, re-entry, refund approval/failure, and cancellation.
- **Authorization:** passing fixed/custom-role, inherited-access, secure-link, revocation, file/export, AI retrieval, and background-rule tests across multiple organizations.
- **Offline:** two-device duplicate conflict, stale refund/QR/access data, lease expiry, app restart with unsynced records, device reconnection, and restricted recovery upload; no erased conflict history.
- **Dependencies:** payment timeout with uncertain success, email outage, AI outage, worker interruption, and job cancellation; manual continuity and truthful states preserved.
- **Recovery:** timed restore plus reconciliation proving RPO/RTO and safe reopening. A backup-success message alone is not evidence of recoverability.
- **Client experience:** physical-device/browser matrix, accessibility checks, onboarding/admission usability exercises, and network-profile results.
- **Operations:** functioning alerts, designated live-event coverage, runbooks, quotas, and dashboards before the first supported live event.

*No numerical target above is a claim that the system has already passed these gates. Capacity beyond the tested envelope requires additional validation; architectural complexity should follow measured needs.*

---

## 16. Sources and decision record

**Product sources:** Event Dynamics — Revised Minimum Viable Product Brief v2.1; the user's finalized 263-item functional requirements (14 September 2026); the prior NFR and performance drafts; the admission workload accepted in conversation and subsequent ticketing workload proposal. This version resolves their conflicting engineering targets under the user's explicit authority to decide assumptions. It does not change the brief's commercial prices, payment custody, human approval boundaries, or excluded features.

### External technical references
1. The password-hashing baseline in **NFR-SEC-06** follows [OWASP Password Storage guidance](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html). Session/token durations here are Event Dynamics decisions, not claimed OWASP-prescribed durations; see [OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) for implementation considerations.
2. **NFR-PER-14** uses the published [Core Web Vitals thresholds and field/lab measurement distinctions](https://web.dev/articles/vitals).
3. **NFR-UX-01** chooses [WCAG 2.2 AA](https://www.w3.org/TR/WCAG22/) for the new product; W3C advises using WCAG 2.2 for future applicability.
4. RTO/RPO terminology and cost/recovery distinctions follow the [Google Cloud disaster-recovery planning guide](https://docs.cloud.google.com/architecture/dr-scenarios-planning-guide). The selected Event Dynamics targets are independent engineering decisions.
5. Monime session recovery must use the current provider contract, including its documented [checkout-session idempotency support](https://docs.monime.io/apis/versions/caph-2025-08-23/checkout-session/create-checkout-session). This document does not assert a Monime latency SLA.

### Decisions replacing earlier proposals

| Earlier proposal or ambiguity | Decision in this baseline |
|---|---|
| Local-first final admission even while online | Authoritative online commitment; bounded, visibly offline operation when disconnected. |
| Offline check-in undo | Online-only authoritative undo for MVP. |
| Unlimited/undefined offline duration | 12-hour refreshed device/operator authorization, bounded by earlier access/admission expiry. |
| 250 ms camera-to-success guarantee | Separate camera acquisition from validation; 500 ms P95 offline validation and 1 second P95 online backend validation. |
| Universal 20–100 ms SQL/internal-operation ceilings | Measured operation budgets; internal optimization chosen after profiling. |
| Three-second Monime request failure assumption | 15-second overall initial deadline with quick pending feedback and recovery of uncertain operations. |
| Full ticket issuance required before webhook acknowledgment | Durable verified acceptance measured separately from correct business processing. |
| Five-second AI first-token abort | Job-class budgets, truthful progress, finite execution budgets, and safe cancellation. |
| One-second guarantee of terminating external AI work | Fast cancellation acknowledgment and prevention of new mutations; external completion may outlive local cancellation. |
| Unexplained 25-unit estimate threshold | Estimates and approved upper bounds for every initiated AI job; rule budgets for automation. |
| Offline package limited to roughly 80–100 bytes per attendee | Measured $\le$ 10 MB package and $\le$ 50 MB local footprint for the defined 10,000-ticket workload. |
| Low platform-wide rates below a single busy event | Explicit simultaneous and mixed workload tests derived from the agreed per-event scenarios. |
| Undisclosed subscription recovery period | 7 calendar days, with attendee-protection exceptions afterward. |
| Generic disaster targets without reconciliation | RPO/RTO by data/service class, including safe reconciliation before restored mutations. |
