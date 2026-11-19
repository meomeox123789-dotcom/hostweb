package vn.bevuimekhoe.booking;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Component
public class ExpiredBookingHoldCleaner {
    private final JdbcTemplate jdbc;

    public ExpiredBookingHoldCleaner(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Scheduled(fixedDelayString = "${bvmk.booking.hold-cleanup-ms:60000}")
    @Transactional
    public void releaseExpiredHolds() {
        List<ExpiredHold> expired = jdbc.query("""
            SELECT id, capacity_slot_id, quantity
            FROM play_bookings
            WHERE status = 'PENDING_PAYMENT' AND hold_expires_at < NOW()
            FOR UPDATE SKIP LOCKED
            """, (rs, rowNum) -> new ExpiredHold(
                rs.getObject("id", UUID.class), rs.getObject("capacity_slot_id", UUID.class), rs.getInt("quantity")
            ));

        for (ExpiredHold hold : expired) {
            jdbc.update("""
                UPDATE capacity_slots
                SET held_capacity = GREATEST(0, held_capacity - ?), updated_at = NOW()
                WHERE id = ?
                """, hold.quantity(), hold.slotId());
            jdbc.update("UPDATE play_bookings SET status = 'EXPIRED', updated_at = NOW() WHERE id = ?", hold.bookingId());
        }
    }

    private record ExpiredHold(UUID bookingId, UUID slotId, int quantity) { }
}
