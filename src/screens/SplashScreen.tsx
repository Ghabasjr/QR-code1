import React from 'react';
import { Box, Text, VStack } from 'native-base';
import * as Animatable from 'react-native-animatable';

const SplashScreen: React.FC = () => {
  return (
    <Box 
      flex={1} 
      bg="primary.600" 
      justifyContent="center" 
      alignItems="center"
    >
      <VStack space={6} alignItems="center">
        <Animatable.View
          animation="bounceIn"
          duration={1500}
          delay={300}
        >
          <Box
            width={120}
            height={120}
            bg="white"
            rounded="full"
            justifyContent="center"
            alignItems="center"
            shadow={8}
          >
            <Text
              fontSize="4xl"
              color="primary.600"
              fontWeight="bold"
              fontFamily="heading"
            >
              E
            </Text>
          </Box>
        </Animatable.View>

        <Animatable.View
          animation="fadeInUp"
          duration={1000}
          delay={800}
        >
          <VStack space={2} alignItems="center">
            <Text
              fontSize="3xl"
              fontWeight="bold"
              color="white"
              fontFamily="heading"
            >
              E-Commerce
            </Text>
            <Text
              fontSize="lg"
              color="primary.100"
              textAlign="center"
              maxWidth="250px"
            >
              Shop smarter, live better
            </Text>
          </VStack>
        </Animatable.View>

        <Animatable.View
          animation="fadeIn"
          duration={800}
          delay={1300}
        >
          <Box
            width="20px"
            height="20px"
            bg="white"
            rounded="full"
            opacity={0.7}
          />
        </Animatable.View>
      </VStack>
    </Box>
  );
};

export default SplashScreen;