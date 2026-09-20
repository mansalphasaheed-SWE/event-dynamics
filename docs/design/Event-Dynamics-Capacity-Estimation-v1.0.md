# Event Dynamics — Capacity Estimation and Learning Guide

**Version:** 1.0  
**Date:** 15 September 2026  
**Status:** Initial engineering model for review and implementation validation.  
**Baseline:** Event Dynamics NFRs v1.0, product brief, and finalized functional requirements.

This document estimates the work Event Dynamics must handle, the resources that work could consume, and the measurements needed to replace assumptions.

The NFRs specify the required quality at a stated workload. Capacity estimation translates that workload into requests, records, bytes, concurrent work, and processing demand. These calculations are planning evidence; they do not prove that an unbuilt system meets its NFRs.

## 1. How to use this document

Every number has one of three meanings:

- **Baseline target:** already selected in the NFR document or product brief.
- **Sizing assumption:** a reasonable initial input selected here because production evidence does not yet exist.
- **Calculated estimate:** the result of applying a formula to those inputs.

Later, a fourth category appears: **measured result**, obtained from load tests or production. There are no measured capacity results in this document.



### The reusable method

1. Name the operation and the component being sized.
2. State volume, duration, concurrency, and dataset assumptions.
3. Convert actions into requests, queries, messages, and bytes.
4. Calculate sustained demand and separately calculate bursts.
5. Account for queues, finite inventory, retention, and repeated delivery.
6. Add clearly defined operating headroom.
7. Validate against latency, correctness, and recovery targets.
8. Replace assumptions with measurements and repeat.

## 2. Units and vocabulary

| Term | Plain explanation | Example |
|---|---|---|
| RPS | Requests per second at a named boundary | 20 admission requests reach the API each second |
| QPS | Queries per second; here specifically database statements | 20 requests × 3 statements = 60 database QPS |
| Throughput | Work completed per unit of time | 140 payment events processed per second |
| Offered load | Work callers try to send | A test sends 150 requests/second even when the server slows |
| Concurrency | Work or connections present at the same time | 200 people currently waiting for payment |
| Latency | Time one operation takes | An admission request takes 200 ms |
| Payload | Data carried by a request, response, or message | A 20 KB event-data response |
| Fan-out | One action produces work for several recipients | One announcement reaches 150 team members |
| Working set | Data actively needed in memory | The ticket records for events operating today |
| Headroom | Capacity kept unused for variation and recovery | Operate at no more than 70% of tested safe capacity |
| IOPS | Storage input/output operations per second | Physical storage reads and writes; not the same as SQL QPS |
| CDN | A delivery service that can serve cached public assets close to users | Images and JavaScript need not all come from the application server |
| Origin | The system a delivery cache contacts when it cannot serve a request | Event Dynamics' asset or application service |
| Durable | Preserved across the failure the storage design promises to survive | A received payment event is stored before acknowledgment |

Use decimal units for data estimates: 1 KB = 1,000 bytes; 1 MB = 1,000 KB; 1 GB = 1,000 MB. RAM examples explicitly marked MiB/GiB use binary units. One byte contains eight bits. Mbps means **megabits**, not megabytes, per second.

Useful conversions: 1 minute = 60 seconds; 15 minutes = 900 seconds; 30 minutes = 1,800 seconds; a 30-day planning month = 2,592,000 seconds. Use the actual calendar month for availability accounting.

## 3. Baseline and new assumptions

### 3.1 Existing workload targets

| Workload | Sustained | Burst | Scope / duration |
|---|---:|---:|---|
| Admission, busy event | 6 attempts/s | 20 attempts/s | 30 minutes / 60 seconds |
| Admission, two busy + eight light events | 20 attempts/s | 48 attempts/s | Light events remain at 1/s each |
| Checkout starts, busy sale | 12 attempts/s | 36 attempts/s | 15 minutes / 60 seconds |
| Checkout starts, two simultaneous sales | 24 attempts/s | 72 attempts/s | Platform aggregate for this scenario |
| Public page loads, two simultaneous sales | 120/s | 360/s | 15 minutes / 60 seconds |
| Provider-event deliveries | 50/s | 150/s | Platform-wide, 15 minutes / 60 seconds |
| Workspace reads | 100 RPS | 100 RPS | Held constant in the combined burst model |
| Workspace mutations | 30 RPS | 30 RPS | 300 connected team sessions |

Maximum supported large-event fixture: 10,000 tickets/attendees, 150 team members, and 50 prepared gate devices. The platform fixture contains 500 organizations, 100 recently active organizations, 300 active events, and an additional million archived ticket/admission-related records. Active planning events are not all simultaneously running ticket sales or gates.

The NFR mixed test combines sustained sales, admission, collaboration, provider events, one 10,000-row import, one 100,000-row export, and 50 accepted AI jobs across at least ten organizations. The simultaneous combined burst calculation below is an additional sizing/stress scenario; it does not silently rewrite the NFR acceptance matrix.

### 3.2 Additional assumptions selected for this estimate

