import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Image,
  IconButton,
  Divider,
  ScrollView,
  SafeAreaView,
  Pressable,
  AlertDialog,
  useToast,
  Badge,
  Input,
} from 'native-base';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { SwipeRow } from 'react-native-swipe-list-view';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Animatable from 'react-native-animatable';

import { RootState, AppDispatch } from '@/store';
import {
  updateQuantity,
  removeFromCart,
  clearCart,
  applyCoupon,
} from '@/store/slices/cartSlice';
import { addToWishlist } from '@/store/slices/userSlice';
import { CartItem } from '@/types';

const CartScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const toast = useToast();

  const { items, total, subtotal, tax, shipping, totalItems } = useSelector(
    (state: RootState) => state.cart
  );
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isClearCartAlertOpen, setIsClearCartAlertOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      setItemToDelete(itemId);
      setIsDeleteAlertOpen(true);
      return;
    }

    dispatch(updateQuantity({ itemId, quantity: newQuantity }));
    
    toast.show({
      title: 'Cart Updated',
      status: 'success',
      duration: 1000,
    });
  };

  const handleRemoveItem = (itemId: string) => {
    setItemToDelete(itemId);
    setIsDeleteAlertOpen(true);
  };

  const confirmRemoveItem = () => {
    if (itemToDelete) {
      dispatch(removeFromCart(itemToDelete));
      setIsDeleteAlertOpen(false);
      setItemToDelete(null);
      
      toast.show({
        title: 'Item Removed',
        status: 'info',
        description: 'Item has been removed from your cart',
      });
    }
  };

  const handleMoveToWishlist = (item: CartItem) => {
    dispatch(addToWishlist(item.productId));
    dispatch(removeFromCart(item.id));
    
    toast.show({
      title: 'Moved to Wishlist',
      status: 'success',
      description: `${item.product.name} moved to your wishlist`,
    });
  };

  const handleClearCart = () => {
    setIsClearCartAlertOpen(true);
  };

  const confirmClearCart = () => {
    dispatch(clearCart());
    setIsClearCartAlertOpen(false);
    
    toast.show({
      title: 'Cart Cleared',
      status: 'info',
      description: 'All items have been removed from your cart',
    });
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;

    // Mock coupon validation
    const mockCoupons = {
      'SAVE10': 10,
      'WELCOME20': 20,
      'STUDENT15': 15,
    };

    const discount = mockCoupons[couponCode.toUpperCase() as keyof typeof mockCoupons];
    
    if (discount) {
      dispatch(applyCoupon({ code: couponCode, discount }));
      setAppliedCoupon(couponCode);
      setCouponCode('');
      
      toast.show({
        title: 'Coupon Applied!',
        status: 'success',
        description: `$${discount} discount applied to your order`,
      });
    } else {
      toast.show({
        title: 'Invalid Coupon',
        status: 'error',
        description: 'Please enter a valid coupon code',
      });
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigation.navigate('Auth');
      return;
    }

    navigation.navigate('Checkout');
  };

  const calculateItemTotal = (item: CartItem): number => {
    return item.product.price * item.quantity;
  };

  const renderCartItem = (item: CartItem, index: number) => (
    <Animatable.View
      key={item.id}
      animation="fadeInUp"
      delay={index * 100}
      duration={500}
    >
      <SwipeRow
        leftOpenValue={0}
        rightOpenValue={-150}
        disableRightSwipe
      >
        {/* Hidden buttons */}
        <HStack
          flex={1}
          pl={4}
          pr={2}
          py={2}
          justifyContent="flex-end"
          alignItems="center"
          bg="gray.100"
          space={2}
        >
          <IconButton
            icon={<Icon name="heart-outline" size={20} color="red" />}
            bg="red.100"
            rounded="full"
            onPress={() => handleMoveToWishlist(item)}
            _pressed={{ bg: 'red.200' }}
          />
          <IconButton
            icon={<Icon name="trash-outline" size={20} color="red" />}
            bg="red.500"
            rounded="full"
            onPress={() => handleRemoveItem(item.id)}
            _pressed={{ bg: 'red.600' }}
          />
        </HStack>

        {/* Main content */}
        <Box bg="white" px={4} py={3}>
          <HStack space={3} alignItems="center">
            {/* Product Image */}
            <Box
              width="80px"
              height="80px"
              bg="gray.100"
              rounded="lg"
              overflow="hidden"
            >
              <Image
                source={{ uri: item.product.thumbnail }}
                alt={item.product.name}
                width="100%"
                height="100%"
                resizeMode="cover"
              />
            </Box>

            {/* Product Details */}
            <VStack flex={1} space={1}>
              <Text
                fontSize="md"
                fontWeight="medium"
                numberOfLines={2}
                color="gray.800"
              >
                {item.product.name}
              </Text>
              
              {item.product.brand && (
                <Text fontSize="sm" color="gray.500">
                  {item.product.brand}
                </Text>
              )}

              {/* Price */}
              <HStack alignItems="center" space={2}>
                <Text fontSize="lg" fontWeight="bold" color="primary.600">
                  ${item.product.price.toFixed(2)}
                </Text>
                {item.product.originalPrice && item.product.originalPrice > item.product.price && (
                  <Text
                    fontSize="sm"
                    color="gray.500"
                    textDecorationLine="line-through"
                  >
                    ${item.product.originalPrice.toFixed(2)}
                  </Text>
                )}
              </HStack>

              {/* Stock Status */}
              {item.product.stock < 5 && (
                <Text fontSize="xs" color="orange.600">
                  Only {item.product.stock} left in stock
                </Text>
              )}
            </VStack>

            {/* Quantity Controls */}
            <VStack alignItems="center" space={2}>
              <Text fontSize="sm" color="gray.600">
                Qty
              </Text>
              <HStack alignItems="center" space={1}>
                <IconButton
                  icon={<Icon name="remove" size={16} />}
                  size="sm"
                  variant="outline"
                  colorScheme="gray"
                  onPress={() => handleQuantityChange(item.id, item.quantity - 1)}
                  isDisabled={item.quantity <= 1}
                />
                <Text
                  fontSize="md"
                  fontWeight="medium"
                  minWidth="40px"
                  textAlign="center"
                >
                  {item.quantity}
                </Text>
                <IconButton
                  icon={<Icon name="add" size={16} />}
                  size="sm"
                  variant="outline"
                  colorScheme="gray"
                  onPress={() => handleQuantityChange(item.id, item.quantity + 1)}
                  isDisabled={item.quantity >= item.product.stock}
                />
              </HStack>
              <Text fontSize="sm" fontWeight="bold" color="gray.800">
                ${calculateItemTotal(item).toFixed(2)}
              </Text>
            </VStack>
          </HStack>
        </Box>
      </SwipeRow>
      <Divider />
    </Animatable.View>
  );

  const renderEmptyCart = () => (
    <Box flex={1} justifyContent="center" alignItems="center" p={8}>
      <Animatable.View animation="bounceIn" duration={1000}>
        <VStack alignItems="center" space={6}>
          <Box
            width="120px"
            height="120px"
            bg="gray.100"
            rounded="full"
            justifyContent="center"
            alignItems="center"
          >
            <Icon name="bag-outline" size={60} color="gray.400" />
          </Box>
          
          <VStack alignItems="center" space={3}>
            <Text fontSize="xl" fontWeight="bold" color="gray.600">
              Your cart is empty
            </Text>
            <Text fontSize="md" color="gray.500" textAlign="center">
              Looks like you haven't added anything to your cart yet
            </Text>
          </VStack>

          <Button
            size="lg"
            colorScheme="primary"
            onPress={() => navigation.navigate('Home')}
            leftIcon={<Icon name="storefront" size={20} color="white" />}
          >
            Continue Shopping
          </Button>
        </VStack>
      </Animatable.View>
    </Box>
  );

  const renderCartSummary = () => (
    <Box bg="white" p={4} shadow={3}>
      <VStack space={4}>
        {/* Coupon Section */}
        <Box>
          <Text fontSize="md" fontWeight="bold" mb={2}>
            Have a coupon?
          </Text>
          <HStack space={2}>
            <Input
              flex={1}
              placeholder="Enter coupon code"
              value={couponCode}
              onChangeText={setCouponCode}
              isDisabled={!!appliedCoupon}
            />
            <Button
              onPress={handleApplyCoupon}
              isDisabled={!couponCode.trim() || !!appliedCoupon}
              variant={appliedCoupon ? 'solid' : 'outline'}
              colorScheme={appliedCoupon ? 'green' : 'primary'}
            >
              {appliedCoupon ? 'Applied' : 'Apply'}
            </Button>
          </HStack>
          {appliedCoupon && (
            <Text fontSize="sm" color="green.600" mt={1}>
              ✓ Coupon "{appliedCoupon}" applied
            </Text>
          )}
        </Box>

        <Divider />

        {/* Price Breakdown */}
        <VStack space={2}>
          <HStack justifyContent="space-between">
            <Text fontSize="md" color="gray.600">
              Subtotal ({totalItems} items)
            </Text>
            <Text fontSize="md" fontWeight="medium">
              ${subtotal.toFixed(2)}
            </Text>
          </HStack>

          <HStack justifyContent="space-between">
            <Text fontSize="md" color="gray.600">
              Shipping
            </Text>
            <Text fontSize="md" fontWeight="medium" color={shipping === 0 ? 'green.600' : 'gray.800'}>
              {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
            </Text>
          </HStack>

          <HStack justifyContent="space-between">
            <Text fontSize="md" color="gray.600">
              Tax
            </Text>
            <Text fontSize="md" fontWeight="medium">
              ${tax.toFixed(2)}
            </Text>
          </HStack>

          <Divider />

          <HStack justifyContent="space-between" alignItems="center">
            <Text fontSize="lg" fontWeight="bold" color="gray.800">
              Total
            </Text>
            <Text fontSize="xl" fontWeight="bold" color="primary.600">
              ${total.toFixed(2)}
            </Text>
          </HStack>
        </VStack>

        {/* Action Buttons */}
        <VStack space={3}>
          <Button
            size="lg"
            colorScheme="primary"
            onPress={handleCheckout}
            leftIcon={<Icon name="lock-closed" size={20} color="white" />}
          >
            Proceed to Checkout
          </Button>

          <HStack space={3}>
            <Button
              flex={1}
              variant="outline"
              onPress={() => navigation.navigate('Home')}
              leftIcon={<Icon name="arrow-back" size={20} />}
            >
              Continue Shopping
            </Button>
            
            <Button
              flex={1}
              variant="outline"
              colorScheme="red"
              onPress={handleClearCart}
              leftIcon={<Icon name="trash" size={20} />}
            >
              Clear Cart
            </Button>
          </HStack>
        </VStack>
      </VStack>
    </Box>
  );

  if (items.length === 0) {
    return (
      <SafeAreaView flex={1} bg="gray.50">
        {renderEmptyCart()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView flex={1} bg="gray.50">
      <VStack flex={1}>
        {/* Header */}
        <Box bg="white" px={4} py={3} shadow={1}>
          <HStack justifyContent="space-between" alignItems="center">
            <Text fontSize="xl" fontWeight="bold" color="gray.800">
              Shopping Cart
            </Text>
            <Badge colorScheme="primary" rounded="full" px={2}>
              {totalItems} items
            </Badge>
          </HStack>
        </Box>

        {/* Cart Items */}
        <ScrollView flex={1} showsVerticalScrollIndicator={false}>
          <VStack>
            {items.map((item, index) => renderCartItem(item, index))}
          </VStack>
        </ScrollView>

        {/* Cart Summary */}
        {renderCartSummary()}
      </VStack>

      {/* Delete Confirmation Alert */}
      <AlertDialog
        isOpen={isDeleteAlertOpen}
        onClose={() => setIsDeleteAlertOpen(false)}
      >
        <AlertDialog.Content>
          <AlertDialog.CloseButton />
          <AlertDialog.Header>Remove Item</AlertDialog.Header>
          <AlertDialog.Body>
            Are you sure you want to remove this item from your cart?
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button.Group space={2}>
              <Button
                variant="unstyled"
                colorScheme="coolGray"
                onPress={() => setIsDeleteAlertOpen(false)}
              >
                Cancel
              </Button>
              <Button colorScheme="red" onPress={confirmRemoveItem}>
                Remove
              </Button>
            </Button.Group>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>

      {/* Clear Cart Confirmation Alert */}
      <AlertDialog
        isOpen={isClearCartAlertOpen}
        onClose={() => setIsClearCartAlertOpen(false)}
      >
        <AlertDialog.Content>
          <AlertDialog.CloseButton />
          <AlertDialog.Header>Clear Cart</AlertDialog.Header>
          <AlertDialog.Body>
            Are you sure you want to remove all items from your cart? This action cannot be undone.
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button.Group space={2}>
              <Button
                variant="unstyled"
                colorScheme="coolGray"
                onPress={() => setIsClearCartAlertOpen(false)}
              >
                Cancel
              </Button>
              <Button colorScheme="red" onPress={confirmClearCart}>
                Clear All
              </Button>
            </Button.Group>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </SafeAreaView>
  );
};

export default CartScreen;