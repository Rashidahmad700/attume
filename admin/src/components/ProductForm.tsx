'use client';

import { useState, type FormEvent } from 'react';
import { parseApiError } from '@/lib/apiError';
import { useCreateProductMutation, useUpdateProductMutation } from '@/store/api/adminApi';
import type { Product } from '@/types';

const blank = {
  name: '',
  slug: '',
  sku: '',
  tagline: '',
  description: '',
  notes: '',
  price: '',
  compareAtPrice: '',
  stock: '0',
  lowStockThreshold: '5',
  status: 'draft',
  badge: '',
  isFeatured: false,
};

export function ProductForm({ product, onClose }: { product?: Product; onClose: () => void }) {
  const isEdit = Boolean(product);
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const [form, setForm] = useState({
    ...blank,
    ...(product
      ? {
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          tagline: product.tagline,
          description: product.description,
          notes: product.notes.join(', '),
          price: String(product.price),
          compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : '',
          stock: String(product.stock),
          lowStockThreshold: String(product.lowStockThreshold),
          status: product.status,
          badge: product.badge ?? '',
          isFeatured: product.isFeatured,
        }
      : {}),
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const set = (key: keyof typeof form, value: string | boolean) =>
    setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setFieldErrors({});

    const body = {
      name: form.name.trim(),
      slug: form.slug.trim().toLowerCase(),
      sku: form.sku.trim().toUpperCase(),
      tagline: form.tagline.trim(),
      description: form.description.trim(),
      notes: form.notes
        .split(',')
        .map((note) => note.trim())
        .filter(Boolean),
      price: Number(form.price),
      ...(form.compareAtPrice ? { compareAtPrice: Number(form.compareAtPrice) } : {}),
      stock: Number(form.stock),
      lowStockThreshold: Number(form.lowStockThreshold),
      status: form.status as Product['status'],
      badge: form.badge.trim() || undefined,
      isFeatured: form.isFeatured,
    };

    try {
      if (isEdit && product) await updateProduct({ id: product.id, body }).unwrap();
      else await createProduct(body).unwrap();
      onClose();
    } catch (caught) {
      const parsed = parseApiError(caught);
      setError(parsed.message);
      setFieldErrors(parsed.fieldErrors);
    }
  };

  const input = (key: keyof typeof form, label: string, props: Record<string, unknown> = {}) => (
    <label className="flex flex-col gap-1.5">
      <span className="eyebrow text-ink-muted">{label}</span>
      <input
        className="field"
        value={String(form[key])}
        onChange={(event) => set(key, event.target.value)}
        {...props}
      />
      {fieldErrors[key] && <span className="text-xs text-espresso">{fieldErrors[key]}</span>}
    </label>
  );

  return (
    <form onSubmit={handleSubmit} className="panel flex flex-col gap-6 p-6">
      <h2 className="font-serif text-2xl font-light text-ink">
        {isEdit ? `Edit ${product?.name}` : 'New product'}
      </h2>

      {error && (
        <p role="alert" className="border-l-2 border-espresso bg-espresso/5 px-4 py-3 text-sm text-espresso">
          {error}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-3">
        {input('name', 'Name', { required: true })}
        {input('slug', 'Slug', { required: true, placeholder: 'atolis' })}
        {input('sku', 'SKU', { required: true, placeholder: 'ATT-ATO-50' })}
      </div>

      {input('tagline', 'Tagline', { required: true })}

      <label className="flex flex-col gap-1.5">
        <span className="eyebrow text-ink-muted">Description</span>
        <textarea
          className="field min-h-24"
          value={form.description}
          onChange={(event) => set('description', event.target.value)}
        />
      </label>

      {input('notes', 'Notes (comma separated)', { placeholder: 'Apple, Bergamot, Cardamom' })}

      <div className="grid gap-5 sm:grid-cols-4">
        {input('price', 'Price (INR)', { type: 'number', min: 0, required: true })}
        {input('compareAtPrice', 'Compare at price', { type: 'number', min: 0 })}
        {input('stock', 'Stock', { type: 'number', min: 0 })}
        {input('lowStockThreshold', 'Low stock at', { type: 'number', min: 0 })}
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <label className="flex flex-col gap-1.5">
          <span className="eyebrow text-ink-muted">Status</span>
          <select
            className="field"
            value={form.status}
            onChange={(event) => set('status', event.target.value)}
          >
            <option value="draft">Draft — hidden from storefront</option>
            <option value="active">Active — live</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        {input('badge', 'Badge', { placeholder: 'Bestseller' })}
        <label className="flex items-end gap-2 pb-2 text-sm">
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(event) => set('isFeatured', event.target.checked)}
            className="h-4 w-4 accent-[#4f5a20]"
          />
          <span>Feature on home page</span>
        </label>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isCreating || isUpdating}
          className="bg-ink px-6 py-3 text-[11px] tracking-[0.16em] text-ivory uppercase hover:bg-olive disabled:opacity-50"
        >
          {isCreating || isUpdating ? 'Saving…' : isEdit ? 'Save product' : 'Create product'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="border border-line px-6 py-3 text-[11px] tracking-[0.16em] text-ink uppercase hover:border-ink"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
