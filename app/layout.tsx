import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Монголын Түүхэн Атлас",
  description: "1162-1300 оны Монгол ба Төв Азийн түүхэн хил, polygon editor, Neon/PostGIS atlas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mn" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
