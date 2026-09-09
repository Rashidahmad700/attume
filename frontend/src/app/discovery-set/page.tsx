import type { Metadata } from 'next';
import { ComingSoon } from '@/components/ComingSoon';

export const metadata: Metadata = {
  title: 'Discovery Set',
  description: 'Both attume fragrances in travel sizes — coming soon.',
};

export default function DiscoverySetPage() {
  return (
    <ComingSoon
      eyebrow="Discovery Set"
      title="Both fragrances, before you commit to one"
      description="A pair of travel sizes so you can wear atolis and Santalyn properly — through a full day, in your own climate — before choosing a full bottle."
      points={[
        { heading: 'Two 8 ml sprays', body: 'Enough for roughly a fortnight of daily wear each.' },
        { heading: 'Credit on your next order', body: 'The cost of the set comes off a full bottle.' },
        { heading: 'Same juice', body: 'Filled from the same batch as the 50 ml, not a diluted version.' },
        { heading: 'Boxed to gift', body: 'Arrives in the same carton stock as the full size.' },
      ]}
    />
  );
}
