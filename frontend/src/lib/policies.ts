import { site } from './site';

export interface Policy {
  slug: string;
  title: string;
  summary: string;
  sections: { heading: string; body: string[] }[];
}

/**
 * Draft policies written to match what the storefront actually does — free
 * shipping above ₹2000, COD above ₹999, dispatch windows. They still need a
 * read-through before launch, and a payment gateway will require them live.
 */
export const policies: Policy[] = [
  {
    slug: 'shipping',
    title: 'Shipping Policy',
    summary: 'How and when your order reaches you.',
    sections: [
      {
        heading: 'Dispatch',
        body: [
          'Orders are packed and dispatched within 2 working days of being placed. Orders placed on a Sunday or a public holiday are processed the next working day.',
          'Every order ships from our studio in New Delhi.',
        ],
      },
      {
        heading: 'Delivery time',
        body: [
          'Metro cities usually receive orders in 3–5 working days. Other locations take 5–8 working days.',
          'Delays caused by weather, strikes or courier backlogs are outside our control, though we will always tell you what we know.',
        ],
      },
      {
        heading: 'Shipping charges',
        body: [
          'Shipping is complimentary on orders above ₹2000. Below that, a flat ₹99 applies.',
          'Cash on delivery is available on orders above ₹999.',
        ],
      },
      {
        heading: 'Tracking',
        body: [
          'You will receive a tracking link once your parcel leaves us. You can also follow an order from your account at any time.',
        ],
      },
    ],
  },
  {
    slug: 'returns',
    title: 'Refund & Cancellation Policy',
    summary: 'Cancellations, returns and how refunds are processed.',
    sections: [
      {
        heading: 'Cancellations',
        body: [
          'An order can be cancelled from your account at any point before it is dispatched. Once it has shipped, it can no longer be cancelled.',
        ],
      },
      {
        heading: 'Returns',
        body: [
          'Fragrance is a personal and hygiene-sensitive product, so we cannot accept returns on opened bottles.',
          'If a bottle arrives damaged, leaking, or is not what you ordered, write to us within 48 hours of delivery with photographs and your order number. We will replace it or refund it in full.',
        ],
      },
      {
        heading: 'Refunds',
        body: [
          'Approved refunds are issued to the original payment method within 5–7 working days of the returned parcel reaching us.',
          'For cash on delivery orders, refunds are made by bank transfer to an account you nominate.',
        ],
      },
    ],
  },
  {
    slug: 'privacy',
    title: 'Privacy Policy',
    summary: 'What we collect, why, and what we never do with it.',
    sections: [
      {
        heading: 'What we collect',
        body: [
          'When you create an account we store your name, email address, phone number and any delivery addresses you save. When you place an order we store the order itself.',
          'Passwords are stored only as a one-way hash. Nobody at attume can read your password.',
        ],
      },
      {
        heading: 'How we use it',
        body: [
          'To take payment, ship your order, answer your questions, and — only if you ask for it — send you occasional emails about new fragrances.',
          'We do not sell your data, and we do not share it beyond the couriers and payment providers needed to fulfil your order.',
        ],
      },
      {
        heading: 'Your choices',
        body: [
          'You can update or delete your saved addresses at any time from your account. To have your account and its data removed entirely, write to us and we will do it.',
        ],
      },
    ],
  },
  {
    slug: 'terms',
    title: 'Terms of Service',
    summary: 'The basis on which we sell to you.',
    sections: [
      {
        heading: 'Orders',
        body: [
          'Placing an order is an offer to buy. We accept it when we dispatch the parcel. If something is mispriced or out of stock we will cancel and refund rather than ship the wrong thing.',
          'Prices are in Indian Rupees and inclusive of all taxes.',
        ],
      },
      {
        heading: 'Products',
        body: [
          'Our fragrances are original compositions made in small batches. Where we name another fragrance, it is to describe a family of scent — attume is an independent house and is not affiliated with, endorsed by, or a copy of any brand we mention.',
          'Batch-to-batch variation is normal in small-batch perfumery and is not a defect.',
        ],
      },
      {
        heading: 'Use of the site',
        body: [
          'Do not misuse the site: no scraping, no attempts to break authentication, no using it to sell anything but what we sell.',
        ],
      },
      {
        heading: 'Contact',
        body: [`Questions about these terms go to ${site.email}.`],
      },
    ],
  },
];

export const findPolicy = (slug: string) => policies.find((policy) => policy.slug === slug);
