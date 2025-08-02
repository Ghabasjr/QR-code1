import { initStripe, useStripe } from '@stripe/stripe-react-native';
import { PaymentIntent, PaymentMethod } from '@/types';

// Initialize Stripe with your publishable key
const STRIPE_PUBLISHABLE_KEY = 'pk_test_your_stripe_publishable_key_here';

export const initializeStripe = async () => {
  await initStripe({
    publishableKey: STRIPE_PUBLISHABLE_KEY,
    merchantIdentifier: 'merchant.com.ecommerce.app',
    urlScheme: 'ecommerce-app',
  });
};

export const paymentService = {
  // Create payment intent on your backend
  async createPaymentIntent(amount: number, currency: string = 'usd'): Promise<PaymentIntent> {
    try {
      // In a real app, this would call your backend API
      const response = await fetch('https://your-backend-api.com/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          currency,
          automatic_payment_methods: {
            enabled: true,
          },
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      // Return mock payment intent for demo
      return this.getMockPaymentIntent(amount, currency);
    }
  },

  // Process card payment
  async processCardPayment(
    paymentIntentClientSecret: string,
    billingDetails: {
      email: string;
      name: string;
      address?: {
        line1: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
      };
    }
  ): Promise<{ success: boolean; paymentIntent?: any; error?: string }> {
    try {
      const { confirmPayment } = useStripe();
      
      const { error, paymentIntent } = await confirmPayment(paymentIntentClientSecret, {
        paymentMethodType: 'Card',
        paymentMethodData: {
          billingDetails,
        },
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        paymentIntent,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Payment processing failed',
      };
    }
  },

  // Process Apple Pay payment
  async processApplePayPayment(
    paymentIntentClientSecret: string,
    merchantName: string = 'E-Commerce App'
  ): Promise<{ success: boolean; paymentIntent?: any; error?: string }> {
    try {
      const { confirmPayment } = useStripe();
      
      const { error, paymentIntent } = await confirmPayment(paymentIntentClientSecret, {
        paymentMethodType: 'ApplePay',
        paymentMethodData: {
          applePay: {
            merchantCountryCode: 'US',
            currencyCode: 'USD',
            requiredBillingContactFields: ['emailAddress', 'name'],
            requiredShippingContactFields: ['name', 'phoneNumber', 'postalAddress'],
          },
        },
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        paymentIntent,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Apple Pay processing failed',
      };
    }
  },

  // Process Google Pay payment
  async processGooglePayPayment(
    paymentIntentClientSecret: string
  ): Promise<{ success: boolean; paymentIntent?: any; error?: string }> {
    try {
      const { confirmPayment } = useStripe();
      
      const { error, paymentIntent } = await confirmPayment(paymentIntentClientSecret, {
        paymentMethodType: 'GooglePay',
        paymentMethodData: {
          googlePay: {
            testEnv: __DEV__,
            merchantName: 'E-Commerce App',
            merchantCountryCode: 'US',
            currencyCode: 'USD',
            billingAddressConfig: {
              format: 'FULL',
              isRequired: true,
            },
          },
        },
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        paymentIntent,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Google Pay processing failed',
      };
    }
  },

  // Save payment method for future use
  async savePaymentMethod(
    paymentMethodId: string,
    customerId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('https://your-backend-api.com/save-payment-method', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_method_id: paymentMethodId,
          customer_id: customerId,
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        return { success: false, error: data.error };
      }

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to save payment method',
      };
    }
  },

  // Get saved payment methods
  async getSavedPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    try {
      const response = await fetch(`https://your-backend-api.com/payment-methods/${customerId}`);
      const data = await response.json();
      return data.payment_methods || [];
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      return this.getMockPaymentMethods();
    }
  },

  // Delete payment method
  async deletePaymentMethod(paymentMethodId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`https://your-backend-api.com/payment-methods/${paymentMethodId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.error) {
        return { success: false, error: data.error };
      }

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to delete payment method',
      };
    }
  },

  // Validate payment amount and currency
  validatePayment(amount: number, currency: string): { valid: boolean; error?: string } {
    if (amount <= 0) {
      return { valid: false, error: 'Amount must be greater than 0' };
    }

    if (amount > 999999.99) {
      return { valid: false, error: 'Amount exceeds maximum limit' };
    }

    const supportedCurrencies = ['usd', 'eur', 'gbp', 'cad', 'aud'];
    if (!supportedCurrencies.includes(currency.toLowerCase())) {
      return { valid: false, error: 'Currency not supported' };
    }

    return { valid: true };
  },

  // Mock data for development
  getMockPaymentIntent(amount: number, currency: string): PaymentIntent {
    return {
      id: `pi_mock_${Date.now()}`,
      amount: Math.round(amount * 100),
      currency,
      status: 'requires_payment_method',
      clientSecret: `pi_mock_${Date.now()}_secret`,
    };
  },

  getMockPaymentMethods(): PaymentMethod[] {
    return [
      {
        id: 'pm_mock_1',
        type: 'card',
        last4: '4242',
        brand: 'visa',
        expiryMonth: 12,
        expiryYear: 2025,
        isDefault: true,
      },
      {
        id: 'pm_mock_2',
        type: 'card',
        last4: '0005',
        brand: 'mastercard',
        expiryMonth: 10,
        expiryYear: 2024,
        isDefault: false,
      },
    ];
  },

  // Format amount for display
  formatAmount(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  },

  // Calculate processing fee
  calculateProcessingFee(amount: number): number {
    // Stripe's standard fee: 2.9% + $0.30
    return (amount * 0.029) + 0.30;
  },
};