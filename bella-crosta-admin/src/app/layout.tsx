import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bella Crosta | Admin Dashboard",
  description: "Manage orders, menu items, and store settings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased linen-texture min-h-screen text-on-surface bg-surface">
        {children}
      </body>
    </html>
  );
}
