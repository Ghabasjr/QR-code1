import React from 'react';
import { Box, Text, Center } from 'native-base';

const ProductDetailsScreen: React.FC = () => {
  return (
    <Box flex={1} bg="gray.50">
      <Center flex={1}>
        <Text fontSize="lg" color="gray.500">
          Product Details Screen
        </Text>
        <Text fontSize="sm" color="gray.400" mt={2}>
          Product details and add to cart functionality will be implemented here
        </Text>
      </Center>
    </Box>
  );
};

export default ProductDetailsScreen;