import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CartItem } from '@/types';

const STORAGE_KEY = 'attume:cart';

interface CartState {
  items: CartItem[];
  isHydrated: boolean;
  /** Drives the "added to bag" confirmation on the product page. */
  lastAddedSlug: string | null;
}

const initialState: CartState = { items: [], isHydrated: false, lastAddedSlug: null };

/** Prices are never stored — only slug and quantity, re-priced by the API. */
function persist(items: CartItem[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* storage unavailable — cart stays in memory for this session */
  }
}

export function readStoredCart(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed)
      ? parsed.filter((item) => typeof item.slug === 'string' && Number(item.quantity) > 0)
      : [];
  } catch {
    return [];
  }
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    hydrate(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload;
      state.isHydrated = true;
    },
    addItem(state, action: PayloadAction<{ slug: string; quantity?: number; max?: number }>) {
      const { slug, quantity = 1, max = 5 } = action.payload;
      const existing = state.items.find((item) => item.slug === slug);
      if (existing) existing.quantity = Math.min(existing.quantity + quantity, max);
      else state.items.push({ slug, quantity: Math.min(quantity, max) });
      state.lastAddedSlug = slug;
      persist(state.items);
    },
    setQuantity(state, action: PayloadAction<{ slug: string; quantity: number }>) {
      const line = state.items.find((item) => item.slug === action.payload.slug);
      if (!line) return;
      if (action.payload.quantity <= 0) {
        state.items = state.items.filter((item) => item.slug !== action.payload.slug);
      } else {
        line.quantity = action.payload.quantity;
      }
      persist(state.items);
    },
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.slug !== action.payload);
      persist(state.items);
    },
    clearCart(state) {
      state.items = [];
      persist(state.items);
    },
    clearLastAdded(state) {
      state.lastAddedSlug = null;
    },
  },
});

export const { hydrate, addItem, setQuantity, removeItem, clearCart, clearLastAdded } =
  cartSlice.actions;
export default cartSlice.reducer;

export const selectCartCount = (items: CartItem[]) =>
  items.reduce((sum, item) => sum + item.quantity, 0);
