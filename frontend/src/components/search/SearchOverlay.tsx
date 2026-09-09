'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { CloseIcon, SearchIcon } from '@/components/ui/icons';
import { ProductImage } from '@/components/product/ProductImage';
import { Stars } from '@/components/product/Stars';
import { formatPrice } from '@/lib/products';
import { useGetSearchFacetsQuery, useSearchProductsQuery } from '@/store/api/catalogueApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSearchOpen } from '@/store/slices/uiSlice';

export function SearchOverlay() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isOpen = useAppSelector((state) => state.ui.isSearchOpen);

  const [term, setTerm] = useState('');
  const [debounced, setDebounced] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Keystrokes should not fire a request each; wait for a pause.
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(term.trim()), 220);
    return () => clearTimeout(timer);
  }, [term]);

  const { data: facetData } = useGetSearchFacetsQuery(undefined, { skip: !isOpen });
  const { data, isFetching } = useSearchProductsQuery(debounced, { skip: !isOpen });

  const facets = facetData?.data;
  const results = data?.data.products ?? [];
  const total = data?.data.total ?? 0;

  const close = () => dispatch(setSearchOpen(false));

  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!term.trim()) return;
    close();
    router.push(`/shop?q=${encodeURIComponent(term.trim())}`);
  };

  const chip = (value: string) => (
    <button
      key={value}
      type="button"
      onClick={() => setTerm(value)}
      className="rounded-full border border-line bg-ivory px-4 py-2 text-xs text-ink-muted capitalize transition-colors hover:border-olive hover:bg-olive hover:text-ivory"
    >
      {value}
    </button>
  );

  const group = (title: string, values: string[] | undefined) =>
    values && values.length > 0 ? (
      <div>
        <h3 className="mb-3 text-sm font-semibold text-ink">{title}</h3>
        <div className="flex flex-wrap gap-2">{values.map(chip)}</div>
      </div>
    ) : null;

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto p-4 sm:p-8">
      {/* The page stays visible behind the panel — dimmed, not replaced. */}
      <div
        onClick={close}
        aria-hidden="true"
        className="fixed inset-0 bg-ink/45 backdrop-blur-[2px]"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 rounded-2xl bg-ivory-soft p-5 shadow-[0_30px_80px_-20px_rgba(23,22,19,0.55)] sm:p-8"
      >
        <div className="flex items-start gap-4">
          <form onSubmit={submit} className="flex-1">
            <div className="flex items-center gap-3 rounded-full border border-line bg-ivory px-5 py-3.5 transition-colors focus-within:border-olive">
              <input
                ref={inputRef}
                type="search"
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                placeholder="Search by typing keywords…"
                autoComplete="off"
                spellCheck={false}
                aria-label="Search fragrances"
                // The pill shows focus via focus-within. The global :focus-visible
                // rule is unlayered, so it outranks the utility unless forced.
                className="w-full bg-transparent text-sm text-ink placeholder:text-ink-muted/70 focus:outline-none focus-visible:outline-none! [&::-webkit-search-cancel-button]:hidden"
              />
              {term && (
                <button
                  type="button"
                  onClick={() => setTerm('')}
                  aria-label="Clear search"
                  className="shrink-0 text-ink-muted transition-colors hover:text-olive"
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
              )}
              <button
                type="submit"
                aria-label="Run search"
                className="shrink-0 text-ink transition-colors hover:text-olive"
              >
                <SearchIcon className="h-5 w-5" />
              </button>
            </div>
          </form>

          <button
            type="button"
            onClick={close}
            aria-label="Close search"
            className="mt-2 shrink-0 text-ink-muted transition-colors hover:text-olive"
          >
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_1.35fr]">
          <div className="flex flex-col gap-7">
            {debounced && (
              <Link
                href={`/shop?q=${encodeURIComponent(debounced)}`}
                onClick={close}
                className="link-underline self-start text-sm font-semibold text-olive"
              >
                View all {total} result{total === 1 ? '' : 's'}
              </Link>
            )}

            {group('Popular searches', facets?.accords)}
            {group('Notes', facets?.notes)}
            {group('Seasons', facets?.seasons)}
          </div>

          <div className="rounded-xl bg-ivory p-5 sm:p-6">
            <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-sm font-semibold text-ink">
                {debounced ? `Results for “${debounced}”` : 'Popular fragrances'}
              </h3>
              <span className="text-xs text-ink-muted">
                {isFetching ? 'Searching…' : `${total} product${total === 1 ? '' : 's'}`}
              </span>
            </div>

            {!isFetching && results.length === 0 ? (
              <div className="flex flex-col items-start gap-4 rounded-lg border border-dashed border-line px-5 py-10">
                <p className="text-sm text-ink-muted">
                  Nothing matches “{debounced}”. Try an accord such as citrus or woody.
                </p>
                <Link
                  href="/shop"
                  onClick={close}
                  className="rounded-full border border-ink px-6 py-2.5 text-[11px] font-semibold tracking-[0.14em] text-ink uppercase transition-colors hover:border-olive hover:bg-olive hover:text-ivory"
                >
                  Browse everything
                </Link>
              </div>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {results.map((product) => (
                  <li key={product.id}>
                    <Link
                      href={`/products/${product.slug}`}
                      onClick={close}
                      className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-ivory-soft transition-colors hover:border-olive"
                    >
                      <span className="relative block aspect-square overflow-hidden bg-ivory">
                        <ProductImage
                          product={product}
                          className="transition-transform duration-500 group-hover:scale-[1.04]"
                          labelClassName="h-[72%] w-[62%] gap-2"
                        />
                      </span>

                      <span className="flex flex-1 flex-col gap-1.5 p-4">
                        <span className="text-sm font-semibold text-ink group-hover:text-olive">
                          {product.name}
                        </span>
                        <span className="text-xs text-ink-muted">
                          {product.accords.slice(0, 3).map((accord) => accord.name).join(' · ')}
                        </span>
                        {product.rating.count > 0 && (
                          <span className="flex items-center gap-1.5">
                            <Stars value={product.rating.average} size="sm" />
                            <span className="text-[11px] text-ink-muted">
                              ({product.rating.count})
                            </span>
                          </span>
                        )}
                        <span className="mt-1 flex items-baseline gap-2">
                          <span className="text-sm font-semibold text-ink">
                            {formatPrice(product.price)}
                          </span>
                          {product.compareAtPrice && product.discountPercent > 0 && (
                            <span className="text-xs text-ink-muted line-through">
                              {formatPrice(product.compareAtPrice)}
                            </span>
                          )}
                        </span>
                        {!product.inStock && (
                          <span className="text-[10px] tracking-[0.12em] text-espresso uppercase">
                            Sold out
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
