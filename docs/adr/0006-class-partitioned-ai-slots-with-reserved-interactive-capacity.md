# ADR-0006 — Class-partitioned AI slots with reserved interactive capacity

**Status:** Accepted
**Context:** The capacity estimation explicitly leaves this open: ten long jobs occupying all ten slots would delay a simple question by ~5 minutes, violating NFR-AI-06's 60 s P95 start target.
**Decision:** Of 10 platform slots, 4 reserved for interactive classes, 4 for background, 2 flex allocated by oldest head-of-line. Weighted fair queueing keyed by organization within each class. Admission control refuses work whose start budget cannot be met, with no unit charge.
**Consequences:** Both job classes meet their targets in the 50-job mixed test. Peak throughput for background work is slightly lower than an unpartitioned pool would allow — an accepted trade for meeting the interactive guarantee.
**Alternatives rejected:** Single FIFO pool (fails NFR-AI-06); pure priority preemption (long jobs would starve and waste consumed units).
