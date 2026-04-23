import { ClerkProvider } from '@clerk/nextjs';
import './global.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
<<<<<<< HEAD
    <html
      lang="en"
      className={`light ${geistSans.variable} ${geistMono.variable} ${cinzel.variable} ${cinzelDecorative.variable} h-full antialiased`}
    >
      <body className="flex flex-col min-h-full">{children}</body>
=======
    <html lang="en">
      <body>
        <ClerkProvider>{children}</ClerkProvider>
      </body>
>>>>>>> 851760007639138b44e613779fcba54fae0bb692
    </html>
  );
}
