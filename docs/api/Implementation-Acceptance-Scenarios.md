# Event Dynamics implementation acceptance scenarios

**API v0.2.0.** These are executable test requirements for a future implementation. They are not tests run by this document-revision task. The separate validation JSON files report the static checks that were actually run.

Each scenario should assert response shape, durable database state, current authority, audit/outgoing-work evidence and subsequent retry behavior where relevant. Use independent transactions/processes for races; sequential mocks do not establish concurrency safety.

## Identity and access

| ID | Scenario and expected result |
|---|---|
| AUTH-01 | An active external event member discovers and reads only their event without OrganizationMembership; organization administration remains unavailable. |
| AUTH-02 | Suspend an internal organization membership: an old external grant must not restore access. Preserve historical actor evidence. |
| AUTH-03 | An Organization Admin attempts owner promotion, owner removal, AI agreement enablement, payment connection setup and nondelegable cancellation approval: all are refused. |
| AUTH-04 | Concurrently remove/demote the last active owners: retain at least one active organization owner and the required event-owner assignment invariant. |
| AUTH-05 | Reuse another event's room, ticket, template binding, attachment, memory source or expense ID: refuse without leaking the foreign object. |
| AUTH-06 | Assign a custom sensitive role without matching current approval, then edit its role/scope: sensitive expansion stays inactive until exact new approval. |
| AUTH-07 | Approve a pending invitation before the recipient has an account; acceptance binds the approved identity/scope to the resulting membership without widening it. |
| AUTH-08 | Revoke permissions while search, export download, job execution or SSE replay is in progress: current field/record authorization still governs every exposure and step. |

## Retry and concurrency

| ID | Scenario and expected result |
|---|---|
| MUT-01 | Omit a required retry key or precondition: no mutation. Missing If-Match yields 428; stale yields 412. |
| MUT-02 | Commit an edit and lose its response; replay the same key/body/old precondition: return the original result once, without stale-precondition rejection or duplicated effects. |
| MUT-03 | Reuse a key with changed body or reviewed version: 409 idempotency conflict. Another principal cannot retrieve the original principal's replay. |
| MUT-04 | Replay after access revocation: no cached secret/result bypass. Retry after HTTP-cache expiry: domain uniqueness still prevents duplicate tickets, admissions, charges and ledger effects. |
| MUT-05 | Update different ticket types concurrently against one event cap: shared event capacity remains valid. A cancelled withheld unit and an unexpired hold both consume the documented stock. |

## Checkout, payment and refunds

| ID | Scenario and expected result |
|---|---|
| SALE-01 | Changed price, type revision or required policy bundle between browsing and reservation: return conflict and require review of the new offer. |
| SALE-02 | Repeated checkout reservation does not extend the original 15-minute hold. Expired holds stop consuming stock even before cleanup runs. |
| SALE-03 | Free confirmation issues each order unit once without a payment attempt. Mixed paid/free checkout is refused. |
| SALE-04 | Required attendees are assigned before ticket issuance; deferred assignment respects the snapshotted deadline and admission rule. |
| SALE-05 | Successful payment after hold expiry: reacquire capacity for the complete eligible order or issue none and create financial exception/refund work. |
| SALE-06 | Late success after explicit order/event cancellation: preserve the payment, issue no new ticket, create resolution work. Sales pause alone does not invalidate an already eligible payment resolution. |
| SALE-07 | Two distinct successful charges for one order: one primary funding payment, one ticket per unit, separate duplicate-charge refund case. Refunding/disputing the excess payment leaves primary-funded tickets intact. |
| SALE-08 | Wrong amount, currency, destination or merchant context: no fulfillment based on that evidence. Repeated provider delivery creates no duplicate exception work. |
| SALE-09 | Refund before any ticket exists: identify the unfulfilled payment. Arbitrary partial-value refund input is rejected. |
| SALE-10 | Cancel a partly admitted order: per-ticket outcomes are truthful, effective admission requires undo, and the order is not reported wholly cancelled while a ticket remains active. |
| SALE-11 | Event cancellation approval races with payment or online admission: the cancellation guard serializes the decision; durable fan-out resumes after a worker crash. |
| SALE-12 | Connection replacement during an uncertain attempt: recovery uses the original destination/credentials context, not the new connection. |
| SALE-13 | Ticket-scoped secure access tries to read sibling tickets/order finance; recovery email enumeration; an expired/revoked parent grant with a live child session: no unauthorized disclosure. |
| SALE-14 | QR resend versus replacement: resend preserves credential version; replacement invalidates the old credential without creating a ticket or changing financial state. |

## Admission and offline recovery

