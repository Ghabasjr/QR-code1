import React from 'react';
import { Box, Spinner, Text, VStack, useTheme } from 'native-base';
import * as Animatable from 'react-native-animatable';

const LoadingScreen: React.FC = () => {
  const theme = useTheme();

  return (
    <Box flex={1} bg="white" justifyContent="center" alignItems="center">
      <VStack space={8} alignItems="center">
        <Animatable.View
          animation="pulse"
          iterationCount="infinite"
          duration={1500}
        >
          <Box
            width={100}
            height={100}
            bg="primary.600"
            rounded="full"
            justifyContent="center"
            alignItems="center"
            shadow={5}
          >
            <Text
              fontSize="3xl"
              color="white"
              fontWeight="bold"
              fontFamily="heading"
            >
              E
            </Text>
          </Box>
        </Animatable.View>

        <VStack space={2} alignItems="center">
          <Text
            fontSize="2xl"
            fontWeight="bold"
            color="primary.600"
            fontFamily="heading"
          >
            E-Commerce
          </Text>
          <Text
            fontSize="md"
            color="gray.500"
            textAlign="center"
            maxWidth="200px"
          >
            Your favorite shopping destination
          </Text>
        </VStack>

        <Spinner
          size="lg"
          color="primary.600"
          accessibilityLabel="Loading"
        />
      </VStack>
    </Box>
  );
};

export default LoadingScreen;