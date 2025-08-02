import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Order, OrderStatus } from '@/types';
import { orderService } from '@/services/orderService';

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  trackingInfo: {
    orderId: string;
    status: OrderStatus;
    location?: string;
    estimatedDelivery?: number;
    updates: Array<{
      status: OrderStatus;
      timestamp: number;
      location?: string;
      message?: string;
    }>;
  } | null;
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,
  trackingInfo: null,
};

// Async thunks
export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData: {
    items: any[];
    shippingAddress: any;
    billingAddress: any;
    paymentMethod: any;
  }) => {
    const response = await orderService.createOrder(orderData);
    return response;
  }
);

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async () => {
    const response = await orderService.getUserOrders();
    return response;
  }
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async (orderId: string) => {
    const response = await orderService.getOrderById(orderId);
    return response;
  }
);

export const trackOrder = createAsyncThunk(
  'orders/trackOrder',
  async (orderId: string) => {
    const response = await orderService.trackOrder(orderId);
    return response;
  }
);

export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async (orderId: string) => {
    const response = await orderService.cancelOrder(orderId);
    return response;
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentOrder: (state, action: PayloadAction<Order | null>) => {
      state.currentOrder = action.payload;
    },
    updateOrderStatus: (state, action: PayloadAction<{ orderId: string; status: OrderStatus }>) => {
      const { orderId, status } = action.payload;
      const orderIndex = state.orders.findIndex(order => order.id === orderId);
      if (orderIndex > -1) {
        state.orders[orderIndex].status = status;
        state.orders[orderIndex].updatedAt = Date.now();
      }
      if (state.currentOrder?.id === orderId) {
        state.currentOrder.status = status;
        state.currentOrder.updatedAt = Date.now();
      }
    },
    clearTrackingInfo: (state) => {
      state.trackingInfo = null;
    },
  },
  extraReducers: (builder) => {
    // Create Order
    builder
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
        state.orders.unshift(action.payload);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create order';
      });

    // Fetch Orders
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch orders';
      });

    // Fetch Order by ID
    builder
      .addCase(fetchOrderById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch order';
      });

    // Track Order
    builder
      .addCase(trackOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(trackOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.trackingInfo = action.payload;
      })
      .addCase(trackOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to track order';
      });

    // Cancel Order
    builder
      .addCase(cancelOrder.fulfilled, (state, action) => {
        const cancelledOrder = action.payload;
        const orderIndex = state.orders.findIndex(order => order.id === cancelledOrder.id);
        if (orderIndex > -1) {
          state.orders[orderIndex] = cancelledOrder;
        }
        if (state.currentOrder?.id === cancelledOrder.id) {
          state.currentOrder = cancelledOrder;
        }
      });
  },
});

export const {
  clearError,
  setCurrentOrder,
  updateOrderStatus,
  clearTrackingInfo,
} = orderSlice.actions;

export default orderSlice.reducer;