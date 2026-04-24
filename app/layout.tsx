// import type { Metadata } from "next";
// import { Cinzel, Cinzel_Decorative } from "next/font/google";
// import "./globals.css";
// import { ClerkProvider } from '@clerk/nextjs';

// const cinzel = Cinzel({
//   subsets: ["latin"],
//   variable: "--font-cinzel",
//   weight: ["400", "600", "700"],
// });

// const cinzelDecorative = Cinzel_Decorative({
//   subsets: ["latin"],
//   variable: "--font-cinzel-decorative",
//   weight: ["400", "700"],
// });

// export const metadata: Metadata = {
//   title: "Монгол Атлас · 1162–1300",
//   description: "Монгол болон Төв Азийн дундад зууны түүхэн хил, улс орнуудын атлас.",
// };

// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <ClerkProvider>
//       <html lang="mn" className={`${cinzel.variable} ${cinzelDecorative.variable}`}>
//         <body className="antialiased">{children}</body>
//       </html>
//     </ClerkProvider>
//   );
// }


import type { Metadata } from "next";
import { Cinzel, Cinzel_Decorative } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
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
  description:
    "Монгол болон Төв Азийн дундад зууны түүхэн хил, улс орнуудын атлас.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html
        lang="mn"
        className={`${cinzel.variable} ${cinzelDecorative.variable}`}
      >
        <body className="antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}