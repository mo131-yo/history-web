import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import type { CSSProperties, ReactNode } from 'react';
import './global.css';

const fontVariables: CSSProperties = {
  ['--font-inter' as string]: 'Inter, Arial, sans-serif',
};

export const metadata: Metadata = {
  title: 'Монгол Атлас · 1162–1300',
  description:
    'Монгол болон Төв Азийн дундад зууны түүхэн хил, улс орнуудын атлас.',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="mn" style={fontVariables}>
        <body className="antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}
