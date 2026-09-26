import { Parisienne } from 'next/font/google';

/**
 * The handwritten face. Used by two sections only, so it is loaded by them
 * rather than by the root layout: declared there it was preloaded on every
 * page, including the many that never show a word of it.
 *
 * Apply `scriptFont.variable` to the section and `font-script` to the text.
 */
export const scriptFont = Parisienne({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-hand',
  display: 'swap',
});
