# Technical Architecture — BÉ VUI MẸ KHOẺ

## Architecture decision

Use a **growth-ready modular monolith**: one Spring Boot deployment divided by business capability, with explicit module boundaries. Start with one branch but include `branch_id` in business data and enforce branch-scoped authorization at the service layer.

Do not start with microservices, Kafka or Kubernetes. Revisit service extraction only when independent scaling, release cadence, ownership or operational isolation justifies it.

## Applications

### Web
- Next.js App Router + React + TypeScript.
- Server-render public content for SEO; client components only for interactions.
- Design system based on brand colors and Nunito.
- Customer and admin routes are separate route groups and must have server-enforced authorization once identity is complete.

### API
- Java 25 + Spring Boot 4.1.2.
- Spring Modulith 2.1.1.
- REST APIs under `/api/v1`.
- Spring Security, Bean Validation, Spring Data JPA/JdbcTemplate, Flyway, Actuator.
- PostgreSQL is the source of truth. Redis is cache/ephemeral support only.

### Modules
1. Identity and Access
2. Branch Management
3. Customer and Guardian Profiles
4. Spa Management
5. Playground Management
6. Booking and Scheduling
7. Payment Management
8. Check-in / Check-out
9. Menu Management
10. CMS and Media
11. Notifications and Analytics

No Combo or Event module is in scope.

## Deployment topology

- CloudFront + AWS WAF at the edge.
- Route 53 for DNS.
- ECS Fargate for Next.js and Spring Boot containers.
- RDS PostgreSQL as the primary database.
- ElastiCache Redis for cache and ephemeral state.
- S3 for private assets/files; Cloudinary for optimized public images.
- Secrets Manager for credentials.
- CloudWatch and Sentry for operations/exception visibility.

## Important transaction boundaries

### Playground capacity
- Lock the selected `capacity_slots` row in a database transaction.
- Recompute remaining capacity from `total_capacity - held_capacity - confirmed_capacity`.
- Insert a pending booking and increment held capacity in the same transaction.
- Use idempotency keys for retries.
- After a verified successful payment, atomically move capacity from held to confirmed.
- Release expired holds with a scheduled worker using `FOR UPDATE SKIP LOCKED`.

### Spa appointments
- Check staff shift, staff service assignment, room availability, service duration, preparation and cleanup buffers.
- Enforce non-overlapping time windows in the database/service transaction, not only in the browser.

## Authentication and data access

- Customer owns their own guardian profile and linked children.
- Staff access is scoped to assigned branch and duty.
- Branch managers are scoped to managed branches.
- Super Admin access is global and audited.
- Child notes/allergy information is private and should be encrypted at application level where appropriate, with restricted access and audit records.

The current Basic-auth filter is development scaffolding only. Production requires a reviewed login/session implementation and CSRF protection for cookie-authenticated writes.

## Observability

- Actuator health/readiness/liveness.
- Structured JSON logs with correlation ID.
- Sentry for frontend and backend exception reporting.
- OpenTelemetry tracing and metrics.
- No personal data or child notes in logs.

## Non-functional targets

- Core Web Vitals: LCP <= 2.5s, INP <= 200ms, CLS <= 0.1 at p75.
- WCAG 2.2 AA for key journeys.
- Idempotent payment callbacks.
- Tested database backup restoration.
- No cross-branch data leakage.
