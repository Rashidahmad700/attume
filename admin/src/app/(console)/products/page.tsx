'use client';

import { useState } from 'react';
import { StatusPill } from '@/components/StatusPill';
import { StockEditor } from '@/components/StockEditor';
import { ProductForm } from '@/components/ProductForm';
import { formatPrice } from '@/lib/format';
import {
  useArchiveProductMutation,
  useGetProductsQuery,
  useUpdateProductMutation,
} from '@/store/api/adminApi';
import type { Product } from '@/types';

const stockFilters = [
  { label: 'All', value: undefined },
  { label: 'In stock', value: 'in' as const },
  { label: 'Low', value: 'low' as const },
  { label: 'Out of stock', value: 'out' as const },
];

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [stock, setStock] = useState<'in' | 'low' | 'out' | undefined>();
  const [editing, setEditing] = useState<Product | 'new' | null>(null);

  const { data, isLoading } = useGetProductsQuery({ search: search || undefined, stock });
  const [updateProduct] = useUpdateProductMutation();
  const [archiveProduct] = useArchiveProductMutation();

  const products = data?.data.products ?? [];

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow text-bronze">Catalogue</span>
          <h1 className="mt-2 font-serif text-4xl font-light text-ink">Products</h1>
        </div>
        <button
          type="button"
          onClick={() => setEditing('new')}
          className="bg-ink px-5 py-3 text-[11px] tracking-[0.16em] text-ivory uppercase hover:bg-olive"
        >
          Add product
        </button>
      </header>

      {editing && (
        <ProductForm
          product={editing === 'new' ? undefined : editing}
          onClose={() => setEditing(null)}
        />
      )}

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name, SKU or slug"
          className="field max-w-xs"
        />
        <div className="flex flex-wrap gap-2">
          {stockFilters.map((filter) => (
            <button
              key={filter.label}
              type="button"
              onClick={() => setStock(filter.value)}
              className={`border px-3 py-2 text-[10px] tracking-[0.12em] uppercase ${
                stock === filter.value
                  ? 'border-ink bg-ink text-ivory'
                  : 'border-line bg-white text-ink-muted hover:border-ink'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="panel overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="border-b border-line bg-ivory-soft">
            <tr>
              <th className="th">Product</th>
              <th className="th">SKU</th>
              <th className="th">Price</th>
              <th className="th">Availability</th>
              <th className="th">Stock</th>
              <th className="th">Status</th>
              <th className="th text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td className="cell text-ink-muted" colSpan={7}>
                  Loading products…
                </td>
              </tr>
            )}
            {!isLoading && products.length === 0 && (
              <tr>
                <td className="cell text-ink-muted" colSpan={7}>
                  No products match this filter.
                </td>
              </tr>
            )}
            {products.map((product) => (
              <tr key={product.id} className="border-b border-line last:border-b-0 align-middle">
                <td className="cell">
                  <span className="font-medium">{product.name}</span>
                  <span className="block text-xs text-ink-muted">{product.tagline}</span>
                </td>
                <td className="cell text-ink-muted">{product.sku}</td>
                <td className="cell">{formatPrice(product.price)}</td>
                <td className="cell">
                  {product.stock === 0 ? (
                    <span className="text-espresso">Out of stock</span>
                  ) : product.isLowStock ? (
                    <span className="text-bronze">Low — {product.stock} left</span>
                  ) : (
                    <span className="text-olive">In stock</span>
                  )}
                </td>
                <td className="cell">
                  <StockEditor product={product} />
                </td>
                <td className="cell">
                  <StatusPill value={product.status} />
                </td>
                <td className="cell text-right whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => setEditing(product)}
                    className="eyebrow text-ink hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateProduct({
                        id: product.id,
                        body: { status: product.status === 'active' ? 'draft' : 'active' },
                      })
                    }
                    className="eyebrow ml-4 text-olive hover:underline"
                  >
                    {product.status === 'active' ? 'Unpublish' : 'Publish'}
                  </button>
                  {product.status !== 'archived' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Archive ${product.name}? It stays in past orders.`)) {
                          archiveProduct(product.id);
                        }
                      }}
                      className="eyebrow ml-4 text-espresso hover:underline"
                    >
                      Archive
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
