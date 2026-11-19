CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(40) NOT NULL UNIQUE,
    name VARCHAR(180) NOT NULL,
    address_line VARCHAR(255),
    ward VARCHAR(120),
    district VARCHAR(120),
    city VARCHAR(120),
    phone VARCHAR(30),
    timezone VARCHAR(60) NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE app_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(190) UNIQUE,
    phone VARCHAR(30) UNIQUE,
    password_hash VARCHAR(255),
    display_name VARCHAR(160) NOT NULL,
    status VARCHAR(24) NOT NULL DEFAULT 'PENDING',
    email_verified_at TIMESTAMPTZ,
    phone_verified_at TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT ck_app_users_contact CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE user_branch_roles (
    user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id, branch_id)
);

CREATE TABLE guardians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES app_users(id) ON DELETE CASCADE,
    preferred_name VARCHAR(120),
    privacy_consent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE children (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guardian_id UUID NOT NULL REFERENCES guardians(id) ON DELETE CASCADE,
    display_name VARCHAR(120) NOT NULL,
    birth_date DATE,
    notes_private TEXT,
    allergy_notes_private TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_children_guardian ON children(guardian_id);

CREATE TABLE spa_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES branches(id),
    code VARCHAR(60) NOT NULL,
    name VARCHAR(180) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    price NUMERIC(12,2),
    currency CHAR(3) NOT NULL DEFAULT 'VND',
    preparation_minutes INTEGER NOT NULL DEFAULT 0 CHECK (preparation_minutes >= 0),
    cleanup_minutes INTEGER NOT NULL DEFAULT 0 CHECK (cleanup_minutes >= 0),
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (branch_id, code)
);

CREATE TABLE staff_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES app_users(id),
    branch_id UUID NOT NULL REFERENCES branches(id),
    staff_code VARCHAR(50) NOT NULL,
    display_name VARCHAR(140) NOT NULL,
    department VARCHAR(40) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (branch_id, staff_code)
);

CREATE TABLE staff_service_assignments (
    staff_id UUID NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
    spa_service_id UUID NOT NULL REFERENCES spa_services(id) ON DELETE CASCADE,
    PRIMARY KEY (staff_id, spa_service_id)
);

CREATE TABLE staff_shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES branches(id),
    staff_id UUID NOT NULL REFERENCES staff_profiles(id),
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(24) NOT NULL DEFAULT 'WORKING',
    CHECK (ends_at > starts_at)
);
CREATE INDEX idx_staff_shifts_staff_time ON staff_shifts(staff_id, starts_at, ends_at);

CREATE TABLE spa_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES branches(id),
    code VARCHAR(40) NOT NULL,
    name VARCHAR(120) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (branch_id, code)
);

CREATE TABLE spa_appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_code VARCHAR(40) NOT NULL UNIQUE,
    branch_id UUID NOT NULL REFERENCES branches(id),
    guardian_id UUID NOT NULL REFERENCES guardians(id),
    spa_service_id UUID NOT NULL REFERENCES spa_services(id),
    staff_id UUID REFERENCES staff_profiles(id),
    room_id UUID REFERENCES spa_rooms(id),
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    price_snapshot NUMERIC(12,2) NOT NULL CHECK (price_snapshot >= 0),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING_PAYMENT',
    customer_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (ends_at > starts_at)
);
CREATE INDEX idx_spa_appointments_branch_time ON spa_appointments(branch_id, starts_at, ends_at);
CREATE INDEX idx_spa_appointments_staff_time ON spa_appointments(staff_id, starts_at, ends_at);

CREATE TABLE play_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES branches(id),
    code VARCHAR(50) NOT NULL,
    name VARCHAR(160) NOT NULL,
    description TEXT,
    min_age_months INTEGER,
    max_age_months INTEGER,
    safety_notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (branch_id, code),
    CHECK (min_age_months IS NULL OR min_age_months >= 0),
    CHECK (max_age_months IS NULL OR min_age_months IS NULL OR max_age_months >= min_age_months)
);

CREATE TABLE ticket_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    duration_minutes INTEGER,
    is_monthly BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    CHECK (duration_minutes IS NULL OR duration_minutes > 0)
);

