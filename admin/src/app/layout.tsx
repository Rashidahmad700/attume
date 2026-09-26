import type { Metadata } from 'next';
import { Cormorant_Garamond, Jost } from 'next/font/google';
import { StoreProvider } from '@/components/StoreProvider';
import './globals.css';

// Both faces are variable fonts: one file carries every weight, so none are
// listed. Listing them served that same file under one @font-face per weight.
const display = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const body = Jost({
  subsets: ['latin'],
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
      </body>
    </html>
  );
}
