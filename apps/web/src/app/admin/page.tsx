import Image from "next/image";
import { Activity, CalendarDays, CircleDollarSign, Users, Ticket, Utensils, Settings, ShieldCheck } from "lucide-react";

const bookings = [
  { code: "BVMK-DEMO-001", type: "Vé vui chơi · 2 giờ", customer: "Khách mẫu A", time: "09:00 hôm nay", status: "Chờ xác nhận" },
  { code: "BVMK-DEMO-002", type: "Lịch Spa · Chưa cấu hình", customer: "Khách mẫu B", time: "10:30 hôm nay", status: "Chưa có dữ liệu" },
  { code: "BVMK-DEMO-003", type: "Vé vui chơi · 4 giờ", customer: "Khách mẫu C", time: "14:00 hôm nay", status: "Bản minh họa" },
];

export default function AdminDashboardPage() {
  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <a href="/"><Image src="/assets/bvmk-logo.png" alt="BÉ VUI MẸ KHOẺ" width={440} height={87}/></a>
        <div className="admin-nav">
          <a className="active" href="#overview"><Activity size={16} style={{ verticalAlign: "middle", marginRight: 9 }}/> Tổng quan</a>
          <a href="#bookings"><CalendarDays size={16} style={{ verticalAlign: "middle", marginRight: 9 }}/> Lịch đặt</a>
          <a href="#customers"><Users size={16} style={{ verticalAlign: "middle", marginRight: 9 }}/> Khách hàng</a>
          <a href="#tickets"><Ticket size={16} style={{ verticalAlign: "middle", marginRight: 9 }}/> Vé & sức chứa</a>
          <a href="#menu"><Utensils size={16} style={{ verticalAlign: "middle", marginRight: 9 }}/> Thực đơn</a>
          <a href="#settings"><Settings size={16} style={{ verticalAlign: "middle", marginRight: 9 }}/> Cấu hình</a>
        </div>
      </aside>
      <main className="admin-main" id="overview">
        <div className="admin-top"><div><div className="kicker">Quản trị nội bộ</div><h1 style={{ fontSize: 32, margin: "8px 0" }}>Tổng quan vận hành</h1><p style={{ color: "#7a7f74", margin: 0 }}>Bảng điều khiển minh họa cho cơ sở chính.</p></div><span className="status-pill"><ShieldCheck size={14} style={{ marginRight: 6 }}/> DEMO MODE</span></div>
        <div className="admin-kpis">
          <div className="admin-kpi"><small>Lịch đặt hôm nay</small><strong>—</strong><small>Chờ kết nối dữ liệu thật</small></div>
          <div className="admin-kpi"><small>Lượt vui chơi</small><strong>—</strong><small>Chờ kết nối check-in</small></div>
          <div className="admin-kpi"><small>Doanh thu</small><strong>—</strong><small>Chưa kết nối thanh toán</small></div>
          <div className="admin-kpi"><small>Khách hàng</small><strong>—</strong><small>Chưa có dữ liệu thật</small></div>
        </div>
        <section className="admin-panel" id="bookings"><div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 15 }}><h2 style={{ margin: 0, fontSize: 19 }}>Lịch đặt gần đây</h2><span style={{ color: "#858980", fontSize: 12 }}>Dữ liệu mẫu giao diện</span></div><div style={{ overflowX: "auto" }}><table className="admin-table"><thead><tr><th>Mã đặt</th><th>Dịch vụ</th><th>Khách hàng</th><th>Thời gian</th><th>Trạng thái</th></tr></thead><tbody>{bookings.map((item) => <tr key={item.code}><td><b>{item.code}</b></td><td>{item.type}</td><td>{item.customer}</td><td>{item.time}</td><td><span className="status-pill">{item.status}</span></td></tr>)}</tbody></table></div><div className="admin-note">Đây là giao diện quản trị mẫu để chốt trải nghiệm. Không có đơn thật, dữ liệu khách thật hoặc thao tác quản lý thực tế ở phiên bản này. Khi Backend và xác thực được kết nối, số liệu sẽ lấy từ API có phân quyền theo chi nhánh.</div></section>
        <div className="admin-kpis" style={{ marginTop: 18 }}>
          <div className="admin-kpi" id="customers"><Users color="#7AAF3E"/><strong>Khách hàng</strong><small>Quản lý hồ sơ phụ huynh và trẻ em</small></div>
          <div className="admin-kpi" id="tickets"><Ticket color="#EB688A"/><strong>Vé & sức chứa</strong><small>Quản lý giá vé và khung giờ</small></div>
          <div className="admin-kpi" id="menu"><Utensils color="#b38b28"/><strong>Thực đơn</strong><small>Quản lý món ăn và đồ uống</small></div>
          <div className="admin-kpi" id="settings"><CircleDollarSign color="#68696B"/><strong>Doanh thu</strong><small>Đối soát và báo cáo giao dịch</small></div>
        </div>
        <p style={{ color: "#8b9086", fontSize: 12, marginTop: 26 }}>BÉ VUI MẸ KHOẺ · Admin UI baseline v1.0</p>
      </main>
    </div>
  );
}
