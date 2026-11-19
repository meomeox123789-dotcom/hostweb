INSERT INTO branches (code, name, timezone)
VALUES ('MAIN', 'Cơ sở chính', 'Asia/Ho_Chi_Minh');

INSERT INTO roles (code, name) VALUES
('SUPER_ADMIN', 'Quản trị hệ thống'),
('BRANCH_MANAGER', 'Quản lý cơ sở'),
('SPA_STAFF', 'Nhân viên Spa'),
('KIDS_STAFF', 'Nhân viên khu vui chơi'),
('RECEPTIONIST', 'Lễ tân'),
('CUSTOMER', 'Khách hàng');

INSERT INTO ticket_types (code, name, duration_minutes, is_monthly, sort_order) VALUES
('PLAY_2H', 'Vé vui chơi 2 giờ', 120, FALSE, 1),
('PLAY_4H', 'Vé vui chơi 4 giờ', 240, FALSE, 2),
('PLAY_6H', 'Vé vui chơi 6 giờ', 360, FALSE, 3),
('PLAY_8H', 'Vé vui chơi 8 giờ', 480, FALSE, 4),
('PLAY_MONTH_8_17', 'Vé tháng 08:00–17:00', NULL, TRUE, 5);

INSERT INTO ticket_prices (branch_id, ticket_type_id, day_type, price, valid_from)
SELECT b.id, t.id, p.day_type, p.price, DATE '2026-01-01'
FROM branches b
CROSS JOIN (VALUES
    ('PLAY_2H', 'WEEKDAY',  90000), ('PLAY_2H', 'WEEKEND', 120000),
    ('PLAY_4H', 'WEEKDAY', 150000), ('PLAY_4H', 'WEEKEND', 190000),
    ('PLAY_6H', 'WEEKDAY', 220000), ('PLAY_6H', 'WEEKEND', 280000),
    ('PLAY_8H', 'WEEKDAY', 250000), ('PLAY_8H', 'WEEKEND', 350000),
    ('PLAY_MONTH_8_17', 'ALL', 4000000)
) AS p(ticket_code, day_type, price)
JOIN ticket_types t ON t.code = p.ticket_code
WHERE b.code = 'MAIN';

INSERT INTO menu_categories (branch_id, code, name, sort_order)
SELECT id, 'FOOD', 'Món ăn', 1 FROM branches WHERE code = 'MAIN'
UNION ALL SELECT id, 'SNACK', 'Ăn nhẹ', 2 FROM branches WHERE code = 'MAIN'
UNION ALL SELECT id, 'JUICE', 'Nước ép', 3 FROM branches WHERE code = 'MAIN'
UNION ALL SELECT id, 'DRINK', 'Nước uống', 4 FROM branches WHERE code = 'MAIN'
UNION ALL SELECT id, 'OTHER', 'Món khác', 5 FROM branches WHERE code = 'MAIN';

INSERT INTO menu_items (branch_id, category_id, code, name, price, sort_order)
SELECT b.id, c.id, m.code, m.name, m.price, m.sort_order
FROM branches b
JOIN (VALUES
 ('FOOD','MI_Y','Mì Ý',79000,1),
 ('FOOD','MI_BO','Mì bò',59000,2),
 ('FOOD','MI_2_TRUNG','Mì 2 trứng',49000,3),
 ('FOOD','MI_XAO_BO','Mì xào bò',66000,4),
 ('FOOD','MI_XAO_BO_TRUNG','Mì xào bò trứng',69000,5),
 ('FOOD','MI_THEM','Mì thêm',9000,6),
 ('FOOD','TRUNG_THEM','Trứng thêm',9000,7),
 ('FOOD','PIZZA_S','Pizza size S',78000,8),
 ('FOOD','PIZZA_L','Pizza size L',159000,9),
 ('FOOD','CANH_DUI_GA','1 cánh / đùi gà',45000,10),
 ('FOOD','SUP_XUONG_HAM','Súp xương hầm',33000,11),
 ('SNACK','KHOAI_TAY_CHIEN','Khoai tây chiên',29000,1),
 ('SNACK','CA_VIEN_1','Cá viên chiên (1 người)',49000,2),
 ('SNACK','CA_VIEN_2','Cá viên chiên (2 người)',79000,3),
 ('SNACK','XUC_XICH_1','Xúc xích Đức (1 que)',25000,4),
 ('SNACK','XUC_XICH_2','Xúc xích Đức (2 que)',45000,5),
 ('SNACK','PHO_MAI_QUE','Phô mai que (2 que)',38000,6),
 ('JUICE','EP_TAO','Nước ép táo',49000,1),
 ('JUICE','EP_CAM','Nước ép cam',49000,2),
 ('JUICE','EP_CA_ROT','Nước ép cà rốt',49000,3),
 ('JUICE','EP_DUA_HAU','Nước ép dưa hấu',49000,4),
 ('JUICE','EP_THOM','Nước ép thơm',49000,5),
 ('JUICE','EP_CA_CHUA','Nước ép cà chua',49000,6),
 ('JUICE','EP_MIX','Nước ép mix 2 loại',59000,7),
 ('DRINK','PEPSI','Pepsi',29000,1),
 ('DRINK','CAM','Cam',29000,2),
 ('DRINK','STING','Sting',29000,3),
 ('DRINK','NUOC_DUA','Nước dừa',39000,4),
 ('DRINK','PORORO','Nước trái cây PoRoRo',34000,5),
 ('DRINK','NUOC_SUOI','Nước suối',24000,6),
 ('OTHER','CA_PHE_DA','Cà phê đá',29000,1),
 ('OTHER','CA_PHE_SUA','Cà phê sữa',35000,2),
 ('OTHER','YAOURT_DA','Yaourt đá',44000,3),
 ('OTHER','YAOURT_DAU_TAY','Yaourt dâu tây',49000,4),
 ('OTHER','YAOURT_CHANH_DAY','Yaourt chanh dây',49000,5),
 ('OTHER','YAOURT_VIET_QUAT','Yaourt việt quất',49000,6),
 ('OTHER','CHANH_DAY','Chanh dây',39000,7),
 ('OTHER','SUA_TUOI','Sữa tươi',39000,8),
 ('OTHER','KEM','Kem',15000,9),
 ('OTHER','SUA_HOP','Sữa hộp TH Milk (nhỏ)',15000,10)
) AS m(category_code, code, name, price, sort_order) ON TRUE
JOIN menu_categories c ON c.branch_id = b.id AND c.code = m.category_code
WHERE b.code = 'MAIN';
