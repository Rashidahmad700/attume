import { HeroCarousel, type HeroSlide } from '@/components/home/HeroCarousel';
import { InstagramFeed } from '@/components/home/InstagramFeed';
import { Marquee } from '@/components/home/Marquee';
import { NewArrivals } from '@/components/home/NewArrivals';
import { OurStory } from '@/components/home/OurStory';

/**
 * Banner artwork, in order. Each carries its own headline and button, so the
 * slide is a single link to whatever it is advertising.
 */
const heroSlides: HeroSlide[] = [
  {
    src: '/banners/two-fragrances.jpg',
    alt: 'atolis and Santalyn bottles side by side. Two fragrances. One feeling — fresh or woody, bold or soft.',
    href: '/shop',
    label: 'Explore the collection',
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
