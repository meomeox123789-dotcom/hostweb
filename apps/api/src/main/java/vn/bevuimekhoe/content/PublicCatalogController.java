package vn.bevuimekhoe.content;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/public")
public class PublicCatalogController {
    private final JdbcTemplate jdbcTemplate;

    public PublicCatalogController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/ticket-prices")
    public List<Map<String, Object>> ticketPrices(@RequestParam(defaultValue = "MAIN") String branchCode) {
        return jdbcTemplate.queryForList("""
            SELECT tt.code AS ticket_code, tt.name AS ticket_name, tt.duration_minutes,
                   tp.day_type, tp.price, tp.currency, tp.valid_from, tp.valid_to
            FROM ticket_prices tp
            JOIN ticket_types tt ON tt.id = tp.ticket_type_id
            JOIN branches b ON b.id = tp.branch_id
            WHERE b.code = ? AND tp.is_active = TRUE AND tt.is_active = TRUE
              AND (CURRENT_TIMESTAMP AT TIME ZONE b.timezone)::date >= tp.valid_from
              AND (tp.valid_to IS NULL OR (CURRENT_TIMESTAMP AT TIME ZONE b.timezone)::date <= tp.valid_to)
            ORDER BY tt.sort_order, tp.day_type
            """, branchCode);
    }

    @GetMapping("/menu")
    public List<Map<String, Object>> menu(@RequestParam(defaultValue = "MAIN") String branchCode) {
        return jdbcTemplate.queryForList("""
            SELECT mc.name AS category, mi.name, mi.description, mi.price, mi.currency, mi.is_available
            FROM menu_items mi
            JOIN menu_categories mc ON mc.id = mi.category_id
            JOIN branches b ON b.id = mi.branch_id
            WHERE b.code = ? AND mc.is_active = TRUE AND mi.is_published = TRUE
            ORDER BY mc.sort_order, mi.sort_order, mi.name
            """, branchCode);
    }

    @GetMapping("/spa/services")
    public List<Map<String, Object>> spaServices(@RequestParam(defaultValue = "MAIN") String branchCode) {
        return jdbcTemplate.queryForList("""
            SELECT s.code, s.name, s.description, s.duration_minutes, s.price, s.currency
            FROM spa_services s
            JOIN branches b ON b.id = s.branch_id
            WHERE b.code = ? AND s.is_active = TRUE AND s.is_published = TRUE
            ORDER BY s.name
            """, branchCode);
    }

    @GetMapping("/play/slots")
    public List<Map<String, Object>> playgroundSlots(
        @RequestParam(defaultValue = "MAIN") String branchCode,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return jdbcTemplate.queryForList("""
            SELECT cs.id, cs.starts_at, cs.ends_at,
                   cs.total_capacity - cs.held_capacity - cs.confirmed_capacity AS remaining_capacity,
                   pz.name AS zone_name
            FROM capacity_slots cs
            JOIN branches b ON b.id = cs.branch_id
            LEFT JOIN play_zones pz ON pz.id = cs.play_zone_id
            WHERE b.code = ? AND cs.is_open = TRUE
              AND (cs.starts_at AT TIME ZONE b.timezone)::date = ?
              AND cs.starts_at > NOW()
            ORDER BY cs.starts_at
            """, branchCode, date);
    }

    @GetMapping("/branches")
    public List<Map<String, Object>> branches() {
        return jdbcTemplate.queryForList("""
            SELECT code, name, city, timezone
            FROM branches WHERE is_active = TRUE ORDER BY name
            """);
    }
}
