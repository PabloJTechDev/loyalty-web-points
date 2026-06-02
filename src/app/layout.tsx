import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Loyalty Platform · Customer MVP',
  description: 'Primera versión multi-idioma del vertical customer para loyalty platform.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <html suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}><body>{children}</body></html>;
}