| ID | Assumption | Why it is useful / how to replace it |
|---|---|---|
| A1 | 100 completed events/month, averaging 1,000 issued tickets/event | A planning scenario for growth and retention, not a sales forecast |
| A2 | Average 2 tickets/order for storage and monthly delivery | Replace with observed order size; stress checkout retains single-ticket inventory tests |
| A3 | Each public page load makes 2 data API requests | One cacheable description request and one current-availability request; inspect the eventual browser request waterfall |
| A4 | 95% hit rate for the public description request in the warm-cache scenario | Explicit optimization case; also size/test the uncached case |
| A5 | Payment initiation requests are 50% of checkout attempts during the stress window | Chosen request mix, not a promised conversion rate |
| A6 | 200 simultaneous payment waiters sustained; 600 during a burst | Separate bounded concurrency scenario; 2-second polling adds 100 / 300 RPS |
| A7 | 20 additional foreground API RPS | Allowance for login, invitations, searches, billing administration, and similar small flows; background work is separate |
| A8 | Typical event uploads including derivatives total 100 MB | Storage assumption below the NFR 2 GB/event quota |
| A9 | Illustrative database physical storage is 2× modeled row bytes | Includes indexes and structural overhead; excludes replicas, backups, and transaction logs |
| A10 | Network overhead allowance is 20% | Rough allowance for headers, encryption framing, and variation; measure actual transferred bytes |

A1 describes monthly completed-event flow; the 300-active-event fixture describes a point-in-time dataset. They are different measurements. The 20-active-events-per-Operations-organization product limit does not predict how many events will sell tickets simultaneously.

## 4. Traffic: from attendance to API RPS

### 4.1 Admission

Formula: **attempts per second = attempts ÷ seconds**.

10,000 arrivals ÷ 1,800 seconds = **5.56 arrivals/s**. The chosen 6 attempts/s gives room for a modest number of rescans: 6 × 1,800 = **10,800 attempts**. These are not necessarily 10,800 unique admitted people.

For two busy and eight light events:

- Sustained: (2 × 6) + (8 × 1) = **20 attempts/s**.
- Burst: (2 × 20) + (8 × 1) = **48 attempts/s**.

Online attempts reach the backend. Offline attempts are recorded on devices and produce synchronization traffic later. To stress the online service, assume all modeled attempts are online; separately test reconnection.

The 60-second burst at 20/s contains 1,200 attempts per busy event. Do not add a whole burst on top of a sustained window unless that is the intended test. If one burst minute replaces one minute in the 30-minute busy-event scenario: (1,740 × 6) + (60 × 20) = **11,640 attempts**.

### 4.2 Checkout and finite inventory

Two sales produce 24 checkout-start attempts/s sustained and 72/s during a burst. Over 15 minutes, sustained offered demand is 24 × 900 = **21,600 attempts**.

Two 10,000-ticket events have 20,000 tickets total. Attempts can exceed stock because some fail, expire, or repeat. Even a fast API must not convert all attempts into successful new holds if inventory is unavailable.

With an average two tickets per active hold, 20,000 tickets support at most **10,000 simultaneous active holds** across these two events. Actual limits depend on each event and ticket type. The average order-size assumption is not a rule permitting more stock.

Little's Law, introduced later, might suggest 24 × 900 = 21,600 active holds if all attempts succeed and last 15 minutes. That result conflicts with available inventory: the accepted rate or average hold duration must be lower. This is why capacity estimates must respect business limits.

### 4.3 Translate pages into requests

Under A3, 120 public page loads/s × 2 data requests/page = **240 public API RPS**. During the burst: 360 × 2 = **720 RPS**.

For the warm-cache case, one request/page is public and cacheable; the other always obtains current availability:

- Sustained origin RPS: (120 × 5%) + 120 = **126**.
- Burst origin RPS: (360 × 5%) + 360 = **378**.

A CDN hit is still a delivered request, but it does not reach the application origin. Never apply public-cache assumptions to private order details or permission-controlled data. HTTP request counts for images and scripts are separate from the data API counts.

### 4.4 Combined foreground request model

| API request category | Sustained RPS | Burst RPS | Assumption |
|---|---:|---:|---|
| Public data, without description-cache hits | 240 | 720 | Two requests/page |
| Checkout starts | 24 | 72 | Existing target |
| Payment initiation | 12 | 36 | A5 |
| Order-status polling | 100 | 300 | Waiters ÷ 2 seconds |
| Online admission | 20 | 48 | Existing aggregate |
| Workspace reads and mutations | 130 | 130 | 100 + 30 |
| Provider-event ingestion | 50 | 150 | Deliveries, including duplicates |
| Other foreground API work | 20 | 20 | A7 |
| **Total, uncached-description scenario** | **596** | **1,476** | Excludes static asset requests and separately listed background jobs |
| **Total reaching origin with A4 cache hits** | **482** | **1,134** | Subtract 114 / 342 description requests |

A single overall RPS total is useful for a first sizing pass. Preserve the request mix in testing: 1,000 cached reads do not cost the same as 1,000 inventory transactions.

Status polling is an illustrative implementation option. Replacing it with server-pushed updates removes repetitive polling requests but introduces persistent connections, delivery work, and reconnection handling. Either option must meet the NFR freshness target.

### 4.5 Monthly traffic is a separate question

For a volume scenario, choose **10 page loads per issued ticket**, giving 100,000 monthly tickets × 10 = **1 million page loads/month**. This is a new monthly browsing assumption; it does not follow from the stress ratio of five pages per checkout attempt.

The monthly average is 1,000,000 ÷ 2,592,000 = **0.386 page loads/s**. It can coexist with a 360-page-load/s burst because events concentrate activity into short windows.

Do not multiply the stress peak by every second in a month to predict a normal bill. Use peak scenarios for throughput and monthly activity estimates for cumulative transfer and storage.

## 5. Database QPS and write demand

A database query here means a statement sent by the application or worker, whether a read or a write. The following coefficients are modeling assumptions, not a proposed schema or mandatory implementation.

