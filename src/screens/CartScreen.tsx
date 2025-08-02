import React from 'react';
import { Box, Text, VStack, Button, Center } from 'native-base';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

const CartScreen: React.FC = () => {
  const { items, total } = useSelector((state: RootState) => state.cart);

  return (
    <Box flex={1} bg="gray.50" p={4}>
      <VStack space={4} flex={1}>
        {items.length === 0 ? (
          <Center flex={1}>
            <VStack space={4} alignItems="center">
              <Text fontSize="lg" color="gray.500">
                Your cart is empty
              </Text>
              <Button>Continue Shopping</Button>
            </VStack>
          </Center>
        ) : (
          <>
            {/* Cart items would be rendered here */}
            <Text fontSize="xl" fontWeight="bold">
              Cart ({items.length} items)
            </Text>
            
            <Box bg="white" p={4} rounded="lg" mt="auto">
              <VStack space={2}>
                <Text fontSize="lg" fontWeight="bold">
                  Total: ${total.toFixed(2)}
                </Text>
                <Button size="lg">Proceed to Checkout</Button>
              </VStack>
            </Box>
          </>
        )}
      </VStack>
    </Box>
  );
};

export default CartScreen;