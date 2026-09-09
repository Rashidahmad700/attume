import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { InstagramIcon, WhatsappIcon } from '@/components/ui/icons';
import { ContactForm } from '@/components/contact/ContactForm';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Reach the attume studio about an order, a fragrance, or anything else.',
};

export default function ContactPage() {
  return (
    <Container className="py-14 lg:py-20">
      <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
        <div className="flex flex-col gap-8">
          <div>
            <span className="eyebrow text-bronze">Contact</span>
            <h1 className="mt-4 font-serif text-4xl font-light text-ink lg:text-5xl">
              Talk to the studio
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-muted">
              Questions about an order, a fragrance, or which one suits you — we answer everything
              ourselves, usually within a working day.
            </p>
          </div>

          <dl className="flex flex-col gap-6 border-t border-line pt-8">
            <div>
              <dt className="eyebrow text-ink-muted">Email</dt>
              <dd className="mt-2">
                <a href={`mailto:${site.email}`} className="link-underline text-sm text-ink">
                  {site.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="eyebrow text-ink-muted">Phone</dt>
              <dd className="mt-2">
                <a href={`tel:${site.phone.replace(/\s/g, '')}`} className="link-underline text-sm text-ink">
                  {site.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="eyebrow text-ink-muted">Studio</dt>
              <dd className="mt-2 text-sm leading-relaxed text-ink">{site.address}</dd>
            </div>
          </dl>

          <div className="flex flex-wrap gap-4">
            <a
              href={`https://wa.me/${site.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-xl border border-line px-5 py-3 text-[11px] font-semibold tracking-[0.14em] text-ink uppercase transition-colors hover:border-olive hover:bg-olive hover:text-ivory"
            >
              <WhatsappIcon className="h-4 w-4" />
              WhatsApp
            </a>
            <a
              href={site.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-xl border border-line px-5 py-3 text-[11px] font-semibold tracking-[0.14em] text-ink uppercase transition-colors hover:border-olive hover:bg-olive hover:text-ivory"
            >
              <InstagramIcon className="h-4 w-4" />
              @{site.instagramHandle}
            </a>
          </div>
        </div>

        <ContactForm />
      </div>
    </Container>
  );
}
