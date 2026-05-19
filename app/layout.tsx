import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Asset Journey - 家族の資産ダッシュボード",
  description: "月1回5分で家族の資産を管理する、人生の資産管理ダッシュボード",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;600;700&family=Noto+Serif+JP:wght@700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: "'Noto Sans JP', sans-serif", background: "#080b12", minHeight: "100vh" }}>
        {children}
      </body>
    </html>
  );
}
