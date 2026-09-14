import type { Metadata } from 'next';
import { ComingSoon } from '@/components/ComingSoon';

export const metadata: Metadata = {
  title: 'Attar',
  description: 'Traditional Indian attars from attume — coming soon.',
};

export default function AttarPage() {
  return (
    <ComingSoon
      eyebrow="Attar"
      title="The oldest way to wear a fragrance"
      description="Alcohol-free oils in the Indian tradition — worn on the pulse, warmed by the skin, and lasting far longer than a spray. We are working on our first attars now."
      points={[
        { heading: 'Alcohol free', body: 'Pure oil, so it sits close and never bites on application.' },
        { heading: 'Worn by the drop', body: 'A little at the wrist and throat is the whole application.' },
        { heading: 'Rolls on', body: 'Glass vials with a roller, made to travel in a pocket.' },
        { heading: 'Indian tradition', body: 'The method Kannauj has used for centuries, made in small batches.' },
      ]}
    />
  );
}
