package vn.bevuimekhoe.booking;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
public class PlayBookingService {
    private final JdbcTemplate jdbc;

    public PlayBookingService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Transactional
    public CreatePlayBookingResult create(String authenticatedUser, CreatePlayBookingRequest request) {
        if (request.quantity() < 1 || request.quantity() > 20) {
            throw new IllegalArgumentException("Số lượng vé phải từ 1 đến 20.");
        }

        UUID guardianId = jdbc.queryForObject("""
            SELECT g.id
            FROM guardians g
            JOIN app_users u ON u.id = g.user_id
            WHERE u.email = ? OR u.phone = ?
            """, UUID.class, authenticatedUser, authenticatedUser);

        // Serialize retries carrying the same idempotency key before checking for an existing booking.
        jdbc.query(
            "SELECT pg_advisory_xact_lock(hashtextextended(?, 0))",
            resultSet -> null,
            guardianId + ":" + request.idempotencyKey()
        );

        // Idempotency prevents a browser retry or gateway retry from creating a duplicate booking.
        try {
            ExistingBooking existing = jdbc.queryForObject("""
                SELECT id, booking_code, unit_price_snapshot, total_amount, quantity, status,
                       hold_expires_at, capacity_slot_id, ticket_type_id
                FROM play_bookings
                WHERE guardian_id = ? AND idempotency_key = ?
                """, (rs, rowNum) -> new ExistingBooking(
                    rs.getObject("id", UUID.class), rs.getString("booking_code"),
                    rs.getBigDecimal("unit_price_snapshot"), rs.getBigDecimal("total_amount"),
                    rs.getInt("quantity"), rs.getString("status"),
                    rs.getTimestamp("hold_expires_at") == null ? null : rs.getTimestamp("hold_expires_at").toInstant(),
                    rs.getObject("capacity_slot_id", UUID.class), rs.getObject("ticket_type_id", UUID.class)
                ), guardianId, request.idempotencyKey());

            if (!existing.slotId().equals(request.capacitySlotId())
                || !existing.ticketTypeId().equals(request.ticketTypeId())
                || existing.quantity() != request.quantity()) {
                throw new BookingConflictException("Idempotency key đã được dùng cho một yêu cầu đặt vé khác.");
            }
            return new CreatePlayBookingResult(new PlayBookingResponse(
                existing.id(), existing.bookingCode(), existing.unitPrice(), existing.totalAmount(),
                existing.quantity(), existing.status(), existing.holdExpiresAt(), remainingCapacity(existing.slotId())
            ), false);
        } catch (EmptyResultDataAccessException ignored) {
            // No previous request: continue with a new transactional hold.
        }

        SlotSnapshot slot = jdbc.queryForObject("""
            SELECT cs.id, cs.branch_id, cs.total_capacity, cs.held_capacity, cs.confirmed_capacity,
                   (cs.starts_at AT TIME ZONE b.timezone)::date AS service_date,
                   CASE WHEN EXTRACT(ISODOW FROM (cs.starts_at AT TIME ZONE b.timezone)::date) IN (6,7)
                        THEN 'WEEKEND' ELSE 'WEEKDAY' END AS day_type
            FROM capacity_slots cs
            JOIN branches b ON b.id = cs.branch_id
            WHERE cs.id = ? AND cs.is_open = TRUE AND cs.starts_at > NOW()
            FOR UPDATE OF cs
            """, (rs, rowNum) -> new SlotSnapshot(
                rs.getObject("id", UUID.class), rs.getObject("branch_id", UUID.class),
                rs.getInt("total_capacity"), rs.getInt("held_capacity"), rs.getInt("confirmed_capacity"),
                rs.getString("day_type"), rs.getDate("service_date").toLocalDate()
            ), request.capacitySlotId());

        int remaining = slot.totalCapacity() - slot.heldCapacity() - slot.confirmedCapacity();
        if (remaining < request.quantity()) {
            throw new BookingConflictException("Số chỗ còn lại không đủ cho yêu cầu này.");
        }

        Boolean isMonthly = jdbc.queryForObject(
            "SELECT is_monthly FROM ticket_types WHERE id = ? AND is_active = TRUE",
            Boolean.class, request.ticketTypeId());
        if (Boolean.TRUE.equals(isMonthly)) {
            throw new IllegalArgumentException("Vé tháng cần quy trình đăng ký riêng, chưa mở đặt trực tuyến.");
        }

        BigDecimal unitPrice = jdbc.queryForObject("""
            SELECT tp.price
            FROM ticket_prices tp
            WHERE tp.branch_id = ? AND tp.ticket_type_id = ?
              AND tp.day_type = ? AND tp.is_active = TRUE
              AND CAST(? AS DATE) >= tp.valid_from
              AND (tp.valid_to IS NULL OR CAST(? AS DATE) <= tp.valid_to)
            ORDER BY tp.valid_from DESC LIMIT 1
            """, BigDecimal.class, slot.branchId(), request.ticketTypeId(), slot.dayType(),
            slot.serviceDate(), slot.serviceDate());

        BigDecimal total = unitPrice.multiply(BigDecimal.valueOf(request.quantity()));
        UUID bookingId = UUID.randomUUID();
        String bookingCode = "BVMK-" + UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase();
        Instant expiresAt = Instant.now().plus(15, ChronoUnit.MINUTES);

        jdbc.update("""
            INSERT INTO play_bookings (
                id, booking_code, branch_id, guardian_id, capacity_slot_id, ticket_type_id,
                quantity, unit_price_snapshot, total_amount, status, hold_expires_at, idempotency_key
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING_PAYMENT', ?, ?)
            """, bookingId, bookingCode, slot.branchId(), guardianId, slot.id(), request.ticketTypeId(),
            request.quantity(), unitPrice, total, Timestamp.from(expiresAt), request.idempotencyKey());

        jdbc.update("""
            UPDATE capacity_slots
            SET held_capacity = held_capacity + ?, updated_at = NOW()
            WHERE id = ?
            """, request.quantity(), slot.id());

        return new CreatePlayBookingResult(new PlayBookingResponse(bookingId, bookingCode, unitPrice, total, request.quantity(),
            "PENDING_PAYMENT", expiresAt, remaining - request.quantity()), true);
    }

    private int remainingCapacity(UUID slotId) {
        Integer remaining = jdbc.queryForObject("""
            SELECT total_capacity - held_capacity - confirmed_capacity
            FROM capacity_slots WHERE id = ?
            """, Integer.class, slotId);
        return remaining == null ? 0 : remaining;
    }

    private record SlotSnapshot(UUID id, UUID branchId, int totalCapacity, int heldCapacity,
                                 int confirmedCapacity, String dayType, LocalDate serviceDate) { }

    private record ExistingBooking(UUID id, String bookingCode, BigDecimal unitPrice, BigDecimal totalAmount,
                                   int quantity, String status, Instant holdExpiresAt, UUID slotId, UUID ticketTypeId) { }
}