| Flow at origin | Statements/request | Sustained statements/s | Burst statements/s |
|---|---:|---:|---:|
| Public description cache misses | 2 | 12 | 36 |
| Current availability | 1 | 120 | 360 |
| Checkout start | 4 | 96 | 288 |
| Payment initiation | 3 | 36 | 108 |
| Status polling | 1 | 100 | 300 |
| Admission | 3 | 60 | 144 |
| Workspace reads | 2 | 200 | 200 |
| Workspace mutations | 4 | 120 | 120 |
| Provider durable ingestion | 2 | 100 | 300 |
| Other foreground requests | 2 | 40 | 40 |
| **Foreground total** | — | **884** | **1,896** |
| Provider-event business workers | 6 per delivered event, conservatively | 300 | 900 |
| **Total before other background work** | — | **1,184 QPS** | **2,796 QPS** |

The worker row assumes business processing keeps pace with deliveries; queued work shifts some of that demand later. Duplicate events should usually cost less than fresh successful payments. Modeling every delivery as expensive is a conservative test choice, not permission to issue tickets twice.

An uncached description tier adds 228 / 684 statements/s, raising these totals to **1,412 / 3,480 QPS**. This is the first cache-failure sensitivity case.

Imports, exports, retention, hold expiry, and AI retrieval add demand separately. Process bulk work in bounded batches and measure its impact under the mixed NFR test. SQL statement counts alone cannot size a database: rows examined, returned bytes, transaction duration, lock contention, and storage behavior matter.

**QPS is not IOPS.** A query may find everything in memory or touch many storage pages. Indexes can accelerate reads while adding work to writes. Measure physical reads/writes, transaction-log generation, and commit latency before selecting storage performance.

**The likely contention test:** many checkout attempts target the same final tickets. Total database CPU may look comfortable while those requests queue for the same inventory record.

## 6. Concurrent requests and connections

For a stable flow, **average in-flight work = arrival rate × average time in the system**. This relationship is often called Little's Law. Use the arithmetic mean time, not P95 or P99.

Example: 48 admission requests/s × 0.2 seconds mean backend time = **9.6 requests in flight on average**. This does not mean ten CPU cores: some requests may be waiting for storage or network responses.

For an illustrative overall warm-cache origin mean of 200 ms:

- Sustained: 482 × 0.2 = **96.4 average in-flight requests**.
- Burst: 1,134 × 0.2 = **226.8**.

These are conditional examples. If mean latency increases to 500 ms at the same offered burst rate, average in-flight work becomes **567**. Slow dependencies can therefore exhaust connection or memory limits even without more incoming traffic.

Persistent browser connections are different. A planning scenario with 300 team sessions, 100 gate devices across two large events, and 600 payment waiters has **1,000 persistent sessions** if all use real-time connections. Extra light-event devices and public programme subscribers must be added when their counts are known. Test **10,000 connections** as an explicit growth scenario, not an existing product promise.

Do not allocate one database connection per browser session. Size the database pool from measured transaction concurrency; constrain it to protect the database. If 2,796 statements/s average 5 ms execution, about 14 statements are executing on average, but transactions, lock waits, and connection-holding time can require more pool occupancy.

## 7. Storage: records, retention, and physical space

The basic formula is **record count × average stored bytes per record**. Over time: **new records per month × retention months × bytes per record**. This produces a steady-state estimate only if expired data is actually removed and monthly volume remains constant.

Database row size differs from JSON response size. Use the following byte sizes as placeholders until a representative schema and dataset can be measured.

### 7.1 Monthly business records

A1 and A2 give **100,000 issued tickets and 50,000 orders per month**. Conservatively give every order the financial retention treatment for sizing, even though actual retention classification may distinguish free orders.

| Record class | New records/month | Assumed row bytes | Raw growth/month | Sizing retention |
|---|---:|---:|---:|---|
| Order/payment/refund summary bundle | 50,000 | 2 KB per order bundle | 100 MB | 84 months |
| Retained ticket issuance reference | 100,000 | 1 KB | 100 MB | 84 months |
| Financial audit entries | 200,000 | 0.5 KB | 100 MB | 84 months |
| Expense records | 100,000 | 0.5 KB | 50 MB | 84 months |
| Attendee admission profile | 100,000 | 1 KB | 100 MB | 24 months |
| Admission attempts/events | 120,000 | 0.5 KB | 60 MB | 24 months |
| Operational audit entries | 200,000 | 0.5 KB | 100 MB | 24 months |

The summary-bundle size is a starting average across associated payment records, not a claim that one order requires only one table row. Measure refunds, retries, consent evidence, and audit payloads separately during implementation and update this allowance.

Financial retention in the NFRs is at least seven years from the latest associated activity, subject to confirmed applicable obligations. Using 84 months is a **minimum baseline sizing case**, not a deletion authorization or strict storage ceiling. Later refunds, lawful holds, or delayed deletion increase it. Separate the retained financial reference from attendee profile fields whose retention expires sooner.

### 7.2 Planning records

For an ordinary 1,000-attendee event, choose the following planning fixture:

| Entity | Records/event | Bytes/record | Raw bytes/event |
|---|---:|---:|---:|
| Sessions/activities | 100 | 0.5 KB | 50 KB |
| Tasks/subtasks | 1,000 | 0.5 KB | 500 KB |
| Run-of-show items | 200 | 0.5 KB | 100 KB |
| Vendors | 50 | 1 KB | 50 KB |
| Resources | 200 | 0.5 KB | 100 KB |
| Planning metadata and relationships allowance | — | — | 50 KB |
| **Total** | — | — | **850 KB/event** |

