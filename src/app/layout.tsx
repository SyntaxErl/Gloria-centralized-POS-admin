import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "POS Admin",
  description: "Multi-branch restaurant POS — admin dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}