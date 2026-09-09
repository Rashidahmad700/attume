'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { parseApiError } from '@/lib/apiError';
import { useCreateReviewMutation, useGetReviewsQuery } from '@/store/api/catalogueApi';
import { useAppSelector } from '@/store/hooks';
import { Stars } from './Stars';

export function Reviews({ slug }: { slug: string }) {
  const { data, isLoading } = useGetReviewsQuery(slug);
  const user = useAppSelector((state) => state.auth.user);
  const [createReview, { isLoading: isSubmitting }] = useCreateReviewMutation();

  const [isWriting, setIsWriting] = useState(false);
  const [form, setForm] = useState({ rating: 5, title: '', body: '' });
  const [error, setError] = useState('');

  const reviews = data?.data.reviews ?? [];
  const summary = data?.data.summary;
  const total = summary?.count ?? 0;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    try {
      await createReview({ slug, ...form, title: form.title || undefined }).unwrap();
      setIsWriting(false);
      setForm({ rating: 5, title: '', body: '' });
    } catch (caught) {
      setError(parseApiError(caught).message);
    }
  };

  return (
    <section className="border-t border-line pt-16">
      <h2 className="text-center font-serif text-3xl font-light text-ink lg:text-4xl">
        Customer reviews
      </h2>

      <div className="mt-10 grid items-center gap-10 border border-line bg-ivory-soft p-8 lg:grid-cols-3">
        <div className="flex flex-col items-center gap-2 text-center">
          <Stars value={summary?.average ?? 0} />
          <p className="font-serif text-3xl font-light text-ink">
            {(summary?.average ?? 0).toFixed(2)} <span className="text-ink-muted">out of 5</span>
          </p>
          <p className="text-xs text-ink-muted">
            {total === 0 ? 'No reviews yet' : `Based on ${total} review${total === 1 ? '' : 's'}`}
          </p>
        </div>

        <ul className="flex flex-col gap-2">
          {(summary?.distribution ?? [5, 4, 3, 2, 1].map((stars) => ({ stars, count: 0 }))).map(
            (row) => (
              <li key={row.stars} className="flex items-center gap-3">
                <Stars value={row.stars} size="sm" />
                <span className="h-2 flex-1 bg-line/60">
                  <span
                    className="block h-full bg-bronze"
                    style={{ width: total > 0 ? `${(row.count / total) * 100}%` : '0%' }}
                  />
                </span>
                <span className="w-6 text-right text-xs text-ink-muted">{row.count}</span>
              </li>
            ),
          )}
        </ul>

        <div className="flex justify-center">
          {user ? (
            <button
              type="button"
              onClick={() => setIsWriting((value) => !value)}
              className="bg-ink px-7 py-3.5 text-[11px] tracking-[0.16em] text-ivory uppercase hover:bg-olive"
            >
              {isWriting ? 'Cancel' : 'Write a review'}
            </button>
          ) : (
            <Link
              href={`/login?redirect=/products/${slug}`}
              className="border border-ink px-7 py-3.5 text-[11px] tracking-[0.16em] text-ink uppercase transition-colors hover:border-olive hover:bg-olive hover:text-ivory"
            >
              Sign in to review
            </Link>
          )}
        </div>
      </div>

      {isWriting && user && (
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5 border border-line p-8">
          {error && (
            <p role="alert" className="border-l-2 border-espresso bg-espresso/5 px-4 py-3 text-sm text-espresso">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3">
            <span className="eyebrow text-ink-muted">Your rating</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setForm({ ...form, rating: star })}
                  aria-label={`${star} star${star === 1 ? '' : 's'}`}
                  className="p-1"
                >
                  <Stars value={form.rating >= star ? 1 : 0} size="sm" />
                </button>
              ))}
            </div>
          </div>

          <input
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            placeholder="Headline (optional)"
            className="border-b border-line bg-transparent py-3 text-sm focus:border-olive focus:outline-none"
          />
          <textarea
            required
            value={form.body}
            onChange={(event) => setForm({ ...form, body: event.target.value })}
            placeholder="How does it wear through the day?"
            className="min-h-28 border border-line bg-transparent p-3 text-sm focus:border-olive focus:outline-none"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="self-start bg-ink px-7 py-3.5 text-[11px] tracking-[0.16em] text-ivory uppercase hover:bg-olive disabled:opacity-50"
          >
            {isSubmitting ? 'Posting…' : 'Post review'}
          </button>
        </form>
      )}

      <div className="mt-10">
        {isLoading && <p className="text-sm text-ink-muted">Loading reviews…</p>}
        {!isLoading && reviews.length === 0 && (
          <p className="text-center text-sm text-ink-muted">
            No reviews yet. Be the first to write one.
          </p>
        )}

        <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {reviews.map((review) => (
            <li key={review.id} className="flex flex-col gap-3 border border-line bg-ivory-soft p-6">
              <div className="flex items-start justify-between gap-3">
                <Stars value={review.rating} size="sm" />
                <span className="text-xs text-ink-muted">
                  {new Date(review.createdAt).toLocaleDateString('en-IN')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-ink">{review.authorName}</span>
                {review.isVerifiedPurchase && (
                  <span className="border border-olive/40 px-2 py-0.5 text-[10px] tracking-[0.12em] text-olive uppercase">
                    Verified
                  </span>
                )}
              </div>
              {review.title && <p className="font-serif text-lg text-ink">{review.title}</p>}
              <p className="text-sm leading-relaxed text-ink-muted">{review.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
