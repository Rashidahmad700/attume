import type { Metadata } from 'next';
import { HeroCarousel, type HeroSlide } from '@/components/home/HeroCarousel';
import { InstagramFeed } from '@/components/home/InstagramFeed';
import { Marquee } from '@/components/home/Marquee';
import { NewArrivals } from '@/components/home/NewArrivals';
import { OurStory } from '@/components/home/OurStory';

/** The homepage's own canonical — the root layout deliberately sets none,
 *  because one there would claim every page is this one. */
export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

/**
 * Banner artwork, in order. Each carries its own headline and button, so the
 * slide is a single link to whatever it is advertising.
 */
const heroSlides: HeroSlide[] = [
  {
    src: '/banners/two-fragrances.jpg',
    // The frame takes its aspect ratio from these, so they have to be the
    // artwork's real size — this banner is not the 1536x768 the others are.
    width: 1783,
    height: 882,
    alt: 'atolis and Santalyn bottles side by side. Two fragrances. One feeling — fresh or woody, bold or soft.',
    href: '/shop',
    label: 'Explore the collection',
  },
  {
    src: '/banners/atolis.jpg',
    width: 1536,
    height: 768,
    alt: 'atolis — fresh, green, uplifting. A burst of citrus, aquatic notes and earthy greens, for the days you want to feel alive.',
    href: '/products/atolis',
    label: 'Discover atolis',
  },
  {
    src: '/banners/santalyn.jpg',
    width: 1536,
    height: 768,
    alt: 'Santalyn — warm, smooth, grounding. Sandalwood at the heart, wrapped in tea, jasmine and soft woods.',
    href: '/products/santalyn',
    label: 'Discover Santalyn',
  },
];

export default function HomePage() {
  return (
    <>
      <HeroCarousel slides={heroSlides} />
      <Marquee />
      <NewArrivals />
      <OurStory />
      <InstagramFeed />
    </>
  );
}
