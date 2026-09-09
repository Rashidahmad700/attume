import { BrandStatement } from '@/components/home/BrandStatement';
import { Hero } from '@/components/home/Hero';
import { InstagramFeed } from '@/components/home/InstagramFeed';
import { Marquee } from '@/components/home/Marquee';
import { NewArrivals } from '@/components/home/NewArrivals';
import { ShopByCollection } from '@/components/home/ShopByCollection';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Marquee />
      <ShopByCollection />
      <NewArrivals />
      <BrandStatement />
      <InstagramFeed />
    </>
  );
}
