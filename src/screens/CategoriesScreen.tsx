import React from 'react';
import { Box, Text, Center } from 'native-base';

const CategoriesScreen: React.FC = () => {
  return (
    <Box flex={1} bg="gray.50">
      <Center flex={1}>
        <Text fontSize="lg" color="gray.500">
          Categories Screen
        </Text>
        <Text fontSize="sm" color="gray.400" mt={2}>
          Category listing will be implemented here
        </Text>
      </Center>
    </Box>
  );
};

export default CategoriesScreen;