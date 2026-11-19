import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Nunito } from "next/font/google";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["400", "500", "600", "700", "800", "900", "1000"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BÉ VUI MẸ KHOẺ | Nơi bé vui chơi – Nơi mẹ thư giãn",
  description:
    "Khám phá khu vui chơi cho bé, dịch vụ chăm sóc và thư giãn dành cho mẹ, cùng thực đơn tại BÉ VUI MẸ KHOẺ.",
  applicationName: "BÉ VUI MẸ KHOẺ",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "BÉ VUI MẸ KHOẺ",
    description: "Nơi bé vui chơi – Nơi mẹ thư giãn",
    siteName: "BÉ VUI MẸ KHOẺ",
    locale: "vi_VN",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="vi" className={nunito.variable}>
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
