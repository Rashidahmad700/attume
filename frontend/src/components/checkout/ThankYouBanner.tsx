import { scriptFont } from '@/lib/scriptFont';
import { siteUrl } from '@/lib/site';
import type { Order } from '@/types';

/**
 * The card that opens the order page immediately after checkout.
 *
 * Type carries it, not a photograph. The product shots are square and crop to
 * a meaningless band in a frame this wide, and the hero banners already have
 * their own headlines baked into the artwork — either would fight this one.
 *
 * Deliberately the loudest thing in the application: olive ground, a khaki
 * card, and the two faces used together — the serif shouting, the script
 * answering across its baseline. Everywhere else the palette stays quiet,
 * which is what lets this read as an occasion.
 */
export function ThankYouBanner({ order }: { order: Order }) {
  const domain = siteUrl.replace(/^https?:\/\//, '');

  return (
    <section className={`mb-10 overflow-hidden rounded-3xl bg-olive p-3 sm:p-4 lg:p-5 ${scriptFont.variable}`}>
      <div className="rounded-2xl bg-bronze/70 px-5 py-10 text-center sm:py-14 lg:py-16">
        {/*
          The script crosses the serif's baseline rather than sitting under it,
          which is what makes the pair look drawn instead of stacked. The serif
          keeps its own line-height so the descenders never clip at 360.
        */}
        <h1 className="font-serif text-[2.75rem] leading-[0.92] font-medium tracking-[0.03em] text-white uppercase sm:text-7xl lg:text-8xl">
          Thank you
        </h1>
        <p className="-mt-3 font-script text-3xl leading-tight text-olive sm:-mt-6 sm:text-5xl lg:-mt-8 lg:text-6xl">
          for your order
        </p>

        <div className="mt-7 flex items-center justify-center gap-4 sm:mt-9">
          <span aria-hidden="true" className="h-px w-8 bg-ink/25 sm:w-14" />
          <span className="text-[10px] tracking-[0.3em] text-ink uppercase sm:text-xs">
            {domain}
          </span>
          <span aria-hidden="true" className="h-px w-8 bg-ink/25 sm:w-14" />
        </div>
      </div>

      <p className="px-4 pt-5 pb-1 text-center text-xs leading-relaxed text-ivory/85 sm:text-sm">
        We are preparing <span className="text-ivory">{order.orderNumber}</span> for dispatch.

        You can follow its progress on this page at any time.
      </p>
    </section>
  );
}