Expenses were counted in the financial table. At 100 events/month, planning growth is **85 MB raw/month**. Assume a rolling 24-month planning history for this estimate. This is an assumption to reconcile with product retention policy; records tied to longer-lived business evidence must follow the applicable class.

The NFR large-event fixture uses approximately ten times these entity counts. Seed those large fixtures in tests even if most modeled production events are smaller. Byte estimates do not substitute for testing long descriptions, relationships, and permission filters.

### 7.3 Database size over time

| Data class | Raw monthly growth | After 12 months | Retained steady-state case |
|---|---:|---:|---:|
| Financial records | 350 MB | 4.20 GB | 29.40 GB at 84 months |
| Admission/profile/operational audit | 260 MB | 3.12 GB | 6.24 GB at 24 months |
| Planning | 85 MB | 1.02 GB | 2.04 GB at 24 months |
| **Raw completed-event records** | **695 MB** | **8.34 GB** | **37.68 GB** |
| **Physical database estimate, A9: ×2** | **1.39 GB** | **16.68 GB** | **75.36 GB** |

Add the following independently modeled standing allowances:

- 300 active ordinary events: 300 × 6.95 MB raw/event × 2 = **4.17 GB physical**. Count these separately from completed events; move them between cohorts rather than counting the same event twice.
- Existing archived fixture: 1 million records × 0.75 KB × 2 = **1.50 GB physical**. Include this only when that separate history is present; do not add it twice if it already belongs to the growth cohorts.
- Accounts, memberships, configuration, short-lived holds, deduplication records, and bounded job metadata: **1 GB physical allowance**. This deliberately provisional bucket needs direct measurement and its own retention cleanup.

Total modeled physical database: **23.35 GB after one year**, and **82.03 GB at the retained steady-state case**. These totals exclude transaction logs, temporary sort space, replicas, backups, and uploaded files.

At a 70% maximum planned occupancy, divide by 0.70:

- 23.35 ÷ 0.70 = **33.36 GB** required usable allocation before separately reserving transaction-log and temporary space.
- 82.03 ÷ 0.70 = **117.19 GB** on the same basis.

For the initial test environment, a **100 GB database volume** is a reasonable allocation assumption, with measured transaction-log and temporary-space limits. Model **200 GB** for the retained scenario. These are provisional space allocations, not database throughput recommendations. Increase them if measurements show insufficient free space or the storage service requires another size for the necessary performance.

Multiplying used space by 1.3 is not the same as keeping 30% of the allocation free. Dividing by 0.7 makes the distinction explicit.

### 7.4 Attachments and generated files

Typical upload scenario: 100 events/month × 100 MB = **10 GB/month**. Assuming 24-month retention for these ordinary attachments gives **240 GB**, plus **30 GB** for 300 active events: **270 GB total**. Longer-lived financial attachments must be moved into a longer retention class and added separately.

The NFR quota is 2 GB/event, including derivatives. If every modeled event fills it, 2,400 retained completed events plus 300 active events require **5.4 TB**. A quota is an allowed maximum, not an expected average. This sensitivity case is twenty times the typical attachment estimate.

For generated ticket PDFs, assume one 200 KB order bundle per order. 50,000 orders/month produce **10 GB/month** if all are generated once. If regenerable PDF artifacts are kept for seven days, their average rolling storage is approximately **2.33 GB** at uniform demand. The ticket's canonical records and secure access remain available for their required lifetime; removing a temporary PDF must not remove the ticket.

For exports, assume 20 files/day averaging 5 MB, retained seven days: **700 MB**. At the NFR 50 MB export limit, the same count occupies **7 GB**. A generated report and its retained source records are different storage objects.

### 7.5 Logs, backups, and replicas

Start with a logging allowance of **1 GB/day** for routine technical logs and **100 MB/day** for security logs. These are selected allowances, not values derived from peak RPS.

- Routine logs: 1 GB/day × 30 days = **30 GB raw**.
- Security logs: 0.1 GB/day × 90 days = **9 GB raw**.
- Raw AI debugging payloads: off by default; approved temporary capture follows the NFR limit rather than indefinite retention.

A log-search system may add indexes, replicas, and compression. Measure its actual physical-to-raw ratio. Do not assume that the database's 2× factor applies to logs.

A second full database copy approximately doubles that component's data bytes. It does not double CPU capacity automatically, and it is not a substitute for independent recovery history.

For a deliberately simple backup upper planning case, 30 daily full copies of a 23.35 GB database occupy **700.5 GB before compression**; at 82.03 GB they occupy **2,460.9 GB**. Incremental backups can be much smaller, but their estimate requires changed-block or transaction-log measurements. Add the recovery logs needed for the selected RPO. Object-storage backup/versioning is a separate allowance and can exceed current live attachment size.

The NFR's one-minute critical RPO cannot be established by one backup per day. The recovery design must preserve sufficiently recent changes and demonstrate a restore. Capacity estimation reserves resources; it does not prove recovery behavior.

## 8. Bandwidth: bytes moving over time

**Bandwidth demand = transfers/second × bytes/transfer.** Multiply bytes/second by eight to obtain bits/second.

### 8.1 Public initial assets

The NFR permits 300 KB compressed HTML/CSS/JavaScript plus 200 KB initial images: **500 KB per cold page load** as an upper payload case. Data API responses are additional and must be counted separately.

