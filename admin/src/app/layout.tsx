import type { Metadata } from 'next';
import { Cormorant_Garamond, Jost } from 'next/font/google';
import { EnvironmentRibbon } from '@/components/EnvironmentRibbon';
import { StoreProvider } from '@/components/StoreProvider';
import './globals.css';

const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-display',
  display: 'swap',
});

const body = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'attume admin', template: '%s — attume admin' },
  // Belt and braces alongside the X-Robots-Tag header in next.config.ts.
  robots: { index: false, follow: false, nocache: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-screen antialiased">
        <StoreProvider>{children}</StoreProvider>
        <EnvironmentRibbon />
      </body>
    </html>
  );
}
