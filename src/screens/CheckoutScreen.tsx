import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Divider,
  Radio,
  Input,
  FormControl,
  Select,
  CheckIcon,
  useToast,
  ScrollView,
  SafeAreaView,
  Pressable,
  Alert,
} from 'native-base';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CardField, useStripe, useConfirmPayment } from '@stripe/stripe-react-native';
import { useForm, Controller } from 'react-hook-form';
import Icon from 'react-native-vector-icons/Ionicons';

import { RootState, AppDispatch } from '@/store';
import { createOrder } from '@/store/slices/orderSlice';
import { clearCart } from '@/store/slices/cartSlice';
import { paymentService } from '@/services/paymentService';
import { Address, PaymentMethod } from '@/types';

interface CheckoutFormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: 'card' | 'apple_pay' | 'google_pay';
  savePaymentMethod: boolean;
  sameAsBilling: boolean;
}

const CheckoutScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const toast = useToast();
  const { confirmPayment } = useConfirmPayment();
  
  const { items, total, subtotal, tax, shipping } = useSelector((state: RootState) => state.cart);
  const { user } = useSelector((state: RootState) => state.auth);
  const { isLoading } = useSelector((state: RootState) => state.orders);

  const [paymentIntentClientSecret, setPaymentIntentClientSecret] = useState<string>('');
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('new_card');
  const [cardDetails, setCardDetails] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<CheckoutFormData>({
    mode: 'onChange',
    defaultValues: {
      email: user?.email || '',
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phoneNumber || '',
      paymentMethod: 'card',
      savePaymentMethod: false,
      sameAsBilling: true,
    },
  });

  const watchSameAsBilling = watch('sameAsBilling');

  useEffect(() => {
    initializePayment();
    loadSavedPaymentMethods();
  }, []);

  const initializePayment = async () => {
    try {
      const paymentIntent = await paymentService.createPaymentIntent(total);
      setPaymentIntentClientSecret(paymentIntent.clientSecret);
    } catch (error) {
      toast.show({
        title: 'Payment Setup Failed',
        status: 'error',
        description: 'Unable to initialize payment. Please try again.',
      });
    }
  };

  const loadSavedPaymentMethods = async () => {
    if (user?.id) {
      const methods = await paymentService.getSavedPaymentMethods(user.id);
      setSavedPaymentMethods(methods);
    }
  };

  const onSubmit = async (data: CheckoutFormData) => {
    if (!cardDetails?.complete && selectedPaymentMethod === 'new_card') {
      toast.show({
        title: 'Invalid Card',
        status: 'error',
        description: 'Please enter valid card details.',
      });
      return;
    }

    setProcessing(true);

    try {
      let paymentResult;

      if (selectedPaymentMethod === 'new_card') {
        paymentResult = await processCardPayment(data);
      } else if (selectedPaymentMethod === 'apple_pay') {
        paymentResult = await processApplePayPayment();
      } else if (selectedPaymentMethod === 'google_pay') {
        paymentResult = await processGooglePayPayment();
      } else {
        // Saved payment method
        paymentResult = await processSavedPaymentMethod(selectedPaymentMethod);
      }

      if (paymentResult.success) {
        await createOrderAfterPayment(data, paymentResult.paymentIntent);
      } else {
        throw new Error(paymentResult.error);
      }
    } catch (error: any) {
      toast.show({
        title: 'Payment Failed',
        status: 'error',
        description: error.message || 'Payment processing failed. Please try again.',
      });
    } finally {
      setProcessing(false);
    }
  };

  const processCardPayment = async (data: CheckoutFormData) => {
    const billingDetails = {
      email: data.email,
      name: `${data.firstName} ${data.lastName}`,
      address: {
        line1: data.billingAddress.street,
        city: data.billingAddress.city,
        state: data.billingAddress.state,
        postalCode: data.billingAddress.zipCode,
        country: data.billingAddress.country,
      },
    };

    const { error, paymentIntent } = await confirmPayment(paymentIntentClientSecret, {
      paymentMethodType: 'Card',
      paymentMethodData: {
        billingDetails,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // Save payment method if requested
    if (data.savePaymentMethod && paymentIntent.payment_method) {
      await paymentService.savePaymentMethod(paymentIntent.payment_method, user?.id || '');
    }

    return { success: true, paymentIntent };
  };

  const processApplePayPayment = async () => {
    return await paymentService.processApplePayPayment(paymentIntentClientSecret);
  };

  const processGooglePayPayment = async () => {
    return await paymentService.processGooglePayPayment(paymentIntentClientSecret);
  };

  const processSavedPaymentMethod = async (paymentMethodId: string) => {
    // In a real implementation, you would use the saved payment method
    // For demo purposes, we'll simulate a successful payment
    return {
      success: true,
      paymentIntent: { id: 'pi_saved_method', status: 'succeeded' },
    };
  };

  const createOrderAfterPayment = async (data: CheckoutFormData, paymentIntent: any) => {
    const orderData = {
      userId: user?.id,
      items,
      subtotal,
      tax,
      shipping,
      total,
      currency: 'USD',
      shippingAddress: {
        id: Date.now().toString(),
        ...data.shippingAddress,
        isDefault: false,
      },
      billingAddress: {
        id: Date.now().toString(),
        ...data.billingAddress,
        isDefault: false,
      },
      paymentMethod: {
        id: paymentIntent.payment_method || 'pm_mock',
        type: data.paymentMethod,
        isDefault: false,
      },
      paymentIntentId: paymentIntent.id,
    };

    const order = await dispatch(createOrder(orderData)).unwrap();
    dispatch(clearCart());

    toast.show({
      title: 'Order Successful!',
      status: 'success',
      description: `Your order #${order.id.slice(-8)} has been placed successfully.`,
    });

    navigation.navigate('OrderSuccess', { orderId: order.id });
  };

  const renderPaymentMethodOption = (method: PaymentMethod) => (
    <Pressable
      key={method.id}
      onPress={() => setSelectedPaymentMethod(method.id)}
      p={3}
      borderWidth={1}
      borderColor={selectedPaymentMethod === method.id ? 'primary.500' : 'gray.200'}
      borderRadius="md"
      bg={selectedPaymentMethod === method.id ? 'primary.50' : 'white'}
    >
      <HStack alignItems="center" space={3}>
        <Radio.Icon
          isSelected={selectedPaymentMethod === method.id}
          colorScheme="primary"
        />
        <Icon
          name={method.brand === 'visa' ? 'card' : 'card-outline'}
          size={24}
          color="#333"
        />
        <VStack flex={1}>
          <Text fontWeight="medium">
            •••• •••• •••• {method.last4}
          </Text>
          <Text fontSize="sm" color="gray.500">
            {method.brand?.toUpperCase()} expires {method.expiryMonth}/{method.expiryYear}
          </Text>
        </VStack>
        {method.isDefault && (
          <Text fontSize="xs" color="primary.600" fontWeight="medium">
            Default
          </Text>
        )}
      </HStack>
    </Pressable>
  );

  return (
    <SafeAreaView flex={1} bg="gray.50">
      <ScrollView>
        <Box p={4}>
          <VStack space={6}>
            {/* Order Summary */}
            <Box bg="white" p={4} rounded="lg" shadow={1}>
              <Text fontSize="lg" fontWeight="bold" mb={3}>
                Order Summary
              </Text>
              <VStack space={2}>
                <HStack justifyContent="space-between">
                  <Text>Subtotal ({items.length} items)</Text>
                  <Text>${subtotal.toFixed(2)}</Text>
                </HStack>
                <HStack justifyContent="space-between">
                  <Text>Shipping</Text>
                  <Text>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</Text>
                </HStack>
                <HStack justifyContent="space-between">
                  <Text>Tax</Text>
                  <Text>${tax.toFixed(2)}</Text>
                </HStack>
                <Divider />
                <HStack justifyContent="space-between">
                  <Text fontSize="lg" fontWeight="bold">Total</Text>
                  <Text fontSize="lg" fontWeight="bold" color="primary.600">
                    ${total.toFixed(2)}
                  </Text>
                </HStack>
              </VStack>
            </Box>

            {/* Contact Information */}
            <Box bg="white" p={4} rounded="lg" shadow={1}>
              <Text fontSize="lg" fontWeight="bold" mb={4}>
                Contact Information
              </Text>
              <VStack space={4}>
                <HStack space={3}>
                  <FormControl flex={1} isInvalid={!!errors.firstName}>
                    <FormControl.Label>First Name</FormControl.Label>
                    <Controller
                      control={control}
                      name="firstName"
                      rules={{ required: 'First name is required' }}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                          placeholder="John"
                        />
                      )}
                    />
                  </FormControl>
                  
                  <FormControl flex={1} isInvalid={!!errors.lastName}>
                    <FormControl.Label>Last Name</FormControl.Label>
                    <Controller
                      control={control}
                      name="lastName"
                      rules={{ required: 'Last name is required' }}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                          placeholder="Doe"
                        />
                      )}
                    />
                  </FormControl>
                </HStack>

                <FormControl isInvalid={!!errors.email}>
                  <FormControl.Label>Email</FormControl.Label>
                  <Controller
                    control={control}
                    name="email"
                    rules={{
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        placeholder="john@example.com"
                        keyboardType="email-address"
                      />
                    )}
                  />
                </FormControl>

                <FormControl>
                  <FormControl.Label>Phone</FormControl.Label>
                  <Controller
                    control={control}
                    name="phone"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        placeholder="+1 (555) 123-4567"
                        keyboardType="phone-pad"
                      />
                    )}
                  />
                </FormControl>
              </VStack>
            </Box>

            {/* Shipping Address */}
            <Box bg="white" p={4} rounded="lg" shadow={1}>
              <Text fontSize="lg" fontWeight="bold" mb={4}>
                Shipping Address
              </Text>
              <VStack space={4}>
                <FormControl isInvalid={!!errors.shippingAddress?.street}>
                  <FormControl.Label>Street Address</FormControl.Label>
                  <Controller
                    control={control}
                    name="shippingAddress.street"
                    rules={{ required: 'Street address is required' }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        placeholder="123 Main St"
                      />
                    )}
                  />
                </FormControl>

                <HStack space={3}>
                  <FormControl flex={2} isInvalid={!!errors.shippingAddress?.city}>
                    <FormControl.Label>City</FormControl.Label>
                    <Controller
                      control={control}
                      name="shippingAddress.city"
                      rules={{ required: 'City is required' }}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                          placeholder="New York"
                        />
                      )}
                    />
                  </FormControl>

                  <FormControl flex={1} isInvalid={!!errors.shippingAddress?.state}>
                    <FormControl.Label>State</FormControl.Label>
                    <Controller
                      control={control}
                      name="shippingAddress.state"
                      rules={{ required: 'State is required' }}
                      render={({ field: { onChange, value } }) => (
                        <Select
                          selectedValue={value}
                          onValueChange={onChange}
                          placeholder="NY"
                          _selectedItem={{
                            bg: 'primary.600',
                            endIcon: <CheckIcon size="5" />,
                          }}
                        >
                          <Select.Item label="New York" value="NY" />
                          <Select.Item label="California" value="CA" />
                          <Select.Item label="Texas" value="TX" />
                        </Select>
                      )}
                    />
                  </FormControl>

                  <FormControl flex={1} isInvalid={!!errors.shippingAddress?.zipCode}>
                    <FormControl.Label>ZIP</FormControl.Label>
                    <Controller
                      control={control}
                      name="shippingAddress.zipCode"
                      rules={{ required: 'ZIP code is required' }}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                          placeholder="10001"
                          keyboardType="numeric"
                        />
                      )}
                    />
                  </FormControl>
                </HStack>
              </VStack>
            </Box>

            {/* Payment Method */}
            <Box bg="white" p={4} rounded="lg" shadow={1}>
              <Text fontSize="lg" fontWeight="bold" mb={4}>
                Payment Method
              </Text>
              
              <VStack space={3}>
                {/* Saved Payment Methods */}
                {savedPaymentMethods.map(renderPaymentMethodOption)}

                {/* New Card Option */}
                <Pressable
                  onPress={() => setSelectedPaymentMethod('new_card')}
                  p={3}
                  borderWidth={1}
                  borderColor={selectedPaymentMethod === 'new_card' ? 'primary.500' : 'gray.200'}
                  borderRadius="md"
                  bg={selectedPaymentMethod === 'new_card' ? 'primary.50' : 'white'}
                >
                  <HStack alignItems="center" space={3}>
                    <Radio.Icon
                      isSelected={selectedPaymentMethod === 'new_card'}
                      colorScheme="primary"
                    />
                    <Icon name="card-outline" size={24} color="#333" />
                    <Text fontWeight="medium">Add new card</Text>
                  </HStack>
                </Pressable>

                {/* Card Input Field */}
                {selectedPaymentMethod === 'new_card' && (
                  <Box mt={4}>
                    <CardField
                      postalCodeEnabled={false}
                      placeholders={{
                        number: '4242 4242 4242 4242',
                        expiration: 'MM/YY',
                        cvc: 'CVC',
                      }}
                      cardStyle={{
                        backgroundColor: '#FFFFFF',
                        textColor: '#000000',
                        borderWidth: 1,
                        borderColor: '#E2E8F0',
                        borderRadius: 8,
                      }}
                      style={{
                        width: '100%',
                        height: 50,
                        marginVertical: 10,
                      }}
                      onCardChange={(cardDetails) => {
                        setCardDetails(cardDetails);
                      }}
                    />
                  </Box>
                )}

                {/* Digital Wallets */}
                <HStack space={3}>
                  <Button
                    flex={1}
                    variant="outline"
                    leftIcon={<Icon name="logo-apple" size={20} />}
                    onPress={() => setSelectedPaymentMethod('apple_pay')}
                    bg={selectedPaymentMethod === 'apple_pay' ? 'primary.50' : 'white'}
                    borderColor={selectedPaymentMethod === 'apple_pay' ? 'primary.500' : 'gray.200'}
                  >
                    Apple Pay
                  </Button>
                  
                  <Button
                    flex={1}
                    variant="outline"
                    leftIcon={<Icon name="logo-google" size={20} />}
                    onPress={() => setSelectedPaymentMethod('google_pay')}
                    bg={selectedPaymentMethod === 'google_pay' ? 'primary.50' : 'white'}
                    borderColor={selectedPaymentMethod === 'google_pay' ? 'primary.500' : 'gray.200'}
                  >
                    Google Pay
                  </Button>
                </HStack>
              </VStack>
            </Box>

            {/* Place Order Button */}
            <Button
              size="lg"
              colorScheme="primary"
              onPress={handleSubmit(onSubmit)}
              isLoading={processing || isLoading}
              isDisabled={!isValid}
              leftIcon={<Icon name="lock-closed" size={20} color="white" />}
            >
              {processing ? 'Processing...' : `Place Order - $${total.toFixed(2)}`}
            </Button>

            {/* Security Notice */}
            <Box p={3} bg="green.50" rounded="md">
              <HStack space={2} alignItems="center">
                <Icon name="shield-checkmark" size={16} color="green.600" />
                <Text fontSize="sm" color="green.700" flex={1}>
                  Your payment information is encrypted and secure. We use industry-standard SSL encryption.
                </Text>
              </HStack>
            </Box>
          </VStack>
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CheckoutScreen;