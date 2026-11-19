import Image from "next/image";

export default function AccountPage() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#fff8f4" }}>
      <section style={{ width: "min(520px,100%)", background: "white", borderRadius: 24, padding: 30, boxShadow: "0 18px 55px rgba(78,69,57,.10)" }}>
        <a href="/"><Image src="/assets/bvmk-logo.png" alt="BÉ VUI MẸ KHOẺ" width={330} height={65}/></a>
        <div className="kicker" style={{ marginTop: 25 }}>Khu vực khách hàng</div>
        <h1 style={{ fontSize: 31, margin: "9px 0" }}>Tài khoản của gia đình</h1>
        <p style={{ color: "#73776e", lineHeight: 1.7 }}>Khu vực quản lý hồ sơ phụ huynh, hồ sơ trẻ em, lịch đặt Spa và vé vui chơi. Đăng nhập sẽ được kích hoạt khi hoàn thiện Identity API.</p>
        <div className="demo-alert">Hiện tại đây là màn hình định hướng, chưa có xác thực và chưa lưu thông tin tài khoản.</div>
        <a className="btn btn-green" href="/">Quay về trang chủ</a>
      </section>
    </main>
  );
}
