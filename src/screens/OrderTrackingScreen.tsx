import React from 'react';
import { Box, Text, Center } from 'native-base';

const OrderTrackingScreen: React.FC = () => {
  return (
    <Box flex={1} bg="gray.50">
      <Center flex={1}>
        <Text fontSize="lg" color="gray.500">
          Order Tracking Screen
        </Text>
        <Text fontSize="sm" color="gray.400" mt={2}>
          Real-time order tracking will be implemented here
        </Text>
      </Center>
    </Box>
  );
};

export default OrderTrackingScreen;