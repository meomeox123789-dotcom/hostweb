"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { publicApi } from "@/lib/api";
import { formatServicePrice, nailPriceGroups, spaPriceGroups } from "@/lib/service-prices";
import {
  ArrowUpRight, Baby, Flower2, Heart, Menu as MenuIcon, X,
} from "lucide-react";

type BookingType = "spa" | "nail" | "play";
type MenuCategory = "all" | "food" | "snack" | "juice" | "drink" | "other";

const tickets = [
  { code: "PLAY_2H", duration: "2 giờ", weekday: 90_000, weekend: 120_000, note: "Vui chơi theo khung giờ" },
  { code: "PLAY_4H", duration: "4 giờ", weekday: 150_000, weekend: 190_000, note: "Vui chơi & khám phá" },
  { code: "PLAY_6H", duration: "6 giờ", weekday: 220_000, weekend: 280_000, note: "Vui chơi & trải nghiệm" },
  { code: "PLAY_8H", duration: "8 giờ", weekday: 250_000, weekend: 350_000, note: "Vui chơi theo thời lượng vé" },
];

const menuItems: { name: string; price: number; category: Exclude<MenuCategory, "all"> }[] = [
  { name: "Mì Ý", price: 79_000, category: "food" },
  { name: "Mì bò", price: 59_000, category: "food" },
  { name: "Mì 2 trứng", price: 49_000, category: "food" },
  { name: "Mì xào bò", price: 66_000, category: "food" },
  { name: "Mì xào bò trứng", price: 69_000, category: "food" },
  { name: "Mì thêm", price: 9_000, category: "food" },
  { name: "Trứng thêm", price: 9_000, category: "food" },
  { name: "Pizza size S", price: 78_000, category: "food" },
  { name: "Pizza size L", price: 159_000, category: "food" },
  { name: "1 cánh / đùi gà", price: 45_000, category: "food" },
  { name: "Súp xương hầm", price: 33_000, category: "food" },
  { name: "Khoai tây chiên", price: 29_000, category: "snack" },
  { name: "Cá viên chiên (1 người)", price: 49_000, category: "snack" },
  { name: "Cá viên chiên (2 người)", price: 79_000, category: "snack" },
  { name: "Xúc xích Đức (1 que)", price: 25_000, category: "snack" },
  { name: "Xúc xích Đức (2 que)", price: 45_000, category: "snack" },
  { name: "Phô mai que (2 que)", price: 38_000, category: "snack" },
  { name: "Nước ép táo", price: 49_000, category: "juice" },
  { name: "Nước ép cam", price: 49_000, category: "juice" },
  { name: "Nước ép cà rốt", price: 49_000, category: "juice" },
  { name: "Nước ép dưa hấu", price: 49_000, category: "juice" },
  { name: "Nước ép thơm", price: 49_000, category: "juice" },
  { name: "Nước ép cà chua", price: 49_000, category: "juice" },
  { name: "Nước ép mix 2 loại", price: 59_000, category: "juice" },
  { name: "Pepsi", price: 29_000, category: "drink" },
  { name: "Cam", price: 29_000, category: "drink" },
  { name: "Sting", price: 29_000, category: "drink" },
  { name: "Nước dừa", price: 39_000, category: "drink" },
  { name: "Nước trái cây PoRoRo", price: 34_000, category: "drink" },
  { name: "Nước suối", price: 24_000, category: "drink" },
  { name: "Cà phê đá", price: 29_000, category: "other" },
  { name: "Cà phê sữa", price: 35_000, category: "other" },
  { name: "Yaourt đá", price: 44_000, category: "other" },
  { name: "Yaourt dâu tây", price: 49_000, category: "other" },
  { name: "Yaourt chanh dây", price: 49_000, category: "other" },
  { name: "Yaourt việt quất", price: 49_000, category: "other" },
  { name: "Chanh dây", price: 39_000, category: "other" },
  { name: "Sữa tươi", price: 39_000, category: "other" },
  { name: "Kem", price: 15_000, category: "other" },
  { name: "Sữa hộp TH Milk (nhỏ)", price: 15_000, category: "other" },
];

const money = (value: number) => new Intl.NumberFormat("vi-VN").format(value) + "đ";

