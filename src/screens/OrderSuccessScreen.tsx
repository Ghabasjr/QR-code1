import React from 'react';
import { Box, Text, Center } from 'native-base';

const OrderSuccessScreen: React.FC = () => {
  return (
    <Box flex={1} bg="gray.50">
      <Center flex={1}>
        <Text fontSize="lg" color="gray.500">
          Order Success Screen
        </Text>
        <Text fontSize="sm" color="gray.400" mt={2}>
          Order confirmation and success message will be implemented here
        </Text>
      </Center>
    </Box>
  );
};

export default OrderSuccessScreen;