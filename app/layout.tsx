import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Respondfall",
  description: "Revenue recovery network for local service businesses",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
