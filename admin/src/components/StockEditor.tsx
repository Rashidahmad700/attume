'use client';

import { useEffect, useState } from 'react';
import { useUpdateStockMutation } from '@/store/api/adminApi';
import type { Product } from '@/types';

/**
 * Inline stock control: type a number and save, or hit the one-click
 * "Out of stock" / restock shortcuts. Stock 0 is what makes the storefront
 * treat a product as unavailable, so no separate flag is needed.
 */
export function StockEditor({ product }: { product: Product }) {
  const [updateStock, { isLoading }] = useUpdateStockMutation();
  const [value, setValue] = useState(String(product.stock));
  const [message, setMessage] = useState('');

  useEffect(() => setValue(String(product.stock)), [product.stock]);

  const save = async (next: number) => {
    setMessage('');
    try {
      await updateStock({ id: product.id, stock: next }).unwrap();
      setMessage('Saved');
      setTimeout(() => setMessage(''), 1600);
    } catch {
      setMessage('Failed');
    }
  };

  const parsed = Number(value);
  const isDirty = String(product.stock) !== value.trim();
  const isValid = Number.isInteger(parsed) && parsed >= 0;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="number"
        min={0}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        aria-label={`Stock for ${product.name}`}
        className="field w-20 text-center"
      />
      <button
        type="button"
        disabled={!isDirty || !isValid || isLoading}
        onClick={() => save(parsed)}
        className="border border-ink bg-ink px-3 py-2 text-[10px] tracking-[0.12em] text-ivory uppercase disabled:opacity-30"
      >
        Save
      </button>
      {product.stock > 0 ? (
        <button
          type="button"
          disabled={isLoading}
          onClick={() => save(0)}
          className="border border-line px-3 py-2 text-[10px] tracking-[0.12em] text-espresso uppercase hover:border-espresso"
        >
          Mark out of stock
        </button>
      ) : (
        <button
          type="button"
          disabled={isLoading}
          onClick={() => save(10)}
          className="border border-line px-3 py-2 text-[10px] tracking-[0.12em] text-olive uppercase hover:border-olive"
        >
          Restock 10
        </button>
      )}
      {message && (
        <span className={message === 'Saved' ? 'text-xs text-olive' : 'text-xs text-espresso'}>
          {message}
        </span>
      )}
    </div>
  );
}
