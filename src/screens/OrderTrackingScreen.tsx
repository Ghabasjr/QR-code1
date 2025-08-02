import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  ScrollView,
  SafeAreaView,
  Pressable,
  Badge,
  Divider,
  Skeleton,
  useTheme,
} from 'native-base';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Animatable from 'react-native-animatable';

import { RootState, AppDispatch } from '@/store';
import { fetchOrderById } from '@/store/slices/orderSlice';
import { trackingService, TrackingUpdate, DeliveryAgent } from '@/services/trackingService';
import { OrderStatus } from '@/types';

interface RouteParams {
  orderId: string;
}

const OrderTrackingScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();
  const { orderId } = route.params as RouteParams;

  const { currentOrder, isLoading } = useSelector((state: RootState) => state.orders);
  const { user } = useSelector((state: RootState) => state.auth);

  const [trackingUpdates, setTrackingUpdates] = useState<TrackingUpdate[]>([]);
  const [deliveryAgent, setDeliveryAgent] = useState<DeliveryAgent | null>(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 40.7128,
    longitude: -74.0060,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [showFullMap, setShowFullMap] = useState(false);

  const mapRef = useRef<MapView>(null);
  const trackingUnsubscribe = useRef<(() => void) | null>(null);
  const agentUnsubscribe = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (orderId) {
      loadOrderDetails();
      subscribeToTracking();
    }

    return () => {
      if (trackingUnsubscribe.current) {
        trackingUnsubscribe.current();
      }
      if (agentUnsubscribe.current) {
        agentUnsubscribe.current();
      }
    };
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      await dispatch(fetchOrderById(orderId)).unwrap();
      
      // Load delivery agent if order is shipped
      const agent = await trackingService.getDeliveryAgent(orderId);
      if (agent) {
        setDeliveryAgent(agent);
        subscribeToDeliveryAgent(agent.id);
      }
    } catch (error) {
      console.error('Error loading order details:', error);
    }
  };

  const subscribeToTracking = () => {
    trackingUnsubscribe.current = trackingService.subscribeToOrderUpdates(
      orderId,
      (updates) => {
        setTrackingUpdates(updates);
        
        // Update map region to show latest location
        if (updates.length > 0 && updates[0].location) {
          const latestLocation = updates[0].location;
          setMapRegion({
            latitude: latestLocation.latitude,
            longitude: latestLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
      }
    );
  };

  const subscribeToDeliveryAgent = (agentId: string) => {
    agentUnsubscribe.current = trackingService.subscribeToDeliveryAgent(
      agentId,
      (agent) => {
        setDeliveryAgent(agent);
      }
    );
  };

  const getStatusColor = (status: OrderStatus): string => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'gray.500';
      case OrderStatus.CONFIRMED:
        return 'blue.500';
      case OrderStatus.PROCESSING:
        return 'orange.500';
      case OrderStatus.SHIPPED:
        return 'purple.500';
      case OrderStatus.DELIVERED:
        return 'green.500';
      case OrderStatus.CANCELLED:
        return 'red.500';
      default:
        return 'gray.500';
    }
  };

  const getStatusIcon = (status: OrderStatus): string => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'time-outline';
      case OrderStatus.CONFIRMED:
        return 'checkmark-circle-outline';
      case OrderStatus.PROCESSING:
        return 'construct-outline';
      case OrderStatus.SHIPPED:
        return 'car-outline';
      case OrderStatus.DELIVERED:
        return 'home-outline';
      case OrderStatus.CANCELLED:
        return 'close-circle-outline';
      default:
        return 'information-circle-outline';
    }
  };

  const renderTrackingTimeline = () => (
    <VStack space={4}>
      {trackingUpdates.map((update, index) => (
        <Animatable.View
          key={update.id}
          animation="fadeInLeft"
          delay={index * 200}
        >
          <HStack space={4} alignItems="flex-start">
            <VStack alignItems="center">
              <Box
                width="40px"
                height="40px"
                rounded="full"
                bg={getStatusColor(update.status)}
                justifyContent="center"
                alignItems="center"
              >
                <Icon
                  name={getStatusIcon(update.status)}
                  size={20}
                  color="white"
                />
              </Box>
              {index < trackingUpdates.length - 1 && (
                <Box width="2px" height="40px" bg="gray.300" mt={2} />
              )}
            </VStack>

            <VStack flex={1} space={1}>
              <HStack justifyContent="space-between" alignItems="center">
                <Text fontSize="md" fontWeight="bold" color="gray.800">
                  {update.status.charAt(0).toUpperCase() + update.status.slice(1)}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  {trackingService.formatTimeAgo(update.timestamp)}
                </Text>
              </HStack>
              
              <Text fontSize="sm" color="gray.600">
                {update.message}
              </Text>
              
              {update.location.address && (
                <Text fontSize="xs" color="gray.500">
                  📍 {update.location.address}
                </Text>
              )}
            </VStack>
          </HStack>
        </Animatable.View>
      ))}
    </VStack>
  );

  const renderDeliveryAgent = () => {
    if (!deliveryAgent) return null;

    return (
      <Box bg="white" p={4} rounded="lg" shadow={1}>
        <Text fontSize="lg" fontWeight="bold" mb={3}>
          Your Delivery Agent
        </Text>
        
        <HStack space={4} alignItems="center">
          <Box
            width="60px"
            height="60px"
            rounded="full"
            bg="primary.100"
            justifyContent="center"
            alignItems="center"
          >
            <Icon name="person" size={30} color={theme.colors.primary[600]} />
          </Box>
          
          <VStack flex={1} space={1}>
            <Text fontSize="md" fontWeight="bold">
              {deliveryAgent.name}
            </Text>
            <Text fontSize="sm" color="gray.600">
              {deliveryAgent.vehicleType}
            </Text>
            <HStack alignItems="center" space={1}>
              <Icon name="location" size={12} color="green.500" />
              <Text fontSize="xs" color="green.600">
                On the way
              </Text>
            </HStack>
          </VStack>

          <VStack space={2}>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Icon name="call" size={16} />}
              onPress={() => {
                // In a real app, this would make a phone call
                console.log('Calling:', deliveryAgent.phone);
              }}
            >
              Call
            </Button>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Icon name="chatbubble" size={16} />}
              onPress={() => {
                // In a real app, this would open chat
                console.log('Chat with:', deliveryAgent.name);
              }}
            >
              Chat
            </Button>
          </VStack>
        </HStack>
      </Box>
    );
  };

  const renderMap = () => (
    <Box height={showFullMap ? "400px" : "200px"} rounded="lg" overflow="hidden">
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        region={mapRegion}
        showsUserLocation
        showsMyLocationButton
        onRegionChangeComplete={setMapRegion}
      >
        {/* Order markers */}
        {trackingUpdates.map((update) => (
          <Marker
            key={update.id}
            coordinate={{
              latitude: update.location.latitude,
              longitude: update.location.longitude,
            }}
            title={update.status}
            description={update.message}
          >
            <Box
              width="30px"
              height="30px"
              rounded="full"
              bg={getStatusColor(update.status)}
              justifyContent="center"
              alignItems="center"
            >
              <Icon
                name={getStatusIcon(update.status)}
                size={16}
                color="white"
              />
            </Box>
          </Marker>
        ))}

        {/* Delivery agent marker */}
        {deliveryAgent && (
          <Marker
            coordinate={deliveryAgent.currentLocation}
            title={deliveryAgent.name}
            description="Delivery Agent"
          >
            <Box
              width="40px"
              height="40px"
              rounded="full"
              bg="blue.500"
              justifyContent="center"
              alignItems="center"
            >
              <Icon name="car" size={20} color="white" />
            </Box>
          </Marker>
        )}

        {/* Route polyline */}
        {trackingUpdates.length > 1 && (
          <Polyline
            coordinates={trackingUpdates.map(update => ({
              latitude: update.location.latitude,
              longitude: update.location.longitude,
            }))}
            strokeWidth={3}
            strokeColor={theme.colors.primary[600]}
            lineDashPattern={[5, 5]}
          />
        )}
      </MapView>

      <Pressable
        position="absolute"
        top={2}
        right={2}
        onPress={() => setShowFullMap(!showFullMap)}
        bg="white"
        p={2}
        rounded="md"
        shadow={2}
      >
        <Icon
          name={showFullMap ? "contract" : "expand"}
          size={20}
          color="gray.600"
        />
      </Pressable>
    </Box>
  );

  const renderOrderSummary = () => (
    <Box bg="white" p={4} rounded="lg" shadow={1}>
      <HStack justifyContent="space-between" alignItems="center" mb={3}>
        <Text fontSize="lg" fontWeight="bold">
          Order #{currentOrder?.id.slice(-8)}
        </Text>
        <Badge
          colorScheme={
            currentOrder?.status === OrderStatus.DELIVERED ? 'green' :
            currentOrder?.status === OrderStatus.SHIPPED ? 'blue' :
            currentOrder?.status === OrderStatus.CANCELLED ? 'red' : 'orange'
          }
          rounded="md"
        >
          {currentOrder?.status}
        </Badge>
      </HStack>

      <VStack space={2}>
        <HStack justifyContent="space-between">
          <Text color="gray.600">Items</Text>
          <Text fontWeight="medium">{currentOrder?.items.length} items</Text>
        </HStack>
        
        <HStack justifyContent="space-between">
          <Text color="gray.600">Total</Text>
          <Text fontWeight="bold" fontSize="lg" color="primary.600">
            ${currentOrder?.total.toFixed(2)}
          </Text>
        </HStack>

        {currentOrder?.estimatedDelivery && (
          <HStack justifyContent="space-between">
            <Text color="gray.600">Estimated Delivery</Text>
            <Text fontWeight="medium">
              {trackingService.getDeliveryWindow(currentOrder.estimatedDelivery)}
            </Text>
          </HStack>
        )}

        {currentOrder?.trackingNumber && (
          <HStack justifyContent="space-between">
            <Text color="gray.600">Tracking Number</Text>
            <Text fontWeight="mono" fontSize="sm">
              {currentOrder.trackingNumber}
            </Text>
          </HStack>
        )}
      </VStack>
    </Box>
  );

  if (isLoading) {
    return (
      <SafeAreaView flex={1} bg="gray.50">
        <Box p={4}>
          <VStack space={4}>
            <Skeleton height="100px" rounded="lg" />
            <Skeleton height="200px" rounded="lg" />
            <Skeleton height="150px" rounded="lg" />
          </VStack>
        </Box>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView flex={1} bg="gray.50">
      <ScrollView>
        <Box p={4}>
          <VStack space={6}>
            {/* Order Summary */}
            {renderOrderSummary()}

            {/* Live Map */}
            <Box bg="white" p={4} rounded="lg" shadow={1}>
              <HStack justifyContent="space-between" alignItems="center" mb={3}>
                <Text fontSize="lg" fontWeight="bold">
                  Live Tracking
                </Text>
                <HStack alignItems="center" space={1}>
                  <Box width="8px" height="8px" rounded="full" bg="green.500" />
                  <Text fontSize="sm" color="green.600">Live</Text>
                </HStack>
              </HStack>
              {renderMap()}
            </Box>

            {/* Delivery Agent */}
            {renderDeliveryAgent()}

            {/* Tracking Timeline */}
            <Box bg="white" p={4} rounded="lg" shadow={1}>
              <Text fontSize="lg" fontWeight="bold" mb={4}>
                Tracking History
              </Text>
              {trackingUpdates.length > 0 ? (
                renderTrackingTimeline()
              ) : (
                <Text color="gray.500" textAlign="center" py={4}>
                  No tracking updates available yet
                </Text>
              )}
            </Box>

            {/* Actions */}
            <VStack space={3}>
              <Button
                variant="outline"
                leftIcon={<Icon name="refresh" size={20} />}
                onPress={() => loadOrderDetails()}
              >
                Refresh Tracking
              </Button>

              {currentOrder?.status !== OrderStatus.DELIVERED && 
               currentOrder?.status !== OrderStatus.CANCELLED && (
                <Button
                  variant="outline"
                  colorScheme="red"
                  leftIcon={<Icon name="close" size={20} />}
                  onPress={() => {
                    // Implement order cancellation
                    console.log('Cancel order:', orderId);
                  }}
                >
                  Cancel Order
                </Button>
              )}

              <Button
                leftIcon={<Icon name="receipt" size={20} />}
                onPress={() => navigation.navigate('OrderDetails', { orderId })}
              >
                View Order Details
              </Button>
            </VStack>
          </VStack>
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OrderTrackingScreen;