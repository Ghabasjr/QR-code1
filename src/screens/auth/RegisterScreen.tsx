import React from 'react';
import { Box, Text, Center } from 'native-base';

const RegisterScreen: React.FC = () => {
  return (
    <Box flex={1} bg="white">
      <Center flex={1}>
        <Text fontSize="lg" color="gray.500">
          Register Screen
        </Text>
        <Text fontSize="sm" color="gray.400" mt={2}>
          User registration form will be implemented here
        </Text>
      </Center>
    </Box>
  );
};

export default RegisterScreen;