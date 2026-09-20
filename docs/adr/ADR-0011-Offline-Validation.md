# ADR-0011 — Offline verification without ticket-minting secrets

**Status:** Amended design baseline; original accepted decision retained except where explicitly superseded below.
**Revision:** 1.1 — 19 September 2026
**Alignment:** Core Entities v1.1; OpenAPI/AsyncAPI v0.2.0; HLD v1.3; Technology Stack v2.2.

## Context and decision

Keep an encrypted, permission-filtered offline package containing QR credential hashes and minimal validation/search fields. Do not store original ticket-minting secrets or server signing private keys in the dataset.

The old “no secrets reach the device” sentence is too broad: the device needs a protected decryption key and recovery credentials, and necessarily sees a QR credential transiently when scanning. Public verification keys are also allowed. Separate these from ticket-minting and server signing secrets; never log or retain scanned raw secrets unnecessarily.

## Authority and local evidence

Bind activation to signed DeviceAuthorization and an integrity-verified OfflineDatasetManifest: operator/device/event/scope, validity, dataset cutoff/digest and relevant key identity. Use a trusted server-time anchor and detect rollback/uncertain time; uncertainty cannot extend offline authority.

Commit each local occurrence before displaying success. Keep its stable operation ID and original authorization, dataset and credential provenance. Repeated batch upload must return stable item outcomes without duplicating admission.

A hash match recognizes a credential in the prepared snapshot; it does not prove current server validity, prevent copying a presented QR, or coordinate one-entry checks across offline devices. Preserve stale-state and duplicate conflicts for review. Unknown credentials route to online validation or staff review.

## Expiry and consequences

Expired authorization permits no new admission. Restricted authenticated recovery must still upload pending records, even if fresh authorization/dataset download is unavailable. Remove expired searchable data according to policy while retaining protected pending evidence until acknowledged. Do not destroy the only decryption capability needed for that recovery when a lease expires.

Hash-only data reduces the ability to reconstruct high-entropy ticket secrets from the package; it does not make a compromised device trustworthy. Encryption, key lifecycle and supported device behavior need the existing DEVICE-01 implementation evidence.

## Amendment

Retains the package design, narrows the forgery claim and distinguishes device-held keys from ticket/server signing secrets. HLD §9.4 and API offline contracts own detailed states, budgets and recovery behavior.
