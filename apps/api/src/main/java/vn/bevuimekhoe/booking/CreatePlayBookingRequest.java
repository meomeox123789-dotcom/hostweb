package vn.bevuimekhoe.booking;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CreatePlayBookingRequest(
    @NotNull UUID capacitySlotId,
    @NotNull UUID ticketTypeId,
    @Min(1) @Max(20) int quantity,
    @NotBlank @Size(min = 12, max = 100) String idempotencyKey
) { }
