package vn.bevuimekhoe.booking;

import java.util.UUID;

/** A capacity reservation result; a booking must only be created after this is returned. */
public record CapacityReservation(UUID slotId, int quantity, int remainingAfterHold) { }
