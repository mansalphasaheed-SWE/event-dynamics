# ADR-0012 — Transactional audit at application-service boundaries

**Status:** Amended design baseline; original accepted decision retained except where explicitly superseded below.
**Revision:** 1.1 — 19 September 2026
**Alignment:** Core Entities v1.1; OpenAPI/AsyncAPI v0.2.0; HLD v1.3; Technology Stack v2.2.

## Context and decision

Keep required mutation audit entries in the same PostgreSQL transaction as business effects. Declarative service metadata identifies auditable operations; the application service/transaction wrapper produces the attributable, sensitive-field-filtered record. HTTP-only interceptors are insufficient for workers, provider processing, AI steps and scheduled work.

If required audit persistence fails, the mutation fails. A committed idempotent replay must not create a second business mutation or a misleading second successful-action audit. Record retry/delivery observations separately when useful.

## Permissions and evidence

Ordinary runtime roles have only the required INSERT and scoped SELECT access to audit data, with no UPDATE, DELETE, TRUNCATE or ownership/migration privileges. Tenant and field visibility still apply. Sensitive values may be represented by “changed” rather than copied; credentials and raw QR secrets are never audit payloads.

A separately controlled retention role handles authorized minimization/expiry under business retention and legal-hold rules, recording the transformation. Corrections append attributable records. A database administrator remains privileged; these grants do not establish cryptographic tamper-proof history or protection against every infrastructure compromise.

Failed/rejected attempts have no committed mutation transaction. Where audit policy requires them, persist a separate minimized attempt record with an honest failure outcome; do not fabricate a successful domain audit or lose it merely because the mutation rolled back.

## Consequences, alternatives and evidence

Transactional coupling prevents an application crash from separating an acknowledged committed mutation from its required audit record, subject to the configured database durability and recovery scope. It does not make data immune to database loss.

Async log reconstruction remains unselected as the authoritative audit source. Logs/telemetry can supplement investigation. Verify non-HTTP coverage, missing service annotations, rollback on audit failure, sensitive-field filtering, runtime grants and retention behavior. Include audit cost in measured critical-path latency.

## Amendment

Retains transactional audit, annotations and append-oriented grants. Replaces absolute “cannot be lost or edited” language with the actual failure/privilege boundary. HLD §8.4 owns the detailed architecture.
