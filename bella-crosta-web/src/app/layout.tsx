import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bella Crosta | Authentic Artisanal Pizza",
  description: "Authentic wood-fired Neapolitan pizza made with fresh ingredients and local craftsmanship.",
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
