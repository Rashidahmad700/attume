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
      className="border border-line px-3 py-1.5 text-xs text-ink-muted capitalize transition-colors hover:border-ink hover:text-ink"
    >
      {value}
    </button>
  );

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-ivory">
      <header className="flex items-center gap-4 border-b border-line px-5 py-4 sm:px-8">
        <span className="hidden font-serif text-2xl lowercase tracking-[0.06em] text-ink sm:block">
          attume
        </span>

        {/* A contained field reads as something to type in; a full-width rule
            reads as a divider. */}
        <form onSubmit={submit} className="flex flex-1 justify-center">
          <div className="flex w-full max-w-md items-center gap-3 rounded-full border border-line bg-ivory-soft px-5 py-2.5 transition-colors focus-within:border-olive">
            <SearchIcon className="h-4 w-4 shrink-0 text-ink-muted" />
            <input
              ref={inputRef}
              type="search"
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Search fragrances, notes, accords…"
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
                className="shrink-0 text-ink-muted transition-colors hover:text-ink"
              >
                <CloseIcon className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </form>

        <button
          type="button"
          onClick={close}
          className="flex shrink-0 flex-col items-center text-ink-muted transition-colors hover:text-ink"
          aria-label="Close search"
        >
          <CloseIcon className="h-5 w-5" />
          <span className="mt-0.5 hidden text-[9px] tracking-[0.12em] uppercase sm:block">esc</span>
        </button>
      </header>

      <div className="flex flex-1 flex-col overflow-y-auto lg:flex-row">
        <aside className="border-b border-line px-5 py-6 sm:px-8 lg:w-72 lg:shrink-0 lg:border-r lg:border-b-0">
          {debounced && (
            <Link
              href={`/shop?q=${encodeURIComponent(debounced)}`}
              onClick={close}
              className="link-underline eyebrow mb-6 block text-olive"
            >
              View all {total} result{total === 1 ? '' : 's'}
            </Link>
          )}

          <h2 className="eyebrow mb-4 text-ink-muted">Popular searches</h2>
          <div className="flex flex-wrap gap-2">{facets?.accords.map(chip)}</div>

          {facets?.notes.length ? (
            <>
              <h2 className="eyebrow mt-8 mb-4 text-ink-muted">Notes</h2>
              <div className="flex flex-wrap gap-2">{facets.notes.map(chip)}</div>
            </>
          ) : null}

          {facets?.seasons.length ? (
            <>
              <h2 className="eyebrow mt-8 mb-4 text-ink-muted">Seasons</h2>
              <div className="flex flex-wrap gap-2">{facets.seasons.map(chip)}</div>
            </>
          ) : null}
        </aside>

        <div className="flex-1 px-5 py-6 sm:px-8">
          <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="eyebrow text-ink">
              {debounced ? `Results for “${debounced}”` : 'The collection'}
            </h2>
            <span className="text-xs text-ink-muted">
              {isFetching ? 'Searching…' : `${total} fragrance${total === 1 ? '' : 's'}`}
            </span>
          </div>

          {!isFetching && results.length === 0 && (
            <div className="flex flex-col items-start gap-4 border border-dashed border-line px-6 py-12">
              <p className="text-sm text-ink-muted">
                Nothing matches “{debounced}”. Try an accord such as citrus or woody.
              </p>
              <Link
                href="/shop"
                onClick={close}
                className="border border-ink px-6 py-3 text-[11px] tracking-[0.16em] text-ink uppercase hover:bg-ink hover:text-ivory"
              >
                Browse everything
              </Link>
            </div>
          )}

          <ul className="grid gap-x-6 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((product) => (
              <li key={product.id}>
                <Link
                  href={`/products/${product.slug}`}
                  onClick={close}
                  className="group flex gap-4"
                >
                  <span className="block h-24 w-20 shrink-0 overflow-hidden border border-line">
                    <ProductImage product={product} labelClassName="h-[70%] w-[76%] gap-1" />
                  </span>

                  <span className="flex flex-col gap-1">
                    <span className="font-serif text-lg font-light text-ink group-hover:text-olive">
                      {product.name}
                    </span>
                    <span className="text-xs text-ink-muted">
                      {product.accords.slice(0, 3).map((accord) => accord.name).join(' · ')}
                    </span>
                    {product.rating.count > 0 && (
                      <span className="flex items-center gap-1.5">
                        <Stars value={product.rating.average} size="sm" />
                        <span className="text-[11px] text-ink-muted">({product.rating.count})</span>
                      </span>
                    )}
                    <span className="mt-1 flex items-baseline gap-2">
                      <span className="text-sm text-ink">{formatPrice(product.price)}</span>
                      {product.compareAtPrice && product.discountPercent > 0 && (
                        <span className="text-xs text-ink-muted line-through">
                          {formatPrice(product.compareAtPrice)}
                        </span>
                      )}
                      {!product.inStock && (
                        <span className="text-[10px] tracking-[0.12em] text-espresso uppercase">
                          Sold out
                        </span>
                      )}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
