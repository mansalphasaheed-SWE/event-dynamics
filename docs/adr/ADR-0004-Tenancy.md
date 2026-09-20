# ADR-0004 — Shared-schema tenancy with layered enforcement

**Status:** Amended design baseline; original accepted decision retained except where explicitly superseded below.
**Revision:** 1.1 — 19 September 2026
**Alignment:** Core Entities v1.1; OpenAPI/AsyncAPI v0.2.0; HLD v1.3; Technology Stack v2.2.

## Context and decision

Keep organization_id on every tenant-owned table, an application context guard, PostgreSQL row-level security (RLS), and mandatory isolation/authorization tests. The test fixture's organization count supports a shared-schema operational choice; it is not a proven scaling limit for the alternatives.

Establish context from authenticated authority, not a supplied organization ID alone. An external EventMembership may authorize its event without OrganizationMembership. Suspension of internal membership must not be bypassed through an old external grant. Cross-tenant/concealed records return 404; an accessible scope with a forbidden operation returns 403.

## Enforcement boundary

- The application service checks action, record/field scope, access period, entitlement and reserved approvals. The tenant predicate alone does not authorize every record in that organization.
- Set database context transaction-locally on the actual pooled connection; missing context fails closed. Scope reads and writes, including raw SQL and background execution. A claimed tenant in a queued payload is not authorization.
- Runtime roles must not be table owners, superusers or BYPASSRLS roles. Keep migration/maintenance roles separate; use FORCE ROW LEVEL SECURITY where needed for owner execution. PostgreSQL documents that privileged roles and some whole-table operations bypass row policies. [PostgreSQL RLS documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html).
- Namespace caches/files/jobs and enforce their authorization separately; RLS cannot protect data already copied outside PostgreSQL.

## Consequences and alternatives

These controls provide defence in depth, not three statistically independent barriers. Tests are evidence, not a runtime security layer, and an incorrect context can affect both application filtering and RLS. Isolation tests must include pooled-connection reuse, writes, external event members, scope restrictions and non-HTTP paths.

Database-per-tenant and schema-per-tenant remain unselected because of provisioning, migration and operational cost at the expected scale.

## Amendment

Replaces the original assertion that all three layers must fail for a leak. Retains the concealment policy while explaining legitimate external event access. HLD §§7.3 and 8.1 own the architecture; OpenAPI owns endpoint behavior. Implementation evidence remains pending.
