import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem, Product } from '@/types';

interface CartState {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
}

const TAX_RATE = 0.08; // 8% tax
const FREE_SHIPPING_THRESHOLD = 50;
const SHIPPING_COST = 9.99;

const initialState: CartState = {
  items: [],
  totalItems: 0,
  subtotal: 0,
  tax: 0,
  shipping: 0,
  total: 0,
  currency: 'USD',
};

const calculateTotals = (state: CartState) => {
  state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
  state.subtotal = state.items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  state.tax = state.subtotal * TAX_RATE;
  state.shipping = state.subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  state.total = state.subtotal + state.tax + state.shipping;
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<{ product: Product; quantity?: number; variations?: Record<string, string> }>) => {
      const { product, quantity = 1, variations } = action.payload;
      const existingItemIndex = state.items.findIndex(
        item => item.productId === product.id && 
        JSON.stringify(item.selectedVariations) === JSON.stringify(variations)
      );

      if (existingItemIndex > -1) {
        state.items[existingItemIndex].quantity += quantity;
      } else {
        const newItem: CartItem = {
          id: `${product.id}_${Date.now()}`,
          productId: product.id,
          product,
          quantity,
          selectedVariations: variations,
          addedAt: Date.now(),
        };
        state.items.push(newItem);
      }

      calculateTotals(state);
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      calculateTotals(state);
    },

    updateQuantity: (state, action: PayloadAction<{ itemId: string; quantity: number }>) => {
      const { itemId, quantity } = action.payload;
      const itemIndex = state.items.findIndex(item => item.id === itemId);
      
      if (itemIndex > -1) {
        if (quantity <= 0) {
          state.items.splice(itemIndex, 1);
        } else {
          state.items[itemIndex].quantity = quantity;
        }
        calculateTotals(state);
      }
    },

    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.subtotal = 0;
      state.tax = 0;
      state.shipping = 0;
      state.total = 0;
    },

    applyCoupon: (state, action: PayloadAction<{ code: string; discount: number }>) => {
      // This would typically validate the coupon code with the backend
      const { discount } = action.payload;
      state.subtotal = Math.max(0, state.subtotal - discount);
      calculateTotals(state);
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  applyCoupon,
} = cartSlice.actions;

export default cartSlice.reducer;