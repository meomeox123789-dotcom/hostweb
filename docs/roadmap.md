# Development Plan

Planning estimate: 14–18 weeks for a small cross-functional team. This is a planning range, not a delivery promise.

## Phase 0 — Discovery (1 week)
Confirm official Spa services, durations, prices, staff, shifts, rooms, playground age policies/capacity, ticket conditions, branch information, menu, payment/refund policy and privacy/child handover operations.

Deliverables: BRD, functional requirements, business rules and approved content checklist.

## Phase 1 — UI/UX (2–3 weeks)
Figma sitemap, user flows, wireframes, design tokens, desktop/tablet/mobile screens and interactive prototype. Review the experience with adult users of varied ages and abilities.

## Phase 2 — Foundation (1–2 weeks)
Set up Next.js, Spring Boot, module boundaries, database, Flyway, local Docker, CI, API contract, baseline security, logging and environments.

## Phase 3 — Core services (3–4 weeks)
Branch, customer/guardian, Spa catalogue, staff/shift, playground zones, ticket pricing, capacity, menu, CMS and booking transactions.

## Phase 4 — Customer/Admin (3–4 weeks)
Authentication, customer portal, child profile management, booking UI, payment, check-in, staff and admin CRUD, branch-aware dashboard.

## Phase 5 — QA and optimization (2 weeks)
Unit/integration/E2E tests, concurrent capacity tests, idempotency, webhook verification, security checks, accessibility and Core Web Vitals.

## Phase 6 — Production release (1 week)
AWS deployment, domain, TLS, secrets, backup/recovery, monitoring, payment sandbox-to-live checks, QR hardware/browser tests, staff training and handover.

## Release gate
Do not launch real bookings until: official price/service data is approved; authentication and guardian ownership are implemented; capacity/slot data is configured; payment callbacks are verified; check-in/check-out and child handover procedures are tested.
