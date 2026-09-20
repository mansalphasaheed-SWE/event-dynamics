# Event Dynamics integration gates

**Applies to API v0.2.0 — 19 September 2026.** These are specific unresolved integration contracts, not requests for permission to revise the API. The draft API revisions are complete; the affected integrations cannot honestly be called implementation-ready until the evidence below exists.

## PROVIDER-01 — connection provisioning

The original contract assumed an authorization-code connection flow. The reviewed Monime material documents API authentication and personal access tokens; it did not establish the assumed OAuth flow. The revised API accepts an opaque provisioning reference from an approved secure provisioning process. It does not pretend that process is already implemented. See [Monime authentication](https://docs.monime.io/developer-resources/api-basics/authentication) and [personal access-token documentation](https://docs.monime.io/developer-resources/authentication).

Before enabling connection setup, the integration implementer must establish the supported credential acquisition method, required collection/read permissions, merchant/Space ownership checks, environment binding, secret vault storage, rotation and historical-connection access. Produce a successful sandbox fixture and rejected wrong-Space/wrong-environment fixtures. Define the secure process that creates the one-use owner/tenant-bound provisioning reference; no UI may invent one.

Connection replacement applies to new payment work. Older attempts, refunds and reconciliation retain their original connection/destination identity. Disconnection must not erase that identity or pretend an uncertain payment failed.

## PROVIDER-02 — inbound webhook wire contract

The main specification records the intended ingress route as `/v1/integrations/monime/{connectionRoutingId}/events` under `x-provider-ingress`. It is deliberately not an enabled OpenAPI operation yet.

The reviewed webhook API allows verification configuration including HS256/ES256 and release selection. A separate structure guide uses an explicitly older payload version. Those sources do not justify copying the original draft's exact signature headers or envelope into a production handler. See the [webhook object](https://docs.monime.io/apis/versions/caph-2025-08-23/webhook/object), [webhook creation](https://docs.monime.io/apis/versions/caph-2025-08-23/webhook/create-webhook), and [versioned payload example](https://docs.monime.io/guide/webhook/structure).

The integration implementer must capture and pin:

1. Selected provider API release, exact header names, signing input and raw-body handling; algorithm, timestamp/replay checks, key rotation and unknown-key handling.
2. Exact payment, failure, reversal/dispute and refund-related event payloads supported by that release, including optional/missing fields.
3. Provider event identity domain: merchant/Space, environment and event identity; supported acknowledgement statuses, delivery retries and timeout expectations.
4. Durable ingress receipt and recoverable processing handoff. If persistence fails, do not acknowledge success. A duplicate delivery must find the preserved event and processing obligation.
5. Sandbox fixtures for valid, malformed, invalid-signature, duplicated, delayed and out-of-order messages; forged tenant identifiers; destination/amount/currency mismatch; process crash after commit.

Only after those fixtures pass should the route become an OpenAPI Path Item with its verified provider security scheme and wire schema. Internal normalized payment facts are separate types; they must not be advertised as Monime's envelope.

## PROVIDER-03 — outbound operations and reconciliation

Pin checkout creation, read/status lookup, external idempotency semantics, terminal versus uncertain outcomes, and merchant-scoped reference matching. Create the durable ProviderOperation before dispatch. Recover uncertain work with the original identity; a client retry must not create a second uncertain charge.

Evidence must include a timeout after remote success, duplicate successful charges, late success after reservation expiry, cancellation before confirmation, connection replacement during a pending attempt, and provider unavailability during reconciliation. Test success with incorrect amount/currency/destination as rejected payment evidence. Verify return URLs and hosted checkout hosts without treating the browser as authoritative.

Organizer refund execution remains outside the MVP platform. Event Dynamics records approved refund obligations and evidence; it does not fabricate an outbound refund API or initiate transfers. Organizer-reported completion is evidence, not independently confirmed provider truth.

## CONFIG-01 — commercial configuration

Approved price versions, currency, applicable taxes if any, billing terms, renewal behavior, event-pass limits and AI-unit pricing must come from actual approved configuration. No prices were invented in this revision. Quotes bind immutable configuration and accepted totals. Missing configuration returns a truthful unavailable state and cannot activate benefits.

Platform billing uses its own payment context, separate from an organizer's attendee-ticket connection. Sandbox duplicate confirmations must activate each entitlement/AI-unit lot once. The restricted billing exception process must expose `review_required` to the organization without leaking unrelated provider data.

## DEVICE-01 — offline cryptography and trusted time

The spec defines the required provenance, capped lease, signed manifest, encrypted dataset, protected recovery credential and uncertain-clock behavior. It does not select an untested cryptographic format. The device implementer must pin the key formats, algorithms, signature canonicalization, key identifiers/rotation, encrypted package format, storage protection and supported browser/device behavior.

Demonstrate rejection of altered datasets, leases and scan records; wrong device/operator; expired lease; clock rollback; reboot without a trustworthy time anchor; revoked online authority; and recovery upload after lease expiry. Prove that deleting validation material does not delete unacknowledged occurrence records. A supplied device ID is not device authentication.

## Required release evidence

Keep the selected documentation/release identifiers, sanitized request/response fixtures, automated verification outputs and failure/recovery results beside the implementation. Complete the corresponding routes/schemas where a gate deliberately withholds a wire contract. Static YAML validation cannot satisfy these gates.
