# Database Model — Initial Logical Design

## Core entities

| Area | Tables | Notes |
|---|---|---|
| Branch | `branches` | One `MAIN` seed row; add branches as they open. |
| Identity | `app_users`, `roles`, `user_roles`, `user_branch_roles` | Global and branch-scoped roles are separated. |
| Guardian | `guardians`, `children` | A user may manage multiple child profiles. Child data is private. |
| Spa | `spa_services`, `staff_profiles`, `staff_service_assignments`, `staff_shifts`, `spa_rooms`, `spa_appointments` | Service duration and buffers are stored on services. |
| Playground | `play_zones`, `ticket_types`, `ticket_prices`, `capacity_slots`, `play_bookings`, `play_visits` | Capacity is controlled at slot level. |
| Payment | `payments` | Provider transaction ID, amount snapshot and idempotency key. |
| Menu | `menu_categories`, `menu_items` | Menu data can be scoped to each branch. |
| CMS/media | `cms_pages`, `media_assets` | Public and private media visibility. |
| Operations | `notifications`, `audit_logs` | Operational traceability without logging sensitive notes. |

## Branch readiness

Branch-owned records have `branch_id`. Authorization must always combine user role and branch assignment. Do not trust a `branch_id` sent from the browser without checking access.

## Pricing snapshots

- `ticket_prices` stores dated price rules by branch, ticket type and day type.
- Booking records store `unit_price_snapshot` and `total_amount`; later price edits must not alter existing orders.
- `spa_services.price` may be NULL until the official Spa price list is approved. Do not publish a Spa price from placeholder data.

## Capacity invariants

For each slot:

`held_capacity + confirmed_capacity <= total_capacity`

Reservations must lock the slot row, update capacity counters and create the booking in one transaction. A successful verified payment moves quantity from held to confirmed. Expired pending holds are released.

## Data retention and privacy

- Minimize the child data collected.
- Avoid public URLs for sensitive child records.
- Store only hashed QR tokens, not raw personal data in a QR code.
- Audit access to private child notes.
- Define retention/deletion periods with the business and legal reviewer before production.
