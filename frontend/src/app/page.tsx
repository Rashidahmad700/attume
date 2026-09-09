import { Commitments } from '@/components/home/Commitments';
import { Hero } from '@/components/home/Hero';
import { InstagramFeed } from '@/components/home/InstagramFeed';
import { Marquee } from '@/components/home/Marquee';
import { NewArrivals } from '@/components/home/NewArrivals';
import { ScentAttributes } from '@/components/home/ScentAttributes';
import { ShopByCollection } from '@/components/home/ShopByCollection';
import { BrandStatement } from '@/components/home/BrandStatement';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Marquee />
      <ShopByCollection />
      <NewArrivals />
      <ScentAttributes />
      <Commitments />
      <BrandStatement />
      <InstagramFeed />
    </>
  );
}
