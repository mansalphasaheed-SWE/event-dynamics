# ADR-0010 — Deterministic effect traversal with model-assisted explanation

**Status:** Accepted
**Context:** The product promise is change-effect analysis; NFR-AI-05 forbids AI assertion substituting for deterministic validation.
**Decision:** A declared relationship registry drives a bounded, deterministic graph traversal that produces the affected record set. The model explains impact and proposes remedies; it never determines the affected set. Traversals exceeding the bound are reclassified as background jobs.
**Consequences:** The affected set is correct and reproducible; the explanation is good. Cost: relationship declarations must be maintained as the domain grows — enforced by requiring a registry entry for each new cross-module reference.
