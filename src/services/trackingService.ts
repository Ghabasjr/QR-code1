import { 
  doc, 
  onSnapshot, 
  updateDoc, 
  collection, 
  addDoc,
  query,
  where,
  orderBy,
  getDocs 
} from 'firebase/firestore';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { firestore } from '@/config/firebase';
import { Order, OrderStatus } from '@/types';

export interface TrackingUpdate {
  id: string;
  orderId: string;
  status: OrderStatus;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  timestamp: number;
  message: string;
  estimatedDelivery?: number;
}

export interface DeliveryAgent {
  id: string;
  name: string;
  phone: string;
  vehicleType: string;
  currentLocation: {
    latitude: number;
    longitude: number;
  };
  isActive: boolean;
}

export const trackingService = {
  // Subscribe to real-time order updates
  subscribeToOrderUpdates(
    orderId: string, 
    callback: (updates: TrackingUpdate[]) => void
  ): () => void {
    const trackingRef = collection(firestore, 'orderTracking');
    const q = query(
      trackingRef,
      where('orderId', '==', orderId),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updates: TrackingUpdate[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as TrackingUpdate[];
      
      callback(updates);
    });

    return unsubscribe;
  },

  // Subscribe to delivery agent location updates
  subscribeToDeliveryAgent(
    agentId: string,
    callback: (agent: DeliveryAgent) => void
  ): () => void {
    const agentRef = doc(firestore, 'deliveryAgents', agentId);
    
    const unsubscribe = onSnapshot(agentRef, (snapshot) => {
      if (snapshot.exists()) {
        const agent = {
          id: snapshot.id,
          ...snapshot.data(),
        } as DeliveryAgent;
        callback(agent);
      }
    });

    return unsubscribe;
  },

  // Add tracking update (typically called by delivery system)
  async addTrackingUpdate(update: Omit<TrackingUpdate, 'id'>): Promise<string> {
    try {
      const trackingRef = collection(firestore, 'orderTracking');
      const docRef = await addDoc(trackingRef, {
        ...update,
        timestamp: Date.now(),
      });

      // Update order status
      await this.updateOrderStatus(update.orderId, update.status);

      // Send push notification to user
      await this.sendTrackingNotification(update);

      return docRef.id;
    } catch (error) {
      console.error('Error adding tracking update:', error);
      throw error;
    }
  },

  // Update order status in orders collection
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    try {
      const orderRef = doc(firestore, 'orders', orderId);
      await updateDoc(orderRef, {
        status,
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  // Get delivery agent for order
  async getDeliveryAgent(orderId: string): Promise<DeliveryAgent | null> {
    try {
      const agentsRef = collection(firestore, 'deliveryAgents');
      const q = query(
        agentsRef,
        where('assignedOrders', 'array-contains', orderId),
        where('isActive', '==', true)
      );

      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const agentDoc = snapshot.docs[0];
        return {
          id: agentDoc.id,
          ...agentDoc.data(),
        } as DeliveryAgent;
      }

      return null;
    } catch (error) {
      console.error('Error getting delivery agent:', error);
      return null;
    }
  },

  // Calculate estimated delivery time
  calculateEstimatedDelivery(
    orderLocation: { latitude: number; longitude: number },
    deliveryLocation: { latitude: number; longitude: number },
    currentTime: number = Date.now()
  ): number {
    // Calculate distance using Haversine formula
    const distance = this.calculateDistance(
      orderLocation.latitude,
      orderLocation.longitude,
      deliveryLocation.latitude,
      deliveryLocation.longitude
    );

    // Assume average speed of 30 km/h in city
    const averageSpeed = 30; // km/h
    const deliveryTimeHours = distance / averageSpeed;
    const deliveryTimeMs = deliveryTimeHours * 60 * 60 * 1000;

    // Add buffer time (30 minutes)
    const bufferTime = 30 * 60 * 1000;

    return currentTime + deliveryTimeMs + bufferTime;
  },

  // Calculate distance between two points (Haversine formula)
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
  },

  toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  },

  // Send tracking notification to user
  async sendTrackingNotification(update: Omit<TrackingUpdate, 'id'>): Promise<void> {
    try {
      const title = this.getNotificationTitle(update.status);
      const body = update.message;

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: {
            orderId: update.orderId,
            status: update.status,
            type: 'tracking_update',
          },
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Error sending tracking notification:', error);
    }
  },

  getNotificationTitle(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.CONFIRMED:
        return '📦 Order Confirmed';
      case OrderStatus.PROCESSING:
        return '🏭 Order Processing';
      case OrderStatus.SHIPPED:
        return '🚚 Order Shipped';
      case OrderStatus.DELIVERED:
        return '✅ Order Delivered';
      case OrderStatus.CANCELLED:
        return '❌ Order Cancelled';
      default:
        return '📋 Order Update';
    }
  },

  // Get current location (for delivery agents)
  async getCurrentLocation(): Promise<{ latitude: number; longitude: number } | null> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.log('Location permission denied');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  },

  // Convert coordinates to address
  async getAddressFromCoordinates(
    latitude: number, 
    longitude: number
  ): Promise<string> {
    try {
      const results = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (results.length > 0) {
        const address = results[0];
        return `${address.street || ''} ${address.city || ''}, ${address.region || ''} ${address.postalCode || ''}`.trim();
      }

      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    }
  },

  // Start location tracking for delivery agent
  async startLocationTracking(
    agentId: string,
    callback: (location: { latitude: number; longitude: number }) => void
  ): Promise<Location.LocationSubscription | null> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.log('Location permission denied');
        return null;
      }

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 30000, // Update every 30 seconds
          distanceInterval: 50, // Update every 50 meters
        },
        async (location) => {
          const coords = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };

          // Update agent location in Firebase
          await this.updateAgentLocation(agentId, coords);
          
          callback(coords);
        }
      );

      return subscription;
    } catch (error) {
      console.error('Error starting location tracking:', error);
      return null;
    }
  },

  // Update delivery agent location
  async updateAgentLocation(
    agentId: string,
    location: { latitude: number; longitude: number }
  ): Promise<void> {
    try {
      const agentRef = doc(firestore, 'deliveryAgents', agentId);
      await updateDoc(agentRef, {
        currentLocation: location,
        lastLocationUpdate: Date.now(),
      });
    } catch (error) {
      console.error('Error updating agent location:', error);
    }
  },

  // Generate mock tracking updates for demo
  async generateMockTrackingUpdates(orderId: string): Promise<void> {
    const mockUpdates = [
      {
        orderId,
        status: OrderStatus.CONFIRMED,
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
          address: 'Warehouse, New York, NY',
        },
        message: 'Your order has been confirmed and is being prepared.',
        timestamp: Date.now() - (4 * 60 * 60 * 1000), // 4 hours ago
      },
      {
        orderId,
        status: OrderStatus.PROCESSING,
        location: {
          latitude: 40.7589,
          longitude: -73.9851,
          address: 'Fulfillment Center, New York, NY',
        },
        message: 'Your order is being packed and prepared for shipment.',
        timestamp: Date.now() - (2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        orderId,
        status: OrderStatus.SHIPPED,
        location: {
          latitude: 40.7505,
          longitude: -73.9934,
          address: 'Distribution Center, New York, NY',
        },
        message: 'Your order has been shipped and is on its way!',
        timestamp: Date.now() - (1 * 60 * 60 * 1000), // 1 hour ago
      },
    ];

    for (const update of mockUpdates) {
      await this.addTrackingUpdate(update);
    }
  },

  // Get estimated delivery window
  getDeliveryWindow(estimatedDelivery: number): string {
    const deliveryDate = new Date(estimatedDelivery);
    const now = new Date();
    
    if (deliveryDate.toDateString() === now.toDateString()) {
      return 'Today';
    }
    
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (deliveryDate.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    
    return deliveryDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  },

  // Format time ago
  formatTimeAgo(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) {
      return 'Just now';
    } else if (minutes < 60) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  },
};