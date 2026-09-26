import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Jost } from 'next/font/google';
import { Footer } from '@/components/layout/Footer';
import { AddedToBagBurst } from '@/components/cart/AddedToBagBurst';
import { FlyToCart } from '@/components/cart/FlyToCart';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Header } from '@/components/layout/Header';
import { Overlays } from '@/components/layout/Overlays';
import { OrganizationSchema, WebsiteSchema } from '@/components/seo/StructuredData';
import { Providers } from '@/components/providers';
import { WhatsappButton } from '@/components/WhatsappButton';
import { site } from '@/lib/site';
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
  // Canonical home of the site. Link previews, sitemaps and Open Graph URLs
  // are all resolved against this, so it has to be a domain we actually own.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://houseofattume.com'),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  // Canonicals are per route, set in each page's own metadata. A single one
  // here would apply to every page and tell a crawler they are all the
  // homepage, which is worse than having none at all.
  openGraph: {
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    type: 'website',
    locale: 'en_IN',
    url: '/',
    siteName: site.name,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
};

export const viewport: Viewport = {
  themeColor: '#171613',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="flex min-h-screen flex-col antialiased">
        <OrganizationSchema />
        <WebsiteSchema />
        <Providers>
          <AnnouncementBar />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <Overlays />
          <AddedToBagBurst />
          <FlyToCart />
          <WhatsappButton />
        </Providers>
      </body>
    </html>
  );
}
