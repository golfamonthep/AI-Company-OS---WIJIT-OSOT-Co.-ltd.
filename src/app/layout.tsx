import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Company OS",
  description: "ระบบปฏิบัติการบริษัทแบบ AI-native สำหรับองค์กรไทย"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
