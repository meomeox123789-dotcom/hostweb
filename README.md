# BÉ VUI MẸ KHOẺ — Full-stack starter

**Architecture:** growth-ready modular monolith  
**Frontend:** Next.js 16.3 / React 19.3 / TypeScript  
**Backend:** Java 25 / Spring Boot 4.1.2 / Spring Modulith 2.1.1  
**Data:** PostgreSQL 18 + Redis 8.2  
**Business scope:** Spa for mothers, kids playground, ticketing, menu and branch-ready operations.

> This is the first implementation baseline, not a production deployment. The public-facing website and initial database/API scaffolding are included. Full identity onboarding, live booking integration from the frontend, payment-provider credentials/webhooks, staff scheduling UI, operational QR scanning and production AWS provisioning remain implementation tasks.

## 1. Project structure

```text
BVMK_Fullstack/
├── apps/
│   ├── web/                  # Next.js customer website and admin UI baseline
│   └── api/                  # Spring Boot modular backend
├── contracts/                # OpenAPI contract
├── docs/                     # Architecture, data model, plan and implementation status
├── infra/                    # Local PostgreSQL + Redis
├── preview.html              # Standalone local preview (uses project assets)
└── .env.example
```

## 2. Requirements

- Node.js 22 LTS (Next.js 16 requires Node.js >= 20.9).
- Java 25 LTS.
- Maven 3.9+.
- Docker Engine + Docker Compose.

The generation environment used for this starter has Node 22 but Java 21 and does not have Maven installed. Therefore, frontend/backend build commands have not been executed in that environment. Run the verification steps below on a Java 25 + Maven machine before merging or deploying.

## 3. Run the full local stack with Docker

From the project root (Docker Engine + Compose required):

```bash
docker compose -f infra/docker-compose.yml up --build -d
```

Open `http://localhost:3000` for the website and `http://localhost:8080/actuator/health` for API health. PostgreSQL and Redis are also started. Flyway applies schema migrations at API startup.

Local-only credentials are configured in the Compose file. Do not reuse them outside development. To stop the stack:

```bash
docker compose -f infra/docker-compose.yml down
```

To remove local development data volumes too (destructive):

```bash
docker compose -f infra/docker-compose.yml down -v
```

## 4. Run services individually (optional)

Start PostgreSQL and Redis first, then run the API with Java 25 + Maven:

```bash
cd apps/api
mvn spring-boot:run
```

Run the frontend separately with Node.js 22:

```bash
cd apps/web
npm install
npm run dev
```

The API starts on `http://localhost:8080`. Flyway applies schema migrations automatically.

Public endpoints:

```text
GET /api/v1/public/branches
GET /api/v1/public/spa/services?branchCode=MAIN
GET /api/v1/public/ticket-prices?branchCode=MAIN
GET /api/v1/public/play/slots?branchCode=MAIN&date=2026-12-01
GET /api/v1/public/menu?branchCode=MAIN
GET /actuator/health
```

A default `MAIN` branch and the ticket/menu data from the provided references are seeded. Spa service prices are intentionally not seeded because the client has not supplied an approved Spa price list. Capacity slots must be configured by branch staff before real ticket booking can be enabled.

The current security chain is a development scaffold using HTTP Basic for protected API paths. It is **not the final customer authentication system**. Before production, implement verified phone/email login or OIDC, secure HttpOnly cookie sessions, CSRF protection for cookie-authenticated writes, and account/guardian provisioning.

## 5. Start the frontend

```bash
cd apps/web
npm install
npm run dev
```

Open:

- `http://localhost:3000` — public website.
- `http://localhost:3000/admin` — administration UI concept (demo data only).
- `http://localhost:3000/account` — customer portal placeholder.

The public booking dialog currently demonstrates the intended user journey and explicitly identifies itself as a preview. It does not submit personal data or create an actual booking yet. The menu and ticket price queries are wired to the public catalogue API with reference-data fallback.

## 6. Quality checks

Frontend:

```bash
npm run typecheck
npm run lint
npm run build
```

Backend:

```bash
mvn test
mvn verify
```

Before production, add tests for:

- Concurrent attempts to reserve the final remaining capacity.
- Idempotency key retries, including reuse of the same key with a different payload (must return conflict).
- Ticket price validity by branch-local service date.
- Expired hold release and verified-payment confirmation.
- Guardian ownership checks for child records.
- Cross-branch data access denial.
- Payment webhook signature validation and duplicate callbacks.

## 7. Important business assumptions

- There is no product/combo sales flow.
- There is no event-management module in this scope.
- Spa appointments and kids-play tickets are separate booking types.
- A parent/guardian account can manage its own profile and related child profiles.
- The website uses the brand green `#7AAF3E`, pink `#EB688A`, yellow `#FEDA7B`, gray `#68696B`, and Nunito typography.
- The fourth brand color is interpreted as `#68696B` from the RGB values (104, 105, 107), because the supplied PDF repeats the green HEX value in that row.
- The ticket price table is transcribed from the supplied reference: 2h / 4h / 6h / 8h and monthly 08:00–17:00. The image's first column heading says “COMBO”, but the client explicitly said no combo product is sold, so the website labels this data by **duration**, not combo.
- Menu data is seeded from the supplied menu image and should be confirmed by the business before production.
- No official Spa service prices, branch address, phone number, or opening hours have been invented.

## 8. Implementation status

See [`docs/IMPLEMENTATION-STATUS.md`](docs/IMPLEMENTATION-STATUS.md) for what is implemented, what is still a demo/scaffold, and the verification limits of this snapshot.

## 9. Production readiness checklist

- Complete Identity & Access: signup, sign-in, OTP, role assignment and guardian ownership.
- Complete staff/room/shift management and Spa availability.
- Add admin CRUD screens and configure branch capacity slots.
- Add payment provider accounts, signed callbacks, idempotent payment records and refund workflow.
- Add QR token issuance and secure check-in/check-out workflow.
- Add private storage rules for child-related media and sensitive records.
- Configure AWS networking, secrets, backups, alerting, WAF, TLS and recovery drills.
- Complete privacy/legal review and operational safety procedures for child handover.

## 9. Preview and handoff

- `preview.html` is a standalone design preview that uses local relative assets when opened from the project folder.
- The distributable single-file preview is delivered separately as `BVMK_Website_Preview.html`.
- The initial application source is provided as a development baseline. It is not a production-ready full service: authentication onboarding, real payment integration, real QR issuance/scanning, Spa appointment write APIs, admin CRUD APIs, and production infrastructure still need to be implemented and tested.

Before using any supplied prices publicly, have the business owner confirm the ticket table and the transcribed menu. The source image is a reference, not proof that the prices remain current.
