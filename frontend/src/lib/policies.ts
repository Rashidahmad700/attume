import { site } from './site';

export interface Policy {
  slug: string;
  title: string;
  summary: string;
  sections: { heading: string; body: string[] }[];
}

/**
 * Draft policies written to match what the storefront actually does — shipping
 * free on every order, cash on delivery with no minimum, dispatch windows, and
 * how a pre-booking differs from an order. They still need a read-through by
 * someone qualified before launch — a payment gateway will require them live
 * and accurate.
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
        heading: 'Pre-booked orders',
        body: [
          'Some fragrances are offered for pre-booking before a batch is ready. A pre-booking takes no payment and creates no charge — it records your interest and holds the price shown.',
          'When the batch is ready we write to you with the details. Dispatch timelines below apply from the day you confirm and pay, not from the day you pre-booked.',
        ],
      },
      {
        heading: 'Shipping charges',
        body: ['Shipping is free on every order. There is no minimum and no delivery fee.'],
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
        heading: 'Pre-bookings',
        body: [
          'A pre-booking is not a purchase. No payment is taken and no charge is raised, so there is nothing to refund — you can withdraw at any time by writing to us, or simply by not confirming when we come back to you.',
        ],
      },
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
