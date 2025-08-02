import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Image,
  ScrollView,
  SafeAreaView,
  Pressable,
  Badge,
  Divider,
  FlatList,
  Input,
  useToast,
  Modal,
  Avatar,
  Switch,
} from 'native-base';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Animatable from 'react-native-animatable';

import { RootState, AppDispatch } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { fetchOrders } from '@/store/slices/orderSlice';
import { fetchFeaturedProducts } from '@/store/slices/productSlice';
import { addToCart } from '@/store/slices/cartSlice';
import { toggleWishlistItem, updatePreferences } from '@/store/slices/userSlice';
import { Product, Order, OrderStatus } from '@/types';

const ProfileScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const toast = useToast();

  const { user } = useSelector((state: RootState) => state.auth);
  const { orders } = useSelector((state: RootState) => state.orders);
  const { featuredProducts } = useSelector((state: RootState) => state.products);
  const { totalItems } = useSelector((state: RootState) => state.cart);
  const { wishlist, recentlyViewed, preferences } = useSelector((state: RootState) => state.user);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      await Promise.all([
        dispatch(fetchOrders()).unwrap(),
        dispatch(fetchFeaturedProducts()).unwrap(),
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  useEffect(() => {
    // Get recent orders (last 5)
    const recent = orders.slice(0, 5);
    setRecentOrders(recent);
  }, [orders]);

  const handleLogout = () => {
    dispatch(logout());
    toast.show({
      title: 'Logged Out',
      status: 'info',
      description: 'You have been logged out successfully',
    });
  };

  const handleAddToCart = (product: Product) => {
    dispatch(addToCart({ product, quantity: 1 }));
    toast.show({
      title: 'Added to Cart',
      status: 'success',
      description: `${product.name} added to your cart`,
      duration: 2000,
    });
  };

  const handleToggleWishlist = (productId: string) => {
    dispatch(toggleWishlistItem(productId));
    const isInWishlist = wishlist.includes(productId);
    toast.show({
      title: isInWishlist ? 'Removed from Wishlist' : 'Added to Wishlist',
      status: 'success',
      duration: 1500,
    });
  };

  const getOrderStatusColor = (status: OrderStatus): string => {
    switch (status) {
      case OrderStatus.DELIVERED:
        return 'green';
      case OrderStatus.SHIPPED:
        return 'blue';
      case OrderStatus.PROCESSING:
        return 'orange';
      case OrderStatus.CANCELLED:
        return 'red';
      default:
        return 'gray';
    }
  };

  const renderDashboardOverview = () => (
    <VStack space={6}>
      {/* Welcome Section */}
      <Box bg="white" p={4} rounded="lg" shadow={1}>
        <HStack space={4} alignItems="center">
          <Avatar
            size="lg"
            source={{ uri: user?.profileImageUrl || undefined }}
            fallbackText={`${user?.firstName} ${user?.lastName}`}
            bg="primary.600"
          />
          <VStack flex={1}>
            <Text fontSize="xl" fontWeight="bold" color="gray.800">
              Welcome, {user?.firstName}!
            </Text>
            <Text fontSize="sm" color="gray.600">
              Member since {new Date(user?.createdAt || 0).getFullYear()}
            </Text>
          </VStack>
          <Button
            size="sm"
            variant="outline"
            onPress={() => setShowSettingsModal(true)}
            leftIcon={<Icon name="settings-outline" size={16} />}
          >
            Settings
          </Button>
        </HStack>
      </Box>

      {/* Quick Stats */}
      <HStack space={3}>
        <Pressable
          flex={1}
          onPress={() => navigation.navigate('Cart')}
        >
          <Box bg="white" p={4} rounded="lg" shadow={1} alignItems="center">
            <Box
              width="50px"
              height="50px"
              bg="primary.100"
              rounded="full"
              justifyContent="center"
              alignItems="center"
              mb={2}
            >
              <Icon name="bag" size={24} color="#0284c7" />
            </Box>
            <Text fontSize="xl" fontWeight="bold" color="primary.600">
              {totalItems}
            </Text>
            <Text fontSize="sm" color="gray.600">
              Items in Cart
            </Text>
          </Box>
        </Pressable>

        <Pressable
          flex={1}
          onPress={() => setActiveTab('orders')}
        >
          <Box bg="white" p={4} rounded="lg" shadow={1} alignItems="center">
            <Box
              width="50px"
              height="50px"
              bg="green.100"
              rounded="full"
              justifyContent="center"
              alignItems="center"
              mb={2}
            >
              <Icon name="receipt" size={24} color="#16a34a" />
            </Box>
            <Text fontSize="xl" fontWeight="bold" color="green.600">
              {orders.length}
            </Text>
            <Text fontSize="sm" color="gray.600">
              Total Orders
            </Text>
          </Box>
        </Pressable>

        <Pressable
          flex={1}
          onPress={() => setActiveTab('wishlist')}
        >
          <Box bg="white" p={4} rounded="lg" shadow={1} alignItems="center">
            <Box
              width="50px"
              height="50px"
              bg="red.100"
              rounded="full"
              justifyContent="center"
              alignItems="center"
              mb={2}
            >
              <Icon name="heart" size={24} color="#dc2626" />
            </Box>
            <Text fontSize="xl" fontWeight="bold" color="red.600">
              {wishlist.length}
            </Text>
            <Text fontSize="sm" color="gray.600">
              Wishlist Items
            </Text>
          </Box>
        </Pressable>
      </HStack>

      {/* Recent Orders */}
      <Box bg="white" p={4} rounded="lg" shadow={1}>
        <HStack justifyContent="space-between" alignItems="center" mb={4}>
          <Text fontSize="lg" fontWeight="bold" color="gray.800">
            Recent Orders
          </Text>
          <Pressable onPress={() => setActiveTab('orders')}>
            <Text fontSize="sm" color="primary.600">
              View All
            </Text>
          </Pressable>
        </HStack>

        {recentOrders.length > 0 ? (
          <VStack space={3}>
            {recentOrders.map((order) => (
              <Pressable
                key={order.id}
                onPress={() => navigation.navigate('OrderTracking', { orderId: order.id })}
              >
                <HStack justifyContent="space-between" alignItems="center" p={3} bg="gray.50" rounded="md">
                  <VStack>
                    <Text fontSize="md" fontWeight="medium">
                      Order #{order.id.slice(-8)}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </Text>
                  </VStack>
                  <VStack alignItems="flex-end">
                    <Badge colorScheme={getOrderStatusColor(order.status)} rounded="md">
                      {order.status}
                    </Badge>
                    <Text fontSize="sm" fontWeight="bold" color="gray.800">
                      ${order.total.toFixed(2)}
                    </Text>
                  </VStack>
                </HStack>
              </Pressable>
            ))}
          </VStack>
        ) : (
          <Text color="gray.500" textAlign="center" py={4}>
            No orders yet
          </Text>
        )}
      </Box>

      {/* Featured Products */}
      <Box bg="white" p={4} rounded="lg" shadow={1}>
        <HStack justifyContent="space-between" alignItems="center" mb={4}>
          <Text fontSize="lg" fontWeight="bold" color="gray.800">
            Recommended for You
          </Text>
          <Pressable onPress={() => navigation.navigate('Home')}>
            <Text fontSize="sm" color="primary.600">
              Shop Now
            </Text>
          </Pressable>
        </HStack>

        <FlatList
          data={featuredProducts.slice(0, 5)}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item: product }) => (
            <Pressable
              onPress={() => navigation.navigate('ProductDetails', { productId: product.id })}
              mr={3}
              width="150px"
            >
              <Box bg="gray.50" rounded="lg" overflow="hidden">
                <Image
                  source={{ uri: product.thumbnail }}
                  alt={product.name}
                  width="100%"
                  height="120px"
                  resizeMode="cover"
                />
                <VStack p={3} space={2}>
                  <Text fontSize="sm" fontWeight="medium" numberOfLines={2}>
                    {product.name}
                  </Text>
                  <HStack justifyContent="space-between" alignItems="center">
                    <Text fontSize="md" fontWeight="bold" color="primary.600">
                      ${product.price}
                    </Text>
                    <HStack space={1}>
                      <Pressable onPress={() => handleToggleWishlist(product.id)}>
                        <Icon
                          name={wishlist.includes(product.id) ? "heart" : "heart-outline"}
                          size={20}
                          color={wishlist.includes(product.id) ? "red" : "gray"}
                        />
                      </Pressable>
                      <Pressable onPress={() => handleAddToCart(product)}>
                        <Icon name="add-circle" size={20} color="#0284c7" />
                      </Pressable>
                    </HStack>
                  </HStack>
                </VStack>
              </Box>
            </Pressable>
          )}
          keyExtractor={(item) => item.id}
        />
      </Box>
    </VStack>
  );

  const renderOrderHistory = () => (
    <VStack space={4}>
      <Box bg="white" p={4} rounded="lg" shadow={1}>
        <Text fontSize="lg" fontWeight="bold" mb={4}>
          Order History
        </Text>
        
        {orders.length > 0 ? (
          <VStack space={3}>
            {orders.map((order) => (
              <Pressable
                key={order.id}
                onPress={() => navigation.navigate('OrderTracking', { orderId: order.id })}
              >
                <Box p={4} bg="gray.50" rounded="lg">
                  <HStack justifyContent="space-between" alignItems="flex-start" mb={3}>
                    <VStack>
                      <Text fontSize="md" fontWeight="bold">
                        Order #{order.id.slice(-8)}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </Text>
                    </VStack>
                    <Badge colorScheme={getOrderStatusColor(order.status)} rounded="md">
                      {order.status}
                    </Badge>
                  </HStack>

                  <HStack justifyContent="space-between" alignItems="center">
                    <VStack>
                      <Text fontSize="sm" color="gray.600">
                        {order.items.length} item{order.items.length > 1 ? 's' : ''}
                      </Text>
                      <Text fontSize="lg" fontWeight="bold" color="primary.600">
                        ${order.total.toFixed(2)}
                      </Text>
                    </VStack>
                    
                    <HStack space={2}>
                      <Button
                        size="sm"
                        variant="outline"
                        onPress={() => navigation.navigate('OrderTracking', { orderId: order.id })}
                      >
                        Track
                      </Button>
                      {order.status === OrderStatus.DELIVERED && (
                        <Button
                          size="sm"
                          onPress={() => {
                            // Reorder functionality
                            order.items.forEach(item => {
                              dispatch(addToCart({ product: item.product, quantity: item.quantity }));
                            });
                            toast.show({
                              title: 'Items Added to Cart',
                              status: 'success',
                              description: 'All items from this order have been added to your cart',
                            });
                          }}
                        >
                          Reorder
                        </Button>
                      )}
                    </HStack>
                  </HStack>
                </Box>
              </Pressable>
            ))}
          </VStack>
        ) : (
          <Box alignItems="center" py={8}>
            <Icon name="receipt-outline" size={60} color="gray.400" />
            <Text fontSize="lg" color="gray.500" mt={4}>
              No orders yet
            </Text>
            <Text fontSize="sm" color="gray.400" textAlign="center" mt={2}>
              Start shopping to see your orders here
            </Text>
            <Button
              mt={4}
              onPress={() => navigation.navigate('Home')}
            >
              Start Shopping
            </Button>
          </Box>
        )}
      </Box>
    </VStack>
  );

  const renderWishlist = () => (
    <Box bg="white" p={4} rounded="lg" shadow={1}>
      <Text fontSize="lg" fontWeight="bold" mb={4}>
        My Wishlist ({wishlist.length} items)
      </Text>
      
      {wishlist.length > 0 ? (
        <VStack space={3}>
          {featuredProducts
            .filter(product => wishlist.includes(product.id))
            .map((product) => (
              <HStack key={product.id} space={3} alignItems="center">
                <Image
                  source={{ uri: product.thumbnail }}
                  alt={product.name}
                  width="60px"
                  height="60px"
                  rounded="lg"
                />
                <VStack flex={1}>
                  <Text fontSize="md" fontWeight="medium" numberOfLines={2}>
                    {product.name}
                  </Text>
                  <Text fontSize="lg" fontWeight="bold" color="primary.600">
                    ${product.price}
                  </Text>
                </VStack>
                <HStack space={2}>
                  <Button
                    size="sm"
                    onPress={() => handleAddToCart(product)}
                  >
                    Add to Cart
                  </Button>
                  <Pressable onPress={() => handleToggleWishlist(product.id)}>
                    <Icon name="heart" size={24} color="red" />
                  </Pressable>
                </HStack>
              </HStack>
            ))}
        </VStack>
      ) : (
        <Box alignItems="center" py={8}>
          <Icon name="heart-outline" size={60} color="gray.400" />
          <Text fontSize="lg" color="gray.500" mt={4}>
            Your wishlist is empty
          </Text>
          <Text fontSize="sm" color="gray.400" textAlign="center" mt={2}>
            Save items you love for later
          </Text>
          <Button
            mt={4}
            onPress={() => navigation.navigate('Home')}
          >
            Browse Products
          </Button>
        </Box>
      )}
    </Box>
  );

  const renderTabButton = (tab: string, title: string, icon: string) => (
    <Pressable
      flex={1}
      onPress={() => setActiveTab(tab)}
      p={3}
      bg={activeTab === tab ? 'primary.600' : 'white'}
      rounded="lg"
      shadow={activeTab === tab ? 2 : 0}
    >
      <VStack alignItems="center" space={1}>
        <Icon
          name={icon}
          size={20}
          color={activeTab === tab ? 'white' : '#0284c7'}
        />
        <Text
          fontSize="sm"
          fontWeight="medium"
          color={activeTab === tab ? 'white' : 'primary.600'}
        >
          {title}
        </Text>
      </VStack>
    </Pressable>
  );

  const renderSettingsModal = () => (
    <Modal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)}>
      <Modal.Content>
        <Modal.CloseButton />
        <Modal.Header>Settings</Modal.Header>
        <Modal.Body>
          <VStack space={4}>
            <HStack justifyContent="space-between" alignItems="center">
              <Text>Push Notifications</Text>
              <Switch
                value={preferences.notifications}
                onValueChange={(value) =>
                  dispatch(updatePreferences({ notifications: value }))
                }
              />
            </HStack>
            
            <HStack justifyContent="space-between" alignItems="center">
              <Text>Email Marketing</Text>
              <Switch
                value={preferences.emailMarketing}
                onValueChange={(value) =>
                  dispatch(updatePreferences({ emailMarketing: value }))
                }
              />
            </HStack>

            <Button
              colorScheme="red"
              variant="outline"
              onPress={handleLogout}
              leftIcon={<Icon name="log-out-outline" size={20} />}
            >
              Logout
            </Button>
          </VStack>
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'orders':
        return renderOrderHistory();
      case 'wishlist':
        return renderWishlist();
      default:
        return renderDashboardOverview();
    }
  };

  return (
    <SafeAreaView flex={1} bg="gray.50">
      <VStack flex={1}>
        {/* Tab Navigation */}
        <Box bg="white" px={4} py={3} shadow={1}>
          <HStack space={2}>
            {renderTabButton('dashboard', 'Dashboard', 'grid-outline')}
            {renderTabButton('orders', 'Orders', 'receipt-outline')}
            {renderTabButton('wishlist', 'Wishlist', 'heart-outline')}
          </HStack>
        </Box>

        {/* Content */}
        <ScrollView flex={1} p={4} showsVerticalScrollIndicator={false}>
          <Animatable.View animation="fadeIn" duration={500}>
            {renderContent()}
          </Animatable.View>
        </ScrollView>

        {/* Settings Modal */}
        {renderSettingsModal()}
      </VStack>
    </SafeAreaView>
  );
};

export default ProfileScreen;