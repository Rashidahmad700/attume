'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { site } from '@/lib/site';

/**
 * No mail service is wired yet, so submitting opens the visitor's mail client
 * with the message prefilled. That is honest — nothing is silently dropped.
 */
export function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', orderNumber: '', message: '' });
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim() || !form.message.trim()) {
      setError('Please add your name and a message.');
      return;
    }
    setError('');

    const subject = form.orderNumber
      ? `Order ${form.orderNumber.trim()} — ${form.name.trim()}`
      : `Enquiry from ${form.name.trim()}`;
    const body = `${form.message.trim()}\n\n—\n${form.name.trim()}\n${form.email.trim()}`;

    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-7 border border-line p-7 lg:p-9">
      <h2 className="font-serif text-2xl font-light text-ink">Send a message</h2>

      {error && (
        <p role="alert" className="border-l-2 border-espresso bg-espresso/5 px-4 py-3 text-sm text-espresso">
          {error}
        </p>
      )}

      <Input
        label="Your name"
        name="name"
        value={form.name}
        onChange={(event) => setForm({ ...form, name: event.target.value })}
      />
      <Input
        label="Email"
        name="email"
        type="email"
        value={form.email}
        onChange={(event) => setForm({ ...form, email: event.target.value })}
      />
      <Input
        label="Order number (optional)"
        name="orderNumber"
        placeholder="ATT-202609-0001"
        value={form.orderNumber}
        onChange={(event) => setForm({ ...form, orderNumber: event.target.value })}
      />

      <label className="flex flex-col gap-2">
        <span className="eyebrow text-ink-muted">Message</span>
        <textarea
          value={form.message}
          onChange={(event) => setForm({ ...form, message: event.target.value })}
          className="min-h-32 border border-line bg-transparent p-3 text-sm text-ink focus:border-olive focus:outline-none"
        />
      </label>

      <Button type="submit" size="lg">
        Send message
      </Button>
      <p className="text-xs text-ink-muted">
        This opens your email app with the message ready to send.
      </p>
    </form>
  );
}