| Scenario | Calculation | Payload bandwidth | With A10 20% allowance |
|---|---|---:|---:|
| Two sales, sustained | 120 × 500 KB/s | 60 MB/s = 480 Mbps | 576 Mbps |
| Two sales, burst | 360 × 500 KB/s | 180 MB/s = 1,440 Mbps | 1,728 Mbps |
| Sustained 15-minute window | 60 MB/s × 900 s | 54 GB transferred | 64.8 GB |
| Separate 60-second burst | 180 MB/s × 60 s | 10.8 GB transferred | 12.96 GB |

These are delivery-tier figures. Browser reuse and smaller assets reduce actual traffic. A 95% **byte** cache-hit assumption would leave 5% of those asset bytes fetched from origin: **3 MB/s sustained and 9 MB/s burst**, before overhead. This byte-hit assumption is separate from the API description request hit rate.

For one million monthly page loads, charging each the full 500 KB cold payload gives **500 GB/month**, or **600 GB** with overhead. This is a conservative cold-load scenario, not a forecast that every repeat visit redownloads all files.

### 8.2 API response traffic

Assume a weighted average **10 KB response** and **2 KB request** across origin API traffic. This is a placeholder to replace with per-endpoint measurements.

- Sustained responses: 482 × 10 KB = **4.82 MB/s**, about **46.27 Mbps** including 20% overhead.
- Burst responses: 1,134 × 10 KB = **11.34 MB/s**, about **108.86 Mbps** including overhead.
- Burst requests: 1,134 × 2 KB = **2.268 MB/s**, about **21.77 Mbps** including overhead.

Export downloads, uploads, offline datasets, real-time messages, and email attachments are separate. A server's required link capacity depends on which of these paths actually pass through it.

### 8.3 Offline preparation and reconnection

A 10,000-ticket package has a 10 MB compressed-before-encryption NFR ceiling. Preparing 50 devices may transfer **500 MB per event**; preparing both large events may transfer **1 GB**. Add encryption and transport overhead; those 50 copies are network demand even though the source event has only one dataset.

At M1's 1.6 Mbps download rate, 10 MB × 8 ÷ 1.6 = **50 seconds of ideal transfer time**, before request overhead, parsing, validation, and storage. The 120-second M1 preparation objective leaves room for those activities. At B1's 20 Mbps, ideal transfer is **4 seconds**; the NFR complete preparation target is 30 seconds P95.

For a reconnect test, assume each of 100 devices has 1,000 pending admission records at 0.5 KB each. That produces **100,000 records and 50 MB of raw upload data**. Duplicates and overlapping scans are possible; this does not imply 100,000 unique valid attendees.

With 100 records/batch, there are **1,000 batches**. If devices spread uploads across 60 seconds, the backend sees **16.67 batches/s** and **1,666.67 records/s**, before retries. This is a distinct synchronization stress case, much heavier in records than the 48/s online-admission burst. Schedule pacing and bounded concurrency must still meet the per-batch NFR deadline after full receipt.

### 8.4 Live updates and announcements

If each of 30 mutations/s generates one 1 KB update delivered to an average of 20 eligible sessions, fan-out is **600 deliveries/s**, or **0.6 MB/s raw**. Broadcasting every change to all 300 sessions instead produces **9,000 deliveries/s** and **9 MB/s**. Recipient scope therefore matters to both privacy and capacity.

One 2 KB announcement delivered to 150 team members produces **300 KB raw**. An occasional announcement has modest total bandwidth but still needs prompt dispatch. Connection count and response deadlines can matter more than monthly bytes.

## 9. Memory: what must remain available in RAM

Disk capacity and RAM capacity answer different questions. A 100 GB database need not fit entirely in RAM; frequently accessed data and indexes are more important than cold history.

### 9.1 Example working-set budget

Assume ten live events each need 10,000 ticket-validation records readily accessible. At 1 KB serialized per record, this is **100 MB**. Applying an illustrative 2.5× in-memory expansion for objects and indexes gives **250 MB**.

If ticket indexes, permissions, and active planning data need another **250 MB**, the modeled shared working set is **500 MB**. These are assumptions for measuring a cache or database buffer working set, not a requirement to introduce a separate cache service.

Keep authoritative inventory/admission correctness independent of stale cached views. Memory savings must not weaken those guarantees.

### 9.2 Process and connection memory

| Consumer | Example assumption | Result |
|---|---|---:|
| Persistent connections | 1,000 × 64 KB | 64 MB |
| Growth connection scenario | 10,000 × 64 KB | 640 MB |
| In-flight burst requests | 227 × 1 MB retained/request | 227 MB |
| Waiting AI job metadata | 100 × 20 KB | 2 MB |
| Ten concurrent password verifications | 10 × minimum 19 MiB hashing memory | At least 190 MiB |

Connection and request sizes depend strongly on runtime and buffering. They are per hosting process or tier; distribute them according to the actual deployment. Password hashing also has CPU cost. Limit concurrent expensive authentication work so a login burst cannot crowd out admission.

The NFR allows up to 50 MB of local stored validation/search/pending-admission data on a prepared device. That is a storage budget, not a browser RAM guarantee: decoded objects, camera buffers, and UI rendering consume additional memory.

For an example API process: 300 MB runtime baseline + 250 MB local cached state + 227 MB request state + 64 MB connections ≈ **841 MB** before other buffers and spikes. Dividing by 0.7 gives about **1.20 GB**. A **2 GiB per-process memory allocation** is a starting measurement hypothesis for this example, not proof of support. Add password work where it executes, and measure peak resident memory during mixed tests.

Do not simply add every row above to every server. Some figures are platform totals, some belong to one process, and shared caches may run elsewhere. Final memory allocation requires an explicit placement diagram during architecture design.

