// import type { Metadata } from "next";
// import "./globals.css";

// export const metadata: Metadata = {
//   title: "Монголын Түүхэн Атлас",
//   description: "1162-1300 оны Монгол ба Төв Азийн түүхэн хил, polygon editor, Neon/PostGIS atlas",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="mn" className="h-full antialiased">
//       <body className="min-h-full flex flex-col">{children}</body>
//     </html>
//   );
// }



import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Cinzel, Cinzel_Decorative } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  weight: ["400", "600", "700"],
});

const cinzelDecorative = Cinzel_Decorative({
  subsets: ["latin"],
  variable: "--font-cinzel-decorative",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Монгол Атлас · 1162–1300",
  description: "Монгол болон Төв Азийн дундад зууны түүхэн хил, улс орнуудын атлас.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="mn" className={`${cinzel.variable} ${cinzelDecorative.variable}`}>
        <body className="antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}