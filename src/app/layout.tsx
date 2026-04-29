import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './global.css';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: 'Монгол Атлас · 1162–1300',
  description:
    'Монгол болон Төв Азийн дундад зууны түүхэн хил, улс орнуудын атлас.',
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
        className={inter.variable}
      >
        <body className="antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}