## 10. CPU, servers, and database sizing

**CPU cores consumed ≈ requests/second × CPU seconds/request.** CPU time is time actually spent computing. It excludes time waiting for Monime, the AI provider, locks, or disk.

For illustration, choose 5 ms CPU/request for the foreground origin mix, with additional cost allowances of 10 ms per checkout start and 5 ms each per admission, workspace mutation, and provider ingestion.

- Sustained CPU seconds/s: (482 × 0.005) + (24 × 0.010) + (20 × 0.005) + (30 × 0.005) + (50 × 0.005) = **3.15 core-equivalents**.
- Burst: (1,134 × 0.005) + (72 × 0.010) + (48 × 0.005) + (30 × 0.005) + (150 × 0.005) = **7.53 core-equivalents**.

At an illustrative 60% CPU operating ceiling, these become **5.25 and 12.55 available cores**, rounded upward. The CPU-time inputs are deliberately unmeasured. If base request CPU is 1 ms instead of 5 ms, the burst estimate becomes (1.134 + 0.72 + 0.24 + 0.15 + 0.75) ÷ 0.6 = **4.99 cores**. That large difference is why confidently choosing server counts from RPS alone would be misleading.

For this hypothetical 5 ms profile, an aggregate **16 available application cores** could be a useful burst test allocation. If capacity must survive losing one equal node, remaining capacity must still meet the requirement: four 4-core nodes leave only 12 cores after a failure, below 12.55. Five 4-core nodes leave 16. These are arithmetic examples, not a prescription to launch five servers.

Database CPU, business workers, PDF rendering, virus scanning, and AI-context processing are additional. External model inference is performed by the model provider in this assumed design; do not count its compute as local application CPU.

For the first database benchmark, choose **4 vCPU, 16 GiB RAM, and 100 GB storage** as a provisional test configuration. Run the defined workload and inspect query plans, transaction waits, CPU, memory, I/O, and tail latency. This configuration may pass or fail; we have not measured it. Select a deployment only after evidence and recovery needs are available.

Scaling out application instances cannot fix every bottleneck. A contested inventory transaction, one slow query, or a provider rate limit may remain the limiting resource.

## 11. Background jobs, queues, and recovery traffic

A queue stores work until a worker can process it. It helps absorb a temporary spike; it does not create processing capacity.

Let arrival rate be **λ** (lambda) and processing capacity be **μ** (mu), in matching units such as jobs/second. To avoid indefinite growth under steady load, average processing capacity must exceed the average arrival rate.

For a constant-rate burst starting with no backlog:

- **Backlog accumulated = max(0, burst arrival rate − processing rate) × burst duration.**
- **Drain time after burst = backlog ÷ (processing rate − ongoing normal arrival rate).**
- Approximate queue waiting time near the end of the burst is **backlog ÷ processing rate**.

These are simplified fluid estimates: real jobs vary, and retries and worker failures add uncertainty.

### 11.1 Payment processing

Suppose provider deliveries rise from 50/s to 150/s for 60 seconds. A worker pool processing 100/s accumulates (150 − 100) × 60 = **3,000 waiting events**. After the burst, it drains in 3,000 ÷ (100 − 50) = **60 seconds**.

That seems to satisfy the NFR two-minute backlog recovery objective, yet queue wait near the burst end is roughly 3,000 ÷ 100 = **30 seconds**. This fails the payment issuance P99 deadline of 15 seconds for fresh successful events if they share this queue without effective prioritization.

An illustrative 140/s processing pool accumulates **600 events**, with about **4.29 seconds** worst fluid queue wait and **6.67 seconds** to drain at the normal arrival rate. Processing time must still fit the issuance deadline; P95 is not automatically proven by this arithmetic. Test the actual successful-payment subset, duplicates, service-time distribution, and failures.

An even simpler design target is enough measured capacity to process the whole 150/s burst promptly. The decision depends on measured event cost and queue behavior. Ingestion acknowledgment and completed business processing remain separate measurements.

At 2 KB per queued event, 600 events use only **1.2 MB of raw payload**. Such a small queue can still be too slow. Queue **age** is often more informative than queue bytes.

### 11.2 Email and PDF work

Under the stress request mix, assume every payment initiation succeeds as an upper successful-flow case: 12 orders/s sustained and 36/s burst, while stock permits. If each order requires one email and one PDF bundle, the pipeline receives up to **36 email jobs/s and 36 PDF jobs/s**.

If PDF rendering averages 0.2 seconds CPU per job, burst CPU demand is 36 × 0.2 = **7.2 core-equivalents**, or **12 cores at 60% utilization**. That is an illustrative reason to measure rendering separately and avoid blocking the ticketing API on it. An on-demand or simpler ticket format changes this workload.

The email provider must accept the required submissions, or queued messages may miss the NFR 30-second P95 / two-minute P99 submission target. Count retries as additional attempts. A provider accepting a message does not prove that it reached the recipient's inbox.

### 11.3 Import, export, and file processing

The NFR workloads imply these minimum average progress rates, ignoring setup time:

- 10,000-row import in 60 seconds: **166.67 rows/s**.
- 100,000-row export in 120 seconds: **833.33 rows/s**.
- A 50 MB export written in 120 seconds: **0.417 MB/s**.

These rates are not especially large in byte terms, but permissions, validation, cross-record checks, and expensive queries can dominate. Budget the complete operation, not just streaming bytes. Do not load an entire large export into memory if bounded batches can meet the requirement.

