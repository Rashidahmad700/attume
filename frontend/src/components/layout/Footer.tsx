import Link from 'next/link';
import { footerNav, site } from '@/lib/site';
import { InstagramIcon, WhatsappIcon } from '@/components/ui/icons';

const columns = [
  { title: 'Categories', links: footerNav.categories },
  { title: 'Quick Links', links: footerNav.quickLinks },
  { title: 'Policies', links: footerNav.policies },
];

export function Footer() {
  return (
    <footer className="bg-ink text-ivory">
      <div className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_2fr]">
          {/* Brand statement */}
          <div className="flex flex-col gap-6">
            <span className="font-serif text-4xl font-bold lowercase tracking-[0.05em]">
              {site.name}
            </span>
            <p className="max-w-md text-sm leading-relaxed text-ivory/65">{site.description}</p>
            <div className="flex items-center gap-5 pt-2">
              <a
                href={site.instagramUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="attume on Instagram"
                className="text-ivory/70 transition-colors hover:text-ivory"
              >
                <InstagramIcon className="h-5 w-5" />
              </a>
              <a
                href={`https://wa.me/${site.phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                aria-label="attume on WhatsApp"
                className="text-ivory/70 transition-colors hover:text-ivory"
              >
                <WhatsappIcon className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Link columns. Three now the newsletter is gone, so they spread
              rather than leaving a gap where the fourth used to be. */}
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {columns.map((column) => (
              <nav key={column.title} aria-label={column.title} className="flex flex-col gap-4">
                <h3 className="eyebrow text-bronze">{column.title}</h3>
                <ul className="flex flex-col gap-3">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="link-underline text-sm text-ivory/70 transition-colors hover:text-ivory"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-ivory/12 pt-8 text-xs text-ivory/45 lg:flex-row lg:items-center lg:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. Proudly made in India.
          </p>
          <p className="max-w-xl">{site.address}</p>
          <a href={`mailto:${site.email}`} className="link-underline hover:text-ivory">
            {site.email}
          </a>
        </div>
      </div>
    </footer>
  );
}
