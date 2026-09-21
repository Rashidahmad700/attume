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
    <section className="mx-auto mb-10 max-w-xl overflow-hidden rounded-3xl bg-olive p-3 sm:p-4">
      <div className="rounded-2xl bg-bronze/70 px-4 pt-4 pb-6 sm:px-6 sm:pt-5 sm:pb-7">
        {hero && (
          <div className="overflow-hidden rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={hero}
              alt=""
              className="h-40 w-full object-cover object-center sm:h-44"
            />
          </div>
        )}

        {/*
          The script sits over the serif's baseline rather than below it, which
          is what makes the pairing look drawn instead of stacked. -mt pulls it
          up; the serif keeps its own line-height so nothing clips at 360px.
        */}
        <div className={hero ? 'mt-5 text-center' : 'text-center'}>
          <h1 className="font-serif text-3xl leading-[0.95] font-medium tracking-[0.04em] text-white uppercase sm:text-4xl">
            Thank you
          </h1>
          <p className="-mt-2.5 font-script text-2xl leading-tight text-olive sm:-mt-3 sm:text-3xl">
            for your order
          </p>
          <p className="mt-3 text-[10px] tracking-[0.28em] text-ink uppercase">
            {domain}
          </p>
        </div>
      </div>

      <p className="px-3 pt-4 pb-1 text-center text-xs leading-relaxed text-ivory/85">
        We are preparing <span className="text-ivory">{order.orderNumber}</span> for dispatch.
        {order.paymentMethod === 'cod' ? ' Keep the exact amount ready for the courier.' : ''}{' '}
        You can follow its progress on this page at any time.
      </p>
    </section>
  );
}
