import { siteUrl } from '@/lib/site';
import type { Order } from '@/types';

/**
 * The card that opens the order page immediately after checkout.
 *
 * Deliberately the loudest thing in the application: olive ground, a cream
 * card, and the two typefaces used together — the serif shouting, the script
 * answering underneath. Everywhere else the palette stays quiet, which is what
 * makes this read as an occasion.
 *
 * The photograph is whatever was actually bought rather than a stock parcel,
 * so the first thing someone sees is the bottle they chose.
 */
export function ThankYouBanner({ order }: { order: Order }) {
  const hero = order.items.find((item) => item.image)?.image;
  const domain = siteUrl.replace(/^https?:\/\//, '');

  return (
    <section className="mb-12 overflow-hidden rounded-3xl bg-olive p-4 sm:p-6 lg:p-8">
      <div className="rounded-2xl bg-bronze/70 px-5 pt-5 pb-8 sm:px-8 sm:pt-8 sm:pb-10">
        {hero && (
          <div className="overflow-hidden rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={hero}
              alt=""
              className="h-56 w-full object-cover object-center sm:h-72 lg:h-80"
            />
          </div>
        )}

        {/*
          The script sits over the serif's baseline rather than below it, which
          is what makes the pairing look drawn instead of stacked. -mt pulls it
          up; the serif keeps its own line-height so nothing clips at 360px.
        */}
        <div className={hero ? 'mt-7 text-center' : 'text-center'}>
          <h1 className="font-serif text-[2.6rem] leading-[0.95] font-medium tracking-[0.04em] text-white uppercase sm:text-6xl lg:text-7xl">
            Thank you
          </h1>
          <p className="-mt-4 font-script text-3xl leading-tight text-olive sm:-mt-6 sm:text-5xl lg:text-6xl">
            for your order
          </p>
          <p className="mt-4 text-[11px] tracking-[0.3em] text-ink uppercase sm:text-xs">
            {domain}
          </p>
        </div>
      </div>

      <p className="px-2 pt-5 text-center text-sm leading-relaxed text-ivory/85 sm:px-6">
        We are preparing <span className="text-ivory">{order.orderNumber}</span> for dispatch.
        {order.paymentMethod === 'cod' ? ' Keep the exact amount ready for the courier.' : ''}{' '}
        You can follow its progress on this page at any time.
      </p>
    </section>
  );
}
