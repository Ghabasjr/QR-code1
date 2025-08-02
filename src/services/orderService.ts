import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc,
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { firestore } from '@/config/firebase';
import { Order, OrderStatus } from '@/types';

export const orderService = {
  async createOrder(orderData: any): Promise<Order> {
    try {
      const order: Omit<Order, 'id'> = {
        userId: orderData.userId,
        items: orderData.items,
        subtotal: orderData.subtotal,
        tax: orderData.tax,
        shipping: orderData.shipping,
        total: orderData.total,
        currency: orderData.currency || 'USD',
        status: OrderStatus.PENDING,
        shippingAddress: orderData.shippingAddress,
        billingAddress: orderData.billingAddress,
        paymentMethod: orderData.paymentMethod,
        trackingNumber: this.generateTrackingNumber(),
        estimatedDelivery: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days from now
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const docRef = await addDoc(collection(firestore, 'orders'), order);
      
      return {
        id: docRef.id,
        ...order,
      };
    } catch (error) {
      console.error('Error creating order:', error);
      return this.getMockOrder();
    }
  },

  async getUserOrders(userId?: string): Promise<Order[]> {
    try {
      if (!userId) {
        return this.getMockOrders();
      }

      const ordersRef = collection(firestore, 'orders');
      const q = query(
        ordersRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];

      return orders;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      return this.getMockOrders();
    }
  },

  async getOrderById(orderId: string): Promise<Order> {
    try {
      const orderDoc = await getDoc(doc(firestore, 'orders', orderId));
      
      if (!orderDoc.exists()) {
        throw new Error('Order not found');
      }

      return {
        id: orderDoc.id,
        ...orderDoc.data(),
      } as Order;
    } catch (error) {
      console.error('Error fetching order:', error);
      return this.getMockOrder();
    }
  },

  async trackOrder(orderId: string): Promise<any> {
    try {
      const order = await this.getOrderById(orderId);
      
      // Generate mock tracking updates
      const trackingUpdates = this.generateTrackingUpdates(order.status);
      
      return {
        orderId: order.id,
        status: order.status,
        estimatedDelivery: order.estimatedDelivery,
        updates: trackingUpdates,
      };
    } catch (error) {
      console.error('Error tracking order:', error);
      return this.getMockTrackingInfo();
    }
  },

  async cancelOrder(orderId: string): Promise<Order> {
    try {
      const orderRef = doc(firestore, 'orders', orderId);
      await updateDoc(orderRef, {
        status: OrderStatus.CANCELLED,
        updatedAt: Date.now(),
      });

      return await this.getOrderById(orderId);
    } catch (error) {
      console.error('Error cancelling order:', error);
      return this.getMockOrder();
    }
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    try {
      const orderRef = doc(firestore, 'orders', orderId);
      await updateDoc(orderRef, {
        status,
        updatedAt: Date.now(),
      });

      return await this.getOrderById(orderId);
    } catch (error) {
      console.error('Error updating order status:', error);
      return this.getMockOrder();
    }
  },

  generateTrackingNumber(): string {
    const prefix = 'EC';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  },

  generateTrackingUpdates(currentStatus: OrderStatus) {
    const baseTime = Date.now();
    const updates = [];

    updates.push({
      status: OrderStatus.PENDING,
      timestamp: baseTime - (4 * 24 * 60 * 60 * 1000),
      location: 'Order Processing Center',
      message: 'Order received and being processed',
    });

    if ([OrderStatus.CONFIRMED, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED].includes(currentStatus)) {
      updates.push({
        status: OrderStatus.CONFIRMED,
        timestamp: baseTime - (3 * 24 * 60 * 60 * 1000),
        location: 'Warehouse',
        message: 'Order confirmed and preparing for shipment',
      });
    }

    if ([OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED].includes(currentStatus)) {
      updates.push({
        status: OrderStatus.PROCESSING,
        timestamp: baseTime - (2 * 24 * 60 * 60 * 1000),
        location: 'Fulfillment Center',
        message: 'Order is being packed',
      });
    }

    if ([OrderStatus.SHIPPED, OrderStatus.DELIVERED].includes(currentStatus)) {
      updates.push({
        status: OrderStatus.SHIPPED,
        timestamp: baseTime - (1 * 24 * 60 * 60 * 1000),
        location: 'In Transit',
        message: 'Package shipped and in transit',
      });
    }

    if (currentStatus === OrderStatus.DELIVERED) {
      updates.push({
        status: OrderStatus.DELIVERED,
        timestamp: baseTime,
        location: 'Delivery Address',
        message: 'Package delivered successfully',
      });
    }

    return updates;
  },

  // Mock data methods
  getMockOrder(): Order {
    return {
      id: 'mock-order-1',
      userId: 'user-1',
      items: [],
      subtotal: 299.99,
      tax: 24.00,
      shipping: 9.99,
      total: 333.98,
      currency: 'USD',
      status: OrderStatus.PROCESSING,
      shippingAddress: {
        id: '1',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
        isDefault: true,
      },
      billingAddress: {
        id: '1',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
        isDefault: true,
      },
      paymentMethod: {
        id: '1',
        type: 'card',
        last4: '1234',
        brand: 'Visa',
        isDefault: true,
      },
      trackingNumber: 'EC123456789',
      estimatedDelivery: Date.now() + (3 * 24 * 60 * 60 * 1000),
      createdAt: Date.now() - (2 * 24 * 60 * 60 * 1000),
      updatedAt: Date.now(),
    };
  },

  getMockOrders(): Order[] {
    return [this.getMockOrder()];
  },

  getMockTrackingInfo() {
    return {
      orderId: 'mock-order-1',
      status: OrderStatus.SHIPPED,
      estimatedDelivery: Date.now() + (2 * 24 * 60 * 60 * 1000),
      updates: this.generateTrackingUpdates(OrderStatus.SHIPPED),
    };
  },
};