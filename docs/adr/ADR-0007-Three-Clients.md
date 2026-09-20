# ADR-0007 — Three separate clients

**Status:** Amended design baseline; original accepted decision retained except where explicitly superseded below.
**Revision:** 1.1 — 19 September 2026
**Alignment:** Core Entities v1.1; OpenAPI/AsyncAPI v0.2.0; HLD v1.3; Technology Stack v2.2.

## Context and decision

Retain separate builds for the public storefront, native Expo/React Native check-in app and organizer workspace. The original PWA check-in decision remains superseded. Their public payload, offline storage, camera, authority and release requirements differ.

Share generated API types, portable logic and design tokens where compatible. The native app uses native UI components; storefront and workspace may share web components without forcing the storefront to ship the workspace bundle.

## Reasoning and trade-offs

The native choice permits an explicit local SQLite transaction boundary and device-storage lifecycle under application control. It also adds signing/distribution, release compatibility, device testing and update-management work. It does not remove data-loss risks or prove durability by itself.

The prior “documented iOS IndexedDB gap” claim linked back to the HLD instead of an independent source or reproducible result. This review does not treat that circular reference as evidence that all PWAs are unreliable. Retain the existing native selection on its storage/runtime fit and validate it on supported devices.

The 750 KB check-in payload target must retain its original measurement boundary. A native binary, a compressed JavaScript bundle, a downloaded update and an offline dataset are distinct quantities. Record each and resolve the native interpretation of NFR-PER-17 explicitly; do not silently exempt native assets or count only convenient bytes.

## Alternatives and acceptance evidence

A PWA offers web distribution; a native app offers a different storage/device lifecycle. Capacitor also supports native packaging and plugins, so it is not rejected for supposedly lacking a native distribution path. Revisit only with measured storage/camera behavior and the full operating cost.

Demonstrate durable-before-success admission, restart/process-termination recovery, encrypted pending records, migrations, lease/time handling and reconnect behavior on the device matrix. An unavailable database must prevent a success indication. Updates must preserve pending records and never interrupt an active admission session.

## Amendment

Retains the three-client and native-check-in decisions. Replaces unsupported comparative certainty with explicit trade-offs and measurable evidence. No additional ADR is required merely to restate this choice; device acceptance and payload interpretation remain implementation work. HLD §13 owns the client design.
