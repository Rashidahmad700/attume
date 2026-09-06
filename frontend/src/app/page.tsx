import { BrandStatement } from '@/components/home/BrandStatement';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { Hero } from '@/components/home/Hero';
import { InstagramFeed } from '@/components/home/InstagramFeed';
import { Marquee } from '@/components/home/Marquee';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Marquee />
      <FeaturedProducts />
      <BrandStatement />
      <InstagramFeed />
    </>
  );
}
