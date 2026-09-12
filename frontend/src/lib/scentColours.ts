/**
 * Colour per accord and per note family.
 *
 * Fragrantica uses a full rainbow; these stay inside attume's range — olives,
 * ambers, espressos and papers — so the bars read as the brand rather than as
 * a borrowed chart. Every entry carries the text colour that passes against it.
 */
export interface Swatch {
  bg: string;
  text: string;
}

const INK = '#171613';
const IVORY = '#f7f3e3';

export const accordSwatches: Record<string, Swatch> = {
  woody: { bg: '#6b5233', text: IVORY },
  powdery: { bg: '#e3dac9', text: INK },
  'warm spicy': { bg: '#a9603f', text: IVORY },
  'fresh spicy': { bg: '#9fbf6a', text: INK },
  amber: { bg: '#c08a3e', text: INK },
  musky: { bg: '#d8cfc0', text: INK },
  balsamic: { bg: '#8a6b4f', text: IVORY },
  'white floral': { bg: '#ede6dc', text: INK },
  green: { bg: '#6e8b4a', text: IVORY },
  fruity: { bg: '#b9563a', text: IVORY },
  citrus: { bg: '#d9b43c', text: INK },
  sweet: { bg: '#cf8b76', text: INK },
  fresh: { bg: '#a9c4c9', text: INK },
  aromatic: { bg: '#7e9b7e', text: INK },
  leather: { bg: '#5a3a2a', text: IVORY },
  smoky: { bg: '#4a4a44', text: IVORY },
  earthy: { bg: '#6e6353', text: IVORY },
  oud: { bg: '#3e2d24', text: IVORY },
  vanilla: { bg: '#e6d2a8', text: INK },
};

export const accordSwatch = (name: string): Swatch =>
  accordSwatches[name.toLowerCase()] ?? { bg: '#4f5a20', text: IVORY };
