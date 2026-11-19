package vn.bevuimekhoe.booking;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PlayBookingResponse(
    UUID id,
    String bookingCode,
    BigDecimal unitPrice,
    BigDecimal totalAmount,
    int quantity,
    String status,
    Instant holdExpiresAt,
    int remainingCapacity
) { }
