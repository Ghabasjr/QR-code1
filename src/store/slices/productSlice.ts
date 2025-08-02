import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product, Category, SearchFilters, PaginatedResponse } from '@/types';
import { productService } from '@/services/productService';

interface ProductState {
  products: Product[];
  categories: Category[];
  featuredProducts: Product[];
  searchResults: Product[];
  currentProduct: Product | null;
  filters: SearchFilters;
  isLoading: boolean;
  searchLoading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
}

const initialState: ProductState = {
  products: [],
  categories: [],
  featuredProducts: [],
  searchResults: [],
  currentProduct: null,
  filters: {},
  isLoading: false,
  searchLoading: false,
  error: null,
  hasMore: true,
  page: 1,
};

// Async thunks
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async ({ page = 1, limit = 10, reset = false }: { page?: number; limit?: number; reset?: boolean }) => {
    const response = await productService.getProducts(page, limit);
    return { ...response, reset };
  }
);

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async () => {
    const response = await productService.getCategories();
    return response;
  }
);

export const fetchFeaturedProducts = createAsyncThunk(
  'products/fetchFeaturedProducts',
  async () => {
    const response = await productService.getFeaturedProducts();
    return response;
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (productId: string) => {
    const response = await productService.getProductById(productId);
    return response;
  }
);

export const searchProducts = createAsyncThunk(
  'products/searchProducts',
  async ({ query, filters, page = 1 }: { query: string; filters?: SearchFilters; page?: number }) => {
    const response = await productService.searchProducts(query, filters, page);
    return response;
  }
);

export const fetchProductsByCategory = createAsyncThunk(
  'products/fetchProductsByCategory',
  async ({ categoryId, page = 1 }: { categoryId: string; page?: number }) => {
    const response = await productService.getProductsByCategory(categoryId, page);
    return response;
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<SearchFilters>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setCurrentProduct: (state, action: PayloadAction<Product | null>) => {
      state.currentProduct = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.page = 1;
      state.hasMore = true;
    },
  },
  extraReducers: (builder) => {
    // Fetch Products
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        const { data, hasMore, page, reset } = action.payload;
        
        if (reset || page === 1) {
          state.products = data;
        } else {
          state.products = [...state.products, ...data];
        }
        
        state.hasMore = hasMore;
        state.page = page;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch products';
      });

    // Fetch Categories
    builder
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      });

    // Fetch Featured Products
    builder
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.featuredProducts = action.payload;
      });

    // Fetch Product by ID
    builder
      .addCase(fetchProductById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch product';
      });

    // Search Products
    builder
      .addCase(searchProducts.pending, (state) => {
        state.searchLoading = true;
        state.error = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload.data;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.searchLoading = false;
        state.error = action.error.message || 'Search failed';
      });

    // Fetch Products by Category
    builder
      .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
        state.products = action.payload.data;
        state.hasMore = action.payload.hasMore;
        state.page = action.payload.page;
      });
  },
});

export const {
  clearError,
  setFilters,
  clearFilters,
  setCurrentProduct,
  clearSearchResults,
} = productSlice.actions;

export default productSlice.reducer;