CREATE TABLE ticket_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES branches(id),
    ticket_type_id UUID NOT NULL REFERENCES ticket_types(id),
    day_type VARCHAR(20) NOT NULL CHECK (day_type IN ('WEEKDAY','WEEKEND','ALL')),
    price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
    currency CHAR(3) NOT NULL DEFAULT 'VND',
    valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_to DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    CHECK (valid_to IS NULL OR valid_to >= valid_from),
    UNIQUE (branch_id, ticket_type_id, day_type, valid_from)
);

CREATE TABLE capacity_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES branches(id),
    play_zone_id UUID REFERENCES play_zones(id),
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    total_capacity INTEGER NOT NULL CHECK (total_capacity >= 0),
    held_capacity INTEGER NOT NULL DEFAULT 0 CHECK (held_capacity >= 0),
    confirmed_capacity INTEGER NOT NULL DEFAULT 0 CHECK (confirmed_capacity >= 0),
    is_open BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (ends_at > starts_at),
    CHECK (held_capacity + confirmed_capacity <= total_capacity)
);
CREATE INDEX idx_capacity_slots_branch_time ON capacity_slots(branch_id, starts_at, ends_at) WHERE is_open = TRUE;

CREATE TABLE play_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_code VARCHAR(40) NOT NULL UNIQUE,
    branch_id UUID NOT NULL REFERENCES branches(id),
    guardian_id UUID NOT NULL REFERENCES guardians(id),
    capacity_slot_id UUID NOT NULL REFERENCES capacity_slots(id),
    ticket_type_id UUID NOT NULL REFERENCES ticket_types(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price_snapshot NUMERIC(12,2) NOT NULL CHECK (unit_price_snapshot >= 0),
    total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING_PAYMENT',
    hold_expires_at TIMESTAMPTZ,
    idempotency_key VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (guardian_id, idempotency_key)
);
CREATE INDEX idx_play_bookings_branch_status ON play_bookings(branch_id, status, created_at);

CREATE TABLE play_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    play_booking_id UUID NOT NULL REFERENCES play_bookings(id) ON DELETE CASCADE,
    child_id UUID REFERENCES children(id),
    visitor_label VARCHAR(120),
    qr_token_hash VARCHAR(255) NOT NULL UNIQUE,
    checked_in_at TIMESTAMPTZ,
    checked_out_at TIMESTAMPTZ,
    status VARCHAR(24) NOT NULL DEFAULT 'ISSUED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (checked_out_at IS NULL OR checked_in_at IS NOT NULL)
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES branches(id),
    payment_code VARCHAR(50) NOT NULL UNIQUE,
    booking_type VARCHAR(30) NOT NULL CHECK (booking_type IN ('SPA_APPOINTMENT','PLAY_BOOKING')),
    booking_id UUID NOT NULL,
    provider VARCHAR(30) NOT NULL,
    provider_transaction_id VARCHAR(120),
    amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
    currency CHAR(3) NOT NULL DEFAULT 'VND',
    status VARCHAR(30) NOT NULL DEFAULT 'INITIATED',
    idempotency_key VARCHAR(100) NOT NULL UNIQUE,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_payments_booking ON payments(booking_type, booking_id);

CREATE TABLE menu_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES branches(id),
    code VARCHAR(50) NOT NULL,
    name VARCHAR(120) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (branch_id, code)
);

CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES branches(id),
    category_id UUID NOT NULL REFERENCES menu_categories(id),
    code VARCHAR(60) NOT NULL,
    name VARCHAR(160) NOT NULL,
    description TEXT,
    price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
    currency CHAR(3) NOT NULL DEFAULT 'VND',
    image_url TEXT,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (branch_id, code)
);

CREATE TABLE cms_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID REFERENCES branches(id),
    slug VARCHAR(160) NOT NULL,
    title VARCHAR(200) NOT NULL,
    body_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (branch_id, slug)
);

CREATE TABLE media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID REFERENCES branches(id),
    storage_provider VARCHAR(30) NOT NULL,
    storage_key TEXT NOT NULL,
    public_url TEXT,
    visibility VARCHAR(20) NOT NULL DEFAULT 'PUBLIC',
    mime_type VARCHAR(120),
    created_by UUID REFERENCES app_users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES app_users(id),
    channel VARCHAR(20) NOT NULL,
    template_code VARCHAR(80) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(24) NOT NULL DEFAULT 'QUEUED',
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID REFERENCES branches(id),
    actor_user_id UUID REFERENCES app_users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    ip_hash VARCHAR(128),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_logs_branch_created ON audit_logs(branch_id, created_at DESC);
