import React from 'react';
import { Box, Text, Center } from 'native-base';

const CheckoutScreen: React.FC = () => {
  return (
    <Box flex={1} bg="gray.50">
      <Center flex={1}>
        <Text fontSize="lg" color="gray.500">
          Checkout Screen
        </Text>
        <Text fontSize="sm" color="gray.400" mt={2}>
          Secure payment processing with Stripe will be implemented here
        </Text>
      </Center>
    </Box>
  );
};

export default CheckoutScreen;