function BookingModal({
  type,
  onClose,
}: {
  type: BookingType | null;
  onClose: () => void;
}) {
  const [service, setService] = useState<BookingType>(type ?? "play");
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ date: "", time: "09:00 – 11:00", duration: "2 giờ", adults: "1", children: "1", name: "", phone: "" });

  if (!type) return null;

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setSubmitted(false);
  }

  return (
    <div className="modal-backdrop open" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="booking-title">
        <div className="modal-head">
          <div><div className="kicker">Đặt dịch vụ</div><h3 id="booking-title">Gửi yêu cầu đặt lịch</h3></div>
          <button className="close" onClick={onClose} aria-label="Đóng cửa sổ"><X size={19}/></button>
        </div>
        <form onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}>
          <div className="form-grid">
            <div className="field full"><label htmlFor="booking-service">Bạn quan tâm dịch vụ nào?</label>
              <select id="booking-service" value={service} onChange={(event) => { setService(event.target.value as BookingType); setSubmitted(false); }}>
                <option value="play">Vé khu vui chơi</option><option value="spa">Tư vấn Spa</option><option value="nail">Tư vấn Nail</option>
              </select>
            </div>
            <div className="field"><label htmlFor="booking-date">Ngày dự kiến</label><input id="booking-date" type="date" min={new Date().toISOString().slice(0, 10)} required value={form.date} onChange={(e) => update("date", e.target.value)}/></div>
            <div className="field"><label htmlFor="booking-time">Khung giờ mong muốn</label><select id="booking-time" value={form.time} onChange={(e) => update("time", e.target.value)}><option>09:00 – 11:00</option><option>11:00 – 13:00</option><option>13:00 – 15:00</option><option>15:00 – 17:00</option></select></div>
            {service === "play" ? <><div className="field"><label htmlFor="booking-duration">Thời lượng vé</label><select id="booking-duration" value={form.duration} onChange={(e) => update("duration", e.target.value)}><option>2 giờ</option><option>4 giờ</option><option>6 giờ</option><option>8 giờ</option></select></div><div className="field"><label htmlFor="booking-adults">Số người lớn</label><input id="booking-adults" type="number" min="1" value={form.adults} onChange={(e) => update("adults", e.target.value)}/></div><div className="field"><label htmlFor="booking-children">Số trẻ em</label><input id="booking-children" type="number" min="0" value={form.children} onChange={(e) => update("children", e.target.value)}/></div></> : <div className="field"><label htmlFor="booking-adults">Số khách</label><input id="booking-adults" type="number" min="1" value={form.adults} onChange={(e) => update("adults", e.target.value)}/></div>}
            <div className="field full"><label htmlFor="booking-name">Tên người liên hệ</label><input id="booking-name" autoComplete="name" placeholder="Nhập tên người liên hệ" required value={form.name} onChange={(e) => update("name", e.target.value)}/></div>
            <div className="field full"><label htmlFor="booking-phone">Số điện thoại</label><input id="booking-phone" autoComplete="tel" type="tel" pattern="[0-9+ .()-]{9,16}" placeholder="Nhập số điện thoại" required value={form.phone} onChange={(e) => update("phone", e.target.value)}/></div>
          </div>
          <div className="demo-alert">BẢN DEMO GIAO DIỆN: dữ liệu chưa được gửi đến cơ sở, chưa tạo đơn và chưa phát sinh thanh toán.</div>
          <button className="btn btn-green" type="submit" style={{ width: "100%" }}>Xem trước yêu cầu <ArrowUpRight size={17}/></button>
          {submitted && <div className="modal-result show"><b>Thông tin xem trước</b><br/>Người liên hệ: {form.name}<br/>Dịch vụ: {service === "play" ? "Vé khu vui chơi" : service === "spa" ? "Tư vấn Spa" : "Tư vấn Nail"}<br/>Ngày: {form.date} · Khung giờ: {form.time}<br/>{service === "play" && <>Thời lượng: {form.duration}<br/></>}{service === "play" ? <>Người lớn: {form.adults} · Trẻ em: {form.children}</> : <>Số khách: {form.adults}</>}<br/><br/><b>Chưa gửi dữ liệu.</b> Khi Backend được kết nối, yêu cầu sẽ được chuyển đến hệ thống đặt chỗ.</div>}
        </form>
      </section>
    </div>
  );
}

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [priceDay, setPriceDay] = useState<"weekday" | "weekend">("weekday");
  const [menuCategory, setMenuCategory] = useState<MenuCategory>("all");
  const [serviceTab, setServiceTab] = useState<"spa" | "nail">("spa");
  const [bookingType, setBookingType] = useState<BookingType | null>(null);
  const ticketQuery = useQuery({ queryKey: ["public", "ticket-prices", "MAIN"], queryFn: () => publicApi.ticketPrices("MAIN"), staleTime: 60_000, retry: 0 });
  const menuQuery = useQuery({ queryKey: ["public", "menu", "MAIN"], queryFn: () => publicApi.menu("MAIN"), staleTime: 60_000, retry: 0 });
  const filteredMenu = useMemo(() => {
    if (menuQuery.data?.length) {
      return menuQuery.data
        .filter((item) => item.is_available)
        .map((item) => ({
          name: item.name,
          price: Number(item.price),
          category: item.category.toLowerCase().includes("món ăn") ? "food" as const
            : item.category.toLowerCase().includes("ăn nhẹ") ? "snack" as const
            : item.category.toLowerCase().includes("nước ép") ? "juice" as const
            : item.category.toLowerCase().includes("nước uống") ? "drink" as const
            : "other" as const,
        }))
        .filter((item) => menuCategory === "all" || item.category === menuCategory);
    }
    return menuItems.filter((item) => menuCategory === "all" || item.category === menuCategory);
  }, [menuCategory, menuQuery.data]);

  const servicePriceGroups = serviceTab === "spa" ? spaPriceGroups : nailPriceGroups;
  const spaPriceCount = spaPriceGroups.reduce((total, group) => total + group.items.length, 0);
  const nailPriceCount = nailPriceGroups.reduce((total, group) => total + group.items.length, 0);

  const openBooking = (type: BookingType) => setBookingType(type);
  const closeBooking = () => setBookingType(null);

  return (
    <>
      <a className="skip-link" href="#main">Bỏ qua điều hướng</a>
      <header className="header"><div className="container nav">
        <a className="brand" href="#home" aria-label="BÉ VUI MẸ KHOẺ - Trang chủ"><Image src="/assets/bvmk-logo.png" alt="BÉ VUI MẸ KHOẺ" width={440} height={87} priority/></a>
        <nav className="navlinks" aria-label="Điều hướng chính"><a href="#play">Khu vui chơi</a><a href="#spa-nail-pricing">Spa & Nail</a><a href="#menu">Thực đơn</a><a href="#contact">Liên hệ</a></nav>
        <div className="nav-actions"><button className="btn btn-green" onClick={() => openBooking("play")}>Gửi yêu cầu <ArrowUpRight size={16}/></button><button className="menu-btn" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? "Đóng menu" : "Mở menu"}>{menuOpen ? <X/> : <MenuIcon/>}</button></div>
      </div></header>
      {menuOpen && <nav className="mobile-drawer open"><a href="#play" onClick={() => setMenuOpen(false)}>Khu vui chơi</a><a href="#spa-nail-pricing" onClick={() => setMenuOpen(false)}>Spa & Nail</a><a href="#menu" onClick={() => setMenuOpen(false)}>Thực đơn</a><a href="#contact" onClick={() => setMenuOpen(false)}>Liên hệ</a><button className="btn btn-green" onClick={() => { setMenuOpen(false); openBooking("play"); }}>Gửi yêu cầu</button></nav>}
      <main id="main">
        <section className="hero" id="home"><div className="container hero-grid"><div className="hero-message"><h1>Bé vui chơi.<br/>Mẹ thư giãn.</h1><p className="hero-copy">Một điểm đến cho bé khám phá và mẹ dành thời gian chăm sóc bản thân.</p><div className="hero-actions"><a className="btn btn-green" href="#pricing">Xem giá vé vui chơi <ArrowUpRight size={17}/></a><a className="btn btn-outline" href="#spa-nail-pricing">Khám phá Spa & Nail</a></div><a className="hero-ticket-card" href="#pricing"><span>Vé khu vui chơi</span><strong>Chọn thời lượng phù hợp</strong><ArrowUpRight size={17}/></a></div>
          <div className="hero-collage" aria-label="Không gian vui chơi và chăm sóc thư giãn"><figure className="photo-card photo-play"><Image src="https://images.pexels.com/photos/19230078/pexels-photo-19230078.jpeg" alt="Trẻ vui chơi trong khu bóng nhiều màu; ảnh của Matheus Bertelli trên Pexels" width={1200} height={1500} sizes="(max-width: 800px) 68vw, 34vw" unoptimized priority/></figure><figure className="photo-card photo-family"><Image src="https://images.pexels.com/photos/8612958/pexels-photo-8612958.jpeg" alt="Hai trẻ nhỏ chơi đùa cùng nhau; ảnh của Yan Krukau trên Pexels" width={1200} height={800} sizes="(max-width: 800px) 56vw, 29vw" unoptimized priority/></figure><figure className="photo-card photo-spa"><Image src="https://images.pexels.com/photos/35495081/pexels-photo-35495081.jpeg" alt="Không gian spa ấm áp; ảnh của Burak Eroglu trên Pexels" width={1200} height={800} sizes="(max-width: 800px) 56vw, 29vw" unoptimized/></figure><div className="collage-mascot"><Image src="/assets/bvmk-mascot.png" alt="Linh vật BÉ VUI MẸ KHOẺ" width={134} height={192}/></div><span className="collage-flower" aria-hidden="true"><Flower2 size={30}/></span></div>
        </div></section>
        <nav className="trust-strip" aria-label="Đi nhanh đến dịch vụ"><div className="container trust-grid"><a className="trust-item" href="#pricing"><span className="trust-icon"><Baby size={20}/></span><span><b>Khu vui chơi</b><small>Xem giá vé</small></span></a><a className="trust-item" href="#spa-nail-pricing"><span className="trust-icon"><Heart size={20}/></span><span><b>Spa & Nail</b><small>Dịch vụ cho mẹ</small></span></a><a className="trust-item" href="#menu"><span className="trust-icon"><Flower2 size={20}/></span><span><b>Thực đơn</b><small>Món ăn và thức uống</small></span></a></div></nav>
        <section className="section" id="about"><div className="container"><div className="section-head"><div><h2>Bé có chỗ vui chơi,<br/>mẹ có giờ thư giãn.</h2></div><p>Chọn điều gia đình mình đang tìm hiểu.</p></div><div className="service-grid"><article className="service-card spa" id="spa"><div className="service-top"><h3>Spa dành cho mẹ</h3><p>Các dịch vụ chăm sóc, thư giãn và làm đẹp. Xem thời lượng cùng mức giá tham khảo.</p><a className="btn btn-pink" href="#spa-nail-pricing">Xem bảng giá Spa <ArrowUpRight size={16}/></a></div><div className="service-art"><span className="service-symbol">✿</span></div></article><article className="service-card kids" id="play"><div className="service-top"><h3>Khu vui chơi cho bé</h3><p>Chọn thời lượng vui chơi phù hợp với kế hoạch của gia đình.</p><a className="btn btn-green" href="#pricing">Xem giá vé <ArrowUpRight size={16}/></a></div><div className="service-art"><Image src="/assets/bvmk-mascot.png" alt="Linh vật BÉ VUI MẸ KHOẺ" width={134} height={192}/></div></article></div></div></section>
        <section className="section pricing-section" id="pricing"><div className="container pricing-wrap"><div className="pricing-copy"><span className="kicker">Vé khu vui chơi</span><h2>Bảng giá vé<br/>khu vui chơi.</h2><p>Chọn thời lượng dựa trên kế hoạch của gia đình. Giá hiển thị được chép từ ảnh bảng giá và đang chờ cơ sở xác nhận.</p><div className="price-toggle" aria-label="Chọn ngày áp dụng giá"><button type="button" aria-pressed={priceDay === "weekday"} className={priceDay === "weekday" ? "active" : ""} onClick={() => setPriceDay("weekday")}>Ngày thường</button><button type="button" aria-pressed={priceDay === "weekend"} className={priceDay === "weekend" ? "active" : ""} onClick={() => setPriceDay("weekend")}>Thứ 7 – Chủ nhật</button></div><button className="btn btn-green" onClick={() => openBooking("play")}>Đặt vé vui chơi <ArrowUpRight size={16}/></button></div><div className="pricing-card"><div className="ticket-grid" aria-live="polite">{tickets.map((ticket) => {
              const livePrice = ticketQuery.data?.find((item) => item.ticket_code === ticket.code && item.day_type === (priceDay === "weekday" ? "WEEKDAY" : "WEEKEND"))?.price;
              return <article className="ticket-tile" key={ticket.code}><span className="ticket-duration">{ticket.duration}</span><strong className="ticket-price">{money(livePrice ?? ticket[priceDay])}</strong><span className="confirm-chip">Cần xác nhận</span><p>{ticket.note}</p></article>;
            })}</div><div className="price-month"><div><small>VÉ THÁNG · 08:00 – 17:00</small><b>Vui chơi theo tháng</b></div><strong>{money(ticketQuery.data?.find((item) => item.ticket_code === "PLAY_MONTH_8_17" && item.day_type === "ALL")?.price ?? 4_000_000)}<small>Cần xác nhận</small></strong></div><p className="price-note"><b>Cần cơ sở xác nhận:</b> toàn bộ giá vé và điều kiện áp dụng được chép từ ảnh bảng giá do khách hàng cung cấp. Hãy xác nhận trước khi thanh toán.{ticketQuery.isError ? " Hiện đang hiển thị giá tham khảo do chưa kết nối được danh mục trực tuyến." : ""}</p></div></div></section>
        <section className="section spa-nail-section" id="spa-nail-pricing">
          <div className="container">
            <div className="service-pricing-heading"><div><span className="kicker">Chăm sóc dành cho mẹ</span><h2>Bảng giá Spa & Nail</h2></div><p>Chọn nhóm dịch vụ để xem thời lượng và giá tham khảo.</p></div>
            <div className="service-price-tabs" role="tablist" aria-label="Chọn nhóm dịch vụ">
              <button id="spa-prices-tab" type="button" role="tab" aria-selected={serviceTab === "spa"} aria-controls="service-prices-panel" className={serviceTab === "spa" ? "active spa-tab" : "spa-tab"} onClick={() => setServiceTab("spa")}><span>Spa</span><small>{spaPriceCount} dịch vụ</small></button>
              <button id="nail-prices-tab" type="button" role="tab" aria-selected={serviceTab === "nail"} aria-controls="service-prices-panel" className={serviceTab === "nail" ? "active nail-tab" : "nail-tab"} onClick={() => setServiceTab("nail")}><span>Nail</span><small>{nailPriceCount} dịch vụ</small></button>
            </div>
            <p className="service-price-notice"><b>Cần xác nhận:</b> giá được chép từ ảnh menu bạn gửi; vui lòng xác nhận với cơ sở trước khi sử dụng. Một số ghi chú nhỏ trên ảnh chưa đọc rõ.</p>
            <div id="service-prices-panel" className="service-price-grid" role="tabpanel" aria-labelledby={serviceTab === "spa" ? "spa-prices-tab" : "nail-prices-tab"}>
              {servicePriceGroups.map((group) => <article className="service-price-group" key={group.label}><div className="service-price-group-heading"><h3>{group.label}</h3><span>{group.items.length} mục</span></div><ul>{group.items.map((item) => <li className="service-price-row" key={item.name}><div className="service-price-description"><span className="service-price-name">{item.name}</span>{item.duration && <small>{item.duration}</small>}{item.confirmationNote && <small className="service-price-source-note">{item.confirmationNote}</small>}</div><div className="service-price-value"><b>{formatServicePrice(item.price)}</b><small>Cần xác nhận</small></div></li>)}</ul></article>)}
            </div>
            <div className="service-pricing-actions"><button className="btn btn-pink" onClick={() => openBooking("spa")}>Tư vấn Spa <ArrowUpRight size={16}/></button><button className="btn btn-green" onClick={() => openBooking("nail")}>Tư vấn Nail <ArrowUpRight size={16}/></button></div>
          </div>
        </section>
        <section className="section spa-section" id="spa-detail"><div className="container spa-panel"><div className="spa-visual"><Image src="https://images.pexels.com/photos/35495081/pexels-photo-35495081.jpeg" alt="Không gian spa với ánh sáng ấm; ảnh của Burak Eroglu trên Pexels" width={1200} height={1500} sizes="(max-width: 900px) 90vw, 42vw" unoptimized/></div><div className="spa-copy"><h2>Một khoảng nghỉ<br/>dành cho mẹ.</h2><p>Xem các liệu trình Spa và dịch vụ Nail, chọn điều phù hợp rồi gửi yêu cầu tư vấn.</p><div className="spa-detail-actions"><a className="btn btn-pink" href="#spa-nail-pricing">Xem bảng giá <ArrowUpRight size={16}/></a><button className="btn btn-outline" onClick={() => openBooking("spa")}>Gửi yêu cầu tư vấn</button></div></div></div></section>
        <section className="section menu-section" id="menu"><div className="container menu-layout"><div className="menu-intro-panel"><h2>Thực đơn<br/>cho cả nhà.</h2><p className="menu-intro">Chọn nhóm món để xem tên, giá tham khảo và tình trạng cần xác nhận.</p><span className="menu-count"><Flower2 size={18}/> Món ăn · thức uống</span></div><div className="menu-card"><div className="menu-card-heading"><b>Chọn theo nhóm</b><span>Giá cần xác nhận</span></div><div className="menu-tabs"><button aria-pressed={menuCategory === "all"} className={menuCategory === "all" ? "active" : ""} onClick={() => setMenuCategory("all")}>Tất cả</button><button aria-pressed={menuCategory === "food"} className={menuCategory === "food" ? "active" : ""} onClick={() => setMenuCategory("food")}>Món ăn</button><button aria-pressed={menuCategory === "snack"} className={menuCategory === "snack" ? "active" : ""} onClick={() => setMenuCategory("snack")}>Ăn nhẹ</button><button aria-pressed={menuCategory === "juice"} className={menuCategory === "juice" ? "active" : ""} onClick={() => setMenuCategory("juice")}>Nước ép</button><button aria-pressed={menuCategory === "drink"} className={menuCategory === "drink" ? "active" : ""} onClick={() => setMenuCategory("drink")}>Nước uống</button><button aria-pressed={menuCategory === "other"} className={menuCategory === "other" ? "active" : ""} onClick={() => setMenuCategory("other")}>Món khác</button></div><div className="menu-list" aria-live="polite">{filteredMenu.map((item) => <div className="menu-row" key={item.name}><span>{item.name}</span><div className="menu-price"><b>{money(item.price)}</b><small>Cần xác nhận</small></div></div>)}</div><p className="menu-foot"><b>Cần cơ sở xác nhận:</b> danh sách và toàn bộ giá được chép từ ảnh menu do khách hàng cung cấp. Mức giá thực tế có thể thay đổi.</p></div></div></section>
        <section className="section" id="contact"><div className="container"><div className="visit-card"><div><span className="kicker">Hẹn gặp gia đình mình</span><h2>Một ngày thật vui<br/>bắt đầu từ đây.</h2><p>Liên hệ với BÉ VUI MẸ KHOẺ để tìm hiểu thông tin dịch vụ, bảng giá và cách đặt lịch phù hợp.</p><button className="btn btn-green" onClick={() => openBooking("play")}>Gửi yêu cầu đặt dịch vụ <ArrowUpRight size={16}/></button></div><Image className="visit-logo" src="/assets/bvmk-logo.png" alt="BÉ VUI MẸ KHOẺ" width={440} height={87}/></div></div></section>
        <section className="section faq-section" style={{ paddingTop: 0 }}><div className="container faq-grid"><div><h2>Thông tin bố mẹ<br/>cần biết.</h2></div><div className="faq-list"><article><h3>Giá vé khu vui chơi được tính như thế nào?</h3><p>Giá tham khảo chia theo thời lượng, với mức riêng cho ngày thường và Thứ 7 – Chủ nhật. Vui lòng xác nhận với cơ sở trước khi sử dụng.</p></article><article><h3>Có thể gửi yêu cầu tư vấn Spa trước không?</h3><p>Có. Biểu mẫu trên website là bản xem trước; yêu cầu chưa được gửi đến cơ sở.</p></article><article><h3>Có thể xem thực đơn trước khi đến không?</h3><p>Có. Mở mục Thực đơn để lọc theo món ăn, ăn nhẹ, nước ép hoặc nước uống.</p></article><article><h3>Thông tin về độ tuổi và quy định vui chơi xem ở đâu?</h3><p>Thông tin này sẽ được cập nhật khi cơ sở xác nhận.</p></article></div></div></section>
      </main>
      <footer className="footer"><div className="container"><div className="footer-grid"><div><Image className="footer-logo" src="/assets/bvmk-logo.png" alt="BÉ VUI MẸ KHOẺ" width={440} height={87}/><p>Nơi bé vui chơi – Nơi mẹ thư giãn.<br/>Một không gian thân thiện dành cho gia đình.</p></div><div><h4>Khám phá</h4><div className="footer-links"><a href="#spa-nail-pricing">Spa & Nail</a><a href="#play">Khu vui chơi</a><a href="#pricing">Bảng giá vé</a><a href="#menu">Thực đơn</a></div></div><div><h4>Thông tin</h4><div className="footer-links"><a href="#about">Về chúng tôi</a><a href="#contact">Liên hệ</a><a href="/privacy">Chính sách riêng tư</a><a href="/terms">Điều khoản sử dụng</a></div></div></div><div className="footer-bottom"><span>© 2026 BÉ VUI MẸ KHOẺ. All rights reserved.</span><span>Yêu thương · Tích cực · An toàn · Thân thiện</span></div></div></footer>
      <BookingModal key={bookingType ?? "closed"} type={bookingType} onClose={closeBooking}/>
    </>
  );
}
