-- Prevent provider transaction duplication after a webhook retry.
CREATE UNIQUE INDEX uq_payments_provider_transaction
    ON payments(provider, provider_transaction_id)
    WHERE provider_transaction_id IS NOT NULL;

-- A branch/zone/time window represents one physical capacity slot.
CREATE UNIQUE INDEX uq_capacity_slot_occurrence
    ON capacity_slots (
        branch_id,
        COALESCE(play_zone_id, '00000000-0000-0000-0000-000000000000'::uuid),
        starts_at,
        ends_at
    );
