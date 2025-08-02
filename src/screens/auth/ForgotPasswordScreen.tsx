import React from 'react';
import { Box, Text, Center } from 'native-base';

const ForgotPasswordScreen: React.FC = () => {
  return (
    <Box flex={1} bg="white">
      <Center flex={1}>
        <Text fontSize="lg" color="gray.500">
          Forgot Password Screen
        </Text>
        <Text fontSize="sm" color="gray.400" mt={2}>
          Password reset functionality will be implemented here
        </Text>
      </Center>
    </Box>
  );
};

export default ForgotPasswordScreen;