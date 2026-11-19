package vn.bevuimekhoe.booking;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/** Call only after the payment provider signature and transaction status are verified. */
@Service
public class PlayBookingPaymentConfirmationService {
    private final JdbcTemplate jdbc;

    public PlayBookingPaymentConfirmationService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Transactional
    public void confirmVerifiedPayment(UUID bookingId) {
        var updated = jdbc.query("""
            UPDATE play_bookings
            SET status = 'CONFIRMED', hold_expires_at = NULL, updated_at = NOW()
            WHERE id = ? AND status = 'PENDING_PAYMENT' AND hold_expires_at > NOW()
            RETURNING capacity_slot_id, quantity
            """, (rs, rowNum) -> new Reservation(
                rs.getObject("capacity_slot_id", UUID.class), rs.getInt("quantity")
            ), bookingId);

        if (updated.isEmpty()) {
            throw new BookingConflictException("Booking không còn ở trạng thái có thể xác nhận; cần kiểm tra và xử lý giao dịch.");
        }

        Reservation reservation = updated.getFirst();
        int changed = jdbc.update("""
            UPDATE capacity_slots
            SET held_capacity = held_capacity - ?,
                confirmed_capacity = confirmed_capacity + ?,
                updated_at = NOW()
            WHERE id = ? AND held_capacity >= ?
            """, reservation.quantity(), reservation.quantity(), reservation.slotId(), reservation.quantity());

        if (changed != 1) {
            throw new IllegalStateException("Không thể chuyển sức chứa từ giữ chỗ sang đã xác nhận.");
        }
    }

    private record Reservation(UUID slotId, int quantity) { }
}
