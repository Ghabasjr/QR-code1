import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Address } from '@/types';

interface UserState {
  wishlist: string[]; // Product IDs
  recentlyViewed: string[]; // Product IDs
  savedAddresses: Address[];
  preferences: {
    notifications: boolean;
    emailMarketing: boolean;
    currency: string;
    language: string;
    theme: 'light' | 'dark' | 'system';
  };
}

const initialState: UserState = {
  wishlist: [],
  recentlyViewed: [],
  savedAddresses: [],
  preferences: {
    notifications: true,
    emailMarketing: false,
    currency: 'USD',
    language: 'en',
    theme: 'system',
  },
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    addToWishlist: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      if (!state.wishlist.includes(productId)) {
        state.wishlist.push(productId);
      }
    },
    
    removeFromWishlist: (state, action: PayloadAction<string>) => {
      state.wishlist = state.wishlist.filter(id => id !== action.payload);
    },
    
    clearWishlist: (state) => {
      state.wishlist = [];
    },
    
    addToRecentlyViewed: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      // Remove if already exists to avoid duplicates
      state.recentlyViewed = state.recentlyViewed.filter(id => id !== productId);
      // Add to beginning
      state.recentlyViewed.unshift(productId);
      // Keep only last 20 items
      if (state.recentlyViewed.length > 20) {
        state.recentlyViewed = state.recentlyViewed.slice(0, 20);
      }
    },
    
    clearRecentlyViewed: (state) => {
      state.recentlyViewed = [];
    },
    
    addAddress: (state, action: PayloadAction<Address>) => {
      const newAddress = action.payload;
      // If this is set as default, remove default from others
      if (newAddress.isDefault) {
        state.savedAddresses = state.savedAddresses.map(addr => ({
          ...addr,
          isDefault: false,
        }));
      }
      state.savedAddresses.push(newAddress);
    },
    
    updateAddress: (state, action: PayloadAction<Address>) => {
      const updatedAddress = action.payload;
      const index = state.savedAddresses.findIndex(addr => addr.id === updatedAddress.id);
      if (index > -1) {
        // If this is set as default, remove default from others
        if (updatedAddress.isDefault) {
          state.savedAddresses = state.savedAddresses.map(addr => ({
            ...addr,
            isDefault: false,
          }));
        }
        state.savedAddresses[index] = updatedAddress;
      }
    },
    
    removeAddress: (state, action: PayloadAction<string>) => {
      state.savedAddresses = state.savedAddresses.filter(addr => addr.id !== action.payload);
    },
    
    setDefaultAddress: (state, action: PayloadAction<string>) => {
      state.savedAddresses = state.savedAddresses.map(addr => ({
        ...addr,
        isDefault: addr.id === action.payload,
      }));
    },
    
    updatePreferences: (state, action: PayloadAction<Partial<UserState['preferences']>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    
    toggleWishlistItem: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      const index = state.wishlist.indexOf(productId);
      if (index > -1) {
        state.wishlist.splice(index, 1);
      } else {
        state.wishlist.push(productId);
      }
    },
  },
});

export const {
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  addToRecentlyViewed,
  clearRecentlyViewed,
  addAddress,
  updateAddress,
  removeAddress,
  setDefaultAddress,
  updatePreferences,
  toggleWishlistItem,
} = userSlice.actions;

export default userSlice.reducer;