Uploads can be 25 MB each under the NFR. Ten simultaneous maximum-size buffered uploads would retain **250 MB** before processing overhead. Streaming or direct object transfer changes where those bytes consume resources. Include derivative generation and malware scanning in the mixed-workload test.

### 11.4 Retries and reconnect storms

If 10% of original requests require exactly one retry, 100 original requests/s become **110 attempts/s**. The factor is 1.10 for that stated model. Persistent failures can generate far more traffic if retries are unbounded or synchronized.

Use explicit retry limits and spread retries over time. After an outage, separately account for live demand, queued work, and client reconnections. The normal request model does not automatically include all three arriving together.

For a 3,000-job backlog that must clear in 120 seconds while normal arrivals continue at 50/s, required average processing rate is at least **50 + (3,000 ÷ 120) = 75/s**, before headroom and job deadlines. A drain-time target alone does not guarantee individual job latency.

## 12. AI workload, concurrency, tokens, and limits

AI needs a separate capacity model because a small request rate can occupy execution slots for a long time.

The NFR baseline permits **10 executing AI jobs platform-wide**, **2 executing per organization**, **100 waiting platform-wide**, and **20 waiting per organization**. The mixed test contains 40 simple questions and 10 bounded background planning jobs across at least ten organizations. These are upper admission limits; accepting work still depends on meeting the promised start-time budgets.

### 12.1 Service-time estimate

For initial sizing, assume:

- Simple job: **10 seconds mean execution time**.
- Bounded background planning job: **300 seconds mean execution time**.
- Workload mix: **80% simple, 20% background**.

These are mean-duration assumptions, not substitutes for the NFR P95/P99 limits. For jobs using tools, count the full occupied execution time, including dependency waits, unless the scheduler explicitly releases the slot.

Weighted mean service time = (0.8 × 10) + (0.2 × 300) = **68 seconds/job**.

Ten continuously occupied slots have ideal long-run throughput of 10 ÷ 68 = **0.147 jobs/s**, or **8.82 jobs/minute**. At a planning occupancy of 60%, use approximately **5.29 jobs/minute** for this mix, subject to the separate per-organization limit and provider quotas.

Fifty mixed jobs require (40 × 10) + (10 × 300) = **3,400 slot-seconds**. Dividing by ten gives a **340-second lower bound on total completion time** if ten slots are fully utilized. It is not a promise that every job starts or finishes within 340 seconds. Dependencies, fairness, and scheduling add delay.

If ten long jobs occupy all slots first, newly arriving simple questions may wait about five minutes, violating the NFR simple-job start target of 60 seconds P95. Therefore scheduling must preserve access for short work, or admission must reject/defer work it cannot start on time. We will determine the policy in architecture design and validate it with this mixed test.

### 12.2 Token volume

A token is a chunk of text processed or generated by the model. Use measured provider token counts eventually; characters and words only provide rough proxies.

Initial assumptions, counting **all model calls within a job**:

| Job type | Input tokens/job | Output tokens/job |
|---|---:|---:|
| Simple question | 3,000 | 800 |
| Bounded background plan | 20,000 | 6,000 |

The 50-job batch consumes:

- Input: (40 × 3,000) + (10 × 20,000) = **320,000 tokens**.
- Output: (40 × 800) + (10 × 6,000) = **92,000 tokens**.

For a separate monthly scenario of 2,000 jobs at the same mix: **12.8 million input tokens** and **3.68 million output tokens**. This is a chosen usage scenario, not a commercial allowance or demand forecast.

Provider requests/minute and tokens/minute limits must support actual dispatch bursts, not just monthly totals. One planning job may make multiple provider requests. Measure tool-call fan-out, repeated context, retries, and time to first visible output.

### 12.3 AI memory and cost boundaries

For 2,000 monthly jobs, assume 50 KB stored conversation/plan text per completed job and a 24-month sizing retention: **100 MB/month, 2.4 GB raw**, or roughly **4.8 GB** using the provisional database overhead factor. This is **additional** to Section 7's database totals. Actual retention follows the associated business class and user deletion rules; some plans may already be represented in canonical planning records, so avoid storing duplicate copies unnecessarily.

Including this separate AI-history allowance makes the year-one database estimate **25.75 GB** and the retained case **86.83 GB**, before operational reserve. The provisional 100 GB / 200 GB volume assumptions remain subject to measured logs and temporary-space needs.

Keep commercial AI units distinct from provider tokens. If input price is P_in per million tokens and output price is P_out per million, the 50-job batch's model charge is **0.320 × P_in + 0.092 × P_out**, plus tools and other applicable charges. No provider price or currency is assumed here. Internal usage limits must still follow the approved quoted-unit and job-cap rules.

## 13. Cost model without invented provider prices

Use monthly quantities from this document with actual quotations when selecting vendors:

| Cost component | Quantity to collect | Basic calculation |
|---|---|---|
| Application/worker compute | Instance-hours or compute-seconds by size | Quantity × unit price |
| Database | Instance-hours, allocated storage, I/O where billed | Sum each billed component |
| Object storage | Average GB-month by storage class | GB-month × price/GB-month |
| Public delivery | Delivered GB and requests | Each quantity × applicable price |
| Backups and logs | Retained GB, ingested GB, indexing/query charges | Use each service's billing boundary |
| Transactional email | Submission volume including billable retries | Billable messages × unit price |
| AI | Input/output tokens and tool calls | Token formula above + tool charges |
| Payments | Applicable successful transactions, amounts, and refund charges | Use the chosen provider's actual terms |

For an always-running resource, a 30-day planning month has **720 hours**. Compute average monthly demand for billing separately from the peak capacity reserved for event windows. Include staging/load tests, monitoring, and recovery copies in the deployment budget.

This is a cost worksheet, not a financial forecast. Payment volume is not platform revenue, and gross ticket value is not the same as payment-processing expense.

## 14. Growth and sensitivity

Change one assumption at a time first, then combine realistic changes. Otherwise it becomes hard to see what caused the increase.

| Change | Effect in this model |
|---|---|
| Five busy sales instead of two | Checkout 60/s sustained, 180/s burst; public pages 300/s sustained, 900/s burst |
| Ten busy admission events instead of two busy plus eight light | 60/s sustained and 200/s burst |
| Poll status every 1 second instead of 2 | Polling doubles from 100/300 to 200/600 RPS |
| Lose description-cache hits | Origin foreground rises from 482/1,134 to 596/1,476 RPS |
| Double average database row bytes | Modeled row-dependent storage doubles; fixed allowances do not automatically double |
| Average uploads rise from 100 MB to 500 MB/event | Typical retained attachment estimate rises from 270 GB to 1.35 TB |
| Increase long AI mean duration from 300 to 600 seconds | Weighted mean becomes 128 seconds; ideal ten-slot throughput falls to 4.69 jobs/minute |

For ticket-related monthly storage, use this simple growth ladder:

| Scenario | Events/month | Average tickets/event | Tickets/month | Ticket-related growth versus base |
|---|---:|---:|---:|---:|
| Smaller | 50 | 500 | 25,000 | 0.25× |
| Base | 100 | 1,000 | 100,000 | 1× |
| Larger | 200 | 2,500 | 500,000 | 5× |

Planning metadata and attachments may track event count more closely than ticket count. Therefore the entire storage estimate should not blindly be multiplied by five in the larger case. Recalculate each class from its own driver.

## 15. Decisions, validation, and when to revise

### Initial decisions from this estimate

1. Preserve the NFR operation-specific workload and latency targets as the acceptance baseline.
2. Use **482 sustained / 1,134 burst origin RPS** as the illustrative warm-cache foreground model, and test **596 / 1,476** without description-cache hits. Preserve each request category.
3. Begin database workload testing around **1,184 / 2,796 QPS** for the stated warm-cache model, then add bulk processing and AI retrieval explicitly. QPS is a load input, not proof of database suitability.
4. Use **25.75 GB year-one / 86.83 GB retained-case database data**, including the separate AI-history allowance, before operational reserve, transaction logs, and temporary work. Keep attachments, logs, backups, and replicas separate.
5. Provision test resources as experiments; determine final compute, memory, pools, and workers from measured latency and saturation.
6. Measure reconnection, final-ticket contention, cold caches, and dependency recovery as separate scenarios. Average traffic hides these cases.

### Measurements to collect during implementation

| Area | Replace this assumption | Measure |
|---|---|---|
| Browser | Requests/page, cold payload, cache behavior | Actual request waterfall and transferred bytes |
| API | CPU/request, response size, mean latency | Per-operation CPU, latency distribution, payload histogram |
| Database | Statements/action, row bytes, 2× overhead | Query plans, table/index sizes, locks, I/O, transaction-log growth |
| Memory | Bytes/connection and request, object expansion | Process memory and browser memory under sustained/burst load |
| Payments | Successful/repeated event mix | Delivery count, unique transitions, queue age, issuance completion |
| Background jobs | Service time and failure rate | Jobs/s, CPU/job, retries, oldest waiting work |
| AI | Duration, tokens, tool requests | Queue wait, execution duration, total tokens/calls per job |
| Storage | Monthly growth and retention behavior | Bytes by class, age, tenant, and event |

### Acceptance and review sequence

1. Seed realistic ordinary and large-event data, permissions, relationships, and archived history.
2. Measure isolated operations first, including final-ticket contention and duplicate delivery correctness.
3. Run the NFR sustained and burst scenarios, then the required mixed workload. Maintain offered traffic even if responses slow down.
4. Repeat the cold-cache, reconnect, and recovery scenarios; distinguish extra stress exploration from baseline acceptance.
5. Record operation-specific P95/P99, mean latency, throughput, technical errors, timeouts, and business rejections. Meet the NFR three-run rule and observation requirements before treating P99 as stable.
6. Increase workload until an NFR fails; identify that bottleneck. The highest configuration/load that passes is evidence for a tested safe envelope, not unlimited scale.
7. Review capacity at 70% of measured safe throughput or resource capacity, while also monitoring queue age and tail latency. These may warn earlier than CPU.
8. Revisit assumptions after the first three live events and monthly thereafter, as established in the NFRs. Reassess immediately after major workload or architecture changes.

Do not count expected sold-out outcomes as technical failures, but report them separately so a test cannot “pass” merely by rejecting almost all useful work quickly. Integrity failures have no acceptable percentage allowance.



## 17. Source and assumption record

The existing **Event Dynamics — Non-Functional Requirements v1.0, 14 September 2026** is the authority for workload targets, measurement boundaries, latency, offline limits, AI concurrency, retention classes, and validation rules used here. The original product brief and finalized FRs govern capabilities and commercial product limits.

Monthly adoption volumes, average record sizes, request fan-out, cache hit rates, mean CPU/execution times, attachment averages, and preliminary resource allocations are decisions introduced in this document. They are not market statistics, vendor benchmarks, or measurements of Event Dynamics. No cloud or model provider pricing has been assumed.

If an estimate conflicts with an existing correctness or quality requirement, change the implementation or explicitly review the requirement; do not silently weaken it to fit the estimate.