| ID | Scenario and expected result |
|---|---|
| ADM-01 | Concurrent online scans of a one-entry ticket: one effective admission. A retry with the same operation ID returns its prior decision. |
| ADM-02 | Re-entry uses a new operation ID and the purchased re-entry rule; a wrong-event credential reveals no foreign attendee. |
| ADM-03 | Admission response is returned only after required occurrence/audit/outbox records are durable. Technical failures are not counted as successful business decisions. |
| ADM-04 | Change the signed offline lease, dataset digest, operator, device or credential version: reject activation or preserve the suspicious upload for restricted review, never silently trust it. |
| ADM-05 | Device clock rollback, reboot or lost time anchor: no new offline rights from an uncertain clock. Validation-data expiry does not erase pending scan evidence. |
| ADM-06 | Upload a valid original occurrence after admission lease expiry/revocation using recovery authority: preserve and classify it without granting a new admission right. |
| ADM-07 | Repack the same operations into different batches; lose the response halfway through persistence; reuse an operation ID with changed data: no duplicate accepted count, and conflicting evidence remains inspectable. |
| ADM-08 | Two offline devices admitted the same one-entry ticket: preserve both reported physical occurrences, create conflict, count according to explicit resolution rules and never overwrite history. |
| ADM-09 | Client deletes a pending local record only after its own operation ID has a durable acknowledgement; whole-upload 503 leaves all uncertain records retryable. |
| ADM-10 | Undo and conflict correction append evidence and adjust distinct-attendee/entry-event aggregates without pretending the physical occurrence never happened. |

## Planning, AI, billing and data

| ID | Scenario and expected result |
|---|---|
| PLAN-01 | Edit a public session draft: effective attendee schedule stays unchanged until validated publication. Concurrent publication and registration preserve capacity and attendee-wide nonoverlap. |
| PLAN-02 | Register the same attendee using different tickets for overlapping sessions: the attendee guard still refuses overlap. A draft warning override cannot waive this hard constraint. |
| PLAN-03 | Apply a template twice with the same command key: one application with source revision provenance. Reject cross-event dependencies/cycles and invalid resource links. |
| PLAN-04 | Record partial expense payments and reversals: net totals are derived; cumulative reversal cannot exceed its source payment; no vendor transfer is initiated. |
| PLAN-05 | Approve readiness, then materially change a dependency: old approval cannot authorize the changed event without re-evaluation. |
| AI-01 | Expired quote, omitted cap, insufficient eligible lots or full queue: reject without billable execution or leaked reservation. |
| AI-02 | Concurrent AI jobs/rule runs across a daily boundary: reserved plus consumed units obey both per-run and reservation-day daily caps; lot expiry and eligibility remain correct. |
| AI-03 | Approve a proposal, then edit its content/dependency/permissions: execution refuses stale approval and cannot substitute an arbitrary operation or input field. |
| AI-04 | Crash after one action commits: resume skips that committed effect; partial results and remaining work are truthful. A model call acknowledgement is not substantive output. |
| AI-05 | Pause organization/event or revoke rule authority during execution: no new automatic mutating step after the required bound; committed changes remain recorded. |
| AI-06 | Promote a private memory: reviewer sees only the submitted shareable snapshot; approval creates company knowledge without making other private conversation visible. |
| BILL-01 | Duplicate confirmed platform payment: activate one entitlement/AI-unit lot. A pending/review-required record does not grant paid rights. |
| BILL-02 | Cancel subscription renewal, retry a failed renewal, or replace coverage: preserve paid-through rights, do not extend the fixed recovery window by retry, and protect issued-ticket financial/admission work. |
| DATA-01 | Apply reviewed import rows with a crash/retry: stable row identities prevent duplicate profiles; import does not silently issue tickets or admissions. |
| DATA-02 | Export permission is revoked after job acceptance: download is refused. Parent-bound attachment scanning/quota and privacy retention rules remain effective. |

## Realtime and NFR evidence

| ID | Scenario and expected result |
|---|---|
| RT-01 | Split SSE UTF-8 frames across arbitrary network chunks and multiline data; parser reconstructs complete events without corrupting cursors. |
| RT-02 | Commit changes during initial snapshot/read and reconnect: buffered invalidations plus REST refresh converge without regressing resource revisions. |
| RT-03 | Expired, forged, wrong-scope or previous-generation cursor: explicit resync and refresh, never silent partial replay. |
| RT-04 | Slow subscriber exceeds message/byte bound: close and resync; no unbounded memory growth. Heartbeats/liveness do not advance durable cursors. |
| RT-05 | Revocation on every channel, including order access: stop further protected delivery within the required five seconds, whether or not the final control message can be delivered. |
| NFR-01 | Measure documented backend latency separately from provider time, queue execution and committed-change-to-render freshness. Do not report HTTP 202 acknowledgement time as payment/AI completion. |
| NFR-02 | Rerun the workload model with authorization filtering, replay storage, invalidation-triggered reads and public-cache revalidation. Report actual percentiles under required network/load profiles. |

Provider and device security fixtures must also satisfy `Provider-Integration-Gates.md`. Complete exact FR-to-operation traceability against the finalized 263-row register before treating requirements coverage as certified.
