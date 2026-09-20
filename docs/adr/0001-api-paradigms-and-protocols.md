# ADR 0001: API Paradigms and Protocols

**Date:** 16 September 2026  
**Status:** Accepted  
**Context:** Event Dynamics MVP requires a scalable, cacheable, and measured API surface for 59 core entities, alongside real-time push requirements for operational freshness, and asynchronous webhook ingestion. We need to select the API paradigms and specification formats that best align with the project's Non-Functional Requirements (NFRs).

## 1. Context and Problem Statement

Event Dynamics has three distinctly shaped communication patterns mandated by the NFRs:
1. **Request/Response (Pattern A):** Synchronous CRUD, checkout, and admission validation.
2. **Real-Time Push (Pattern B):** Server-to-client freshness updates for dashboards, announcements, and AI jobs.
3. **Inbound Async (Pattern C):** Server-to-server payment webhooks.

We need to choose the appropriate protocols for these patterns and the specification tools to document them, avoiding unnecessary complexity while strictly satisfying performance, measurement, and caching requirements.

## 2. Decisions

### 2.1 REST (OpenAPI 3.1) for the Primary API

We will use REST as the primary API paradigm, documented via OpenAPI 3.1. 

**Reasoning:**
- **Measurement Discipline:** NFR-MET-01 strictly forbids pooling different operations into one percentile. REST maps one endpoint to one operation, making this measurement straightforward.
- **Cacheability:** NFR-PER-06 requires public event data to be served in $\le$ 500ms. REST natively leverages standard HTTP caching semantics (ETags, Cache-Control, CDNs).
- **Cost Bounding:** NFR-CAP-03 requires bounding expensive work to protect admission latency. Fixed REST endpoints have predictable cost profiles, making throttling and priority laning simpler.
- **Client Diversity:** Constrained check-in devices on M1 networks benefit from plain HTTP/JSON over complex client libraries.

### 2.2 Server-Sent Events (SSE) for Real-Time Push

We will use SSE for all real-time push requirements, documented via AsyncAPI 3.0 (reusing OpenAPI component schemas).

**Reasoning:**
- **Traffic Shape:** The requirements (NFR-FRE-01, 02, 04, 06, NFR-AI-09) are entirely server-to-client one-way push (e.g., announcements, dashboard aggregates, AI progress). 
- **Built-in Reconnection:** NFR-FRE-04 requires disconnected clients to display missed updates upon reconnection. SSE natively supports this via the `Last-Event-ID` header.
- **Network Resilience:** SSE operates over standard HTTP, avoiding the proxy and firewall issues sometimes encountered with WebSocket upgrade handshakes, satisfying the degraded network design constraints.
- **Revocation:** NFR-SEC-04 requires cached connections to stop receiving updates within 5 seconds of revocation. Terminating an SSE stream is a standard HTTP response closure.

### 2.3 Inbound Webhooks in OpenAPI

The inbound payment callback (Monime) will be documented using the native `webhooks:` keyword in the OpenAPI 3.1 specification.

**Reasoning:**
- Keeps the webhook definition in the same file as the idempotency (NFR-INT-04) and matching rules (NFR-INT-03) that constrain it.
- A single HTTP POST callback is a request/response operation from the provider's perspective, fitting perfectly into OpenAPI rather than requiring AsyncAPI.

### 2.4 Async Jobs for Bulk Operations

CSV imports, exports, and offline sync batches will be modeled as REST resources that return `202 Accepted` alongside a `Job` resource, rather than introducing an RPC paradigm.

## 3. Rejected Alternatives

### 3.1 GraphQL

**Reasoning:** Rejected for MVP. While it could theoretically reduce over-fetching on dashboard views, it undermines NFR-MET-01 (per-operation measurement) and NFR-CAP-03 (cheap cost bounding). It also complicates the strict HTTP caching required for public pages (NFR-PER-06).

### 3.2 WebSocket

**Reasoning:** Rejected for MVP. WebSocket provides bidirectional communication, but the MVP has no bidirectional real-time requirements (e.g., no live collaborative cursors or chat). Adopting it would add unnecessary connection management complexity compared to SSE. If true bidirectional needs emerge, a specific WebSocket channel can be added to the AsyncAPI spec later.

### 3.3 gRPC

**Reasoning:** Rejected for MVP client-facing APIs. The NFRs do not mandate microservices; gRPC is an internal implementation choice and not suited for the diverse public web and mobile client ecosystem.

## 4. Traceability

- **NFR-MET-01, NFR-CAP-03, NFR-PER-06:** Drives the choice of REST.
- **NFR-FRE-01, NFR-FRE-02, NFR-FRE-04, NFR-FRE-06, NFR-AI-09:** Drives the choice of SSE.
- **NFR-SEC-04:** Drives SSE over WebSocket for simpler revocation.
- **NFR-INT-03, NFR-INT-04:** Keeps webhooks in OpenAPI for localized constraint documentation.
