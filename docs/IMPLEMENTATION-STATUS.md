# Implementation Status — BÉ VUI MẸ KHOẺ

## Included in this starter snapshot

### Brand and public experience
- Responsive Next.js landing experience using the supplied logo and mascot.
- Brand palette and Nunito typography tokens.
- Separate Spa and kids-playground story areas.
- Playground ticket prices from the supplied image, shown by duration and weekday/weekend.
- Menu catalogue transcribed from the supplied image and grouped by category.
- Demo booking modal that only previews entered values locally; it does not transmit personal data.
- Privacy and terms pages marked as drafts requiring business/legal review.
- Standalone HTML preview for review without installing the application.

### Backend and data baseline
- Spring Boot modular-monolith package structure with Spring Modulith architecture test.
- Flyway V1 core schema for branches, identity, guardian/child records, Spa catalogue, staff, playground, ticket pricing, capacity, booking, payments, menu, CMS, notifications and audit logs.
- V2 seed for the `MAIN` branch, roles, provided ticket prices and transcribed menu.
- V3 indexes to prevent duplicate provider transaction IDs and duplicate capacity-slot definitions.
- Public catalogue APIs for branches, Spa services, playground ticket prices, capacity slots and menu.
- Initial playground booking hold service with database row locking, capacity invariant, idempotency key, 15-minute hold and scheduled release of expired holds.
- Payment confirmation service that must only be called after provider signature/status verification.
- OpenAPI 3.1 contract baseline.
- Docker Compose configuration for local PostgreSQL, Redis, API and Next.js services.

## Not yet implemented / not production-ready

- Customer registration, verified phone/email login, guardian onboarding, password reset and production session management.
- Production authentication integration; current API protection uses HTTP Basic as a development scaffold only.
- Spa appointment write API, conflict-safe staff/room scheduling and staff shift management UI.
- Admin CRUD APIs and real admin screens for catalogue, pricing, employees, capacity slots and customer records.
- Frontend booking submission to authenticated API; the current modal is intentionally a local preview.
- Payment checkout creation, real VNPay/MoMo signatures, IPN/webhook endpoints, refund flow and reconciliation worker.
- QR token issuance, secure check-in/check-out UI and child handover workflow.
- Branch management CRUD and branch-scoped authorization enforcement on every protected resource.
- Production AWS network, WAF, secrets, backups, monitoring alerts and recovery drills.
- Formal legal review of privacy notice, terms, child data handling and retention.

## Verification performed for this snapshot

- HTML parser check on the standalone preview.
- JavaScript syntax check for the inline preview script using Node.js.
- TypeScript/TSX syntax transpilation check using the globally available TypeScript compiler API.
- YAML parsing for Docker Compose, Spring configuration and OpenAPI.
- XML parsing for Maven `pom.xml`.

## Verification not performed

- `npm install` did not finish in the generation environment, so no Next.js build, lint or full typecheck was completed.
- Maven was not available and the environment ran Java 21 while this project targets Java 25; no Spring Boot compile or test run was completed.
- Docker Engine/Compose was not available; the containers were not built or started.
- PostgreSQL migrations were not executed against a live PostgreSQL instance.

## Release gate

Do not accept real bookings or payments until the missing authentication, ownership checks, capacity configuration, payment verification, QR operation, child handover procedures and business-approved prices have been implemented and tested.
