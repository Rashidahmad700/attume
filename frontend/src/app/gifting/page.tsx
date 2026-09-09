import type { Metadata } from 'next';
import { ComingSoon } from '@/components/ComingSoon';

export const metadata: Metadata = {
  title: 'Gifting',
  description: 'attume fragrances boxed for gifting — coming soon.',
};

export default function GiftingPage() {
  return (
    <ComingSoon
      eyebrow="Gifting"
      title="Wrapped properly, with a note in your words"
      description="Fragrance is one of the few gifts people actually keep using. We are putting together boxes worth handing over — ribboned, with a hand-written card and no price anywhere on the parcel."
      points={[
        { heading: 'Hand-written note', body: 'Your message, written on the card, not printed.' },
        { heading: 'No prices inside', body: 'Invoices go to you by email, never in the box.' },
        { heading: 'Ships direct', body: 'Send it straight to them, on a date you choose.' },
        { heading: 'Pairs and sets', body: 'One bottle, both, or a bottle with the discovery set.' },
      ]}
    />
  );
}
