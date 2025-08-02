import React, { useEffect } from 'react';
import {
  Box,
  ScrollView,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Image,
  FlatList,
  Pressable,
  Badge,
  useTheme,
  SafeAreaView,
} from 'native-base';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

import { RootState, AppDispatch } from '@/store';
import { fetchFeaturedProducts, fetchCategories } from '@/store/slices/productSlice';
import { addToCart } from '@/store/slices/cartSlice';
import { addToRecentlyViewed } from '@/store/slices/userSlice';
import { Product, Category } from '@/types';

const HomeScreen: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  
  const { featuredProducts, categories, isLoading } = useSelector(
    (state: RootState) => state.products
  );
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(fetchFeaturedProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleProductPress = (product: Product) => {
    dispatch(addToRecentlyViewed(product.id));
    navigation.navigate('ProductDetails', { productId: product.id });
  };

  const handleAddToCart = (product: Product) => {
    dispatch(addToCart({ product, quantity: 1 }));
  };

  const renderFeaturedProduct = ({ item }: { item: Product }) => (
    <Pressable
      onPress={() => handleProductPress(item)}
      mr={4}
      width="200px"
    >
      <Box
        bg="white"
        rounded="lg"
        shadow={2}
        overflow="hidden"
      >
        <Image
          source={{ uri: item.thumbnail }}
          alt={item.name}
          width="100%"
          height="150px"
          resizeMode="cover"
        />
        
        {item.isOnSale && (
          <Badge
            colorScheme="red"
            position="absolute"
            top={2}
            left={2}
            rounded="md"
            _text={{ fontSize: 'xs' }}
          >
            -{item.discountPercentage}%
          </Badge>
        )}

        <VStack p={3} space={2}>
          <Text
            fontSize="sm"
            fontWeight="medium"
            numberOfLines={2}
            color="gray.800"
          >
            {item.name}
          </Text>
          
          <HStack justifyContent="space-between" alignItems="center">
            <VStack>
              <Text fontSize="lg" fontWeight="bold" color="primary.600">
                ${item.price}
              </Text>
              {item.originalPrice && (
                <Text
                  fontSize="sm"
                  color="gray.500"
                  textDecorationLine="line-through"
                >
                  ${item.originalPrice}
                </Text>
              )}
            </VStack>
            
            <Button
              size="sm"
              variant="outline"
              onPress={() => handleAddToCart(item)}
              leftIcon={<Icon name="add" size={16} color={theme.colors.primary[600]} />}
            >
              Add
            </Button>
          </HStack>
        </VStack>
      </Box>
    </Pressable>
  );

  const renderCategory = ({ item }: { item: Category }) => (
    <Pressable
      onPress={() => navigation.navigate('Categories', { categoryId: item.id })}
      mr={3}
    >
      <VStack alignItems="center" space={2}>
        <Box
          width="70px"
          height="70px"
          bg="primary.50"
          rounded="full"
          justifyContent="center"
          alignItems="center"
        >
          <Image
            source={{ uri: item.imageUrl || 'https://via.placeholder.com/70' }}
            alt={item.name}
            width="50px"
            height="50px"
            rounded="full"
          />
        </Box>
        <Text fontSize="xs" textAlign="center" maxWidth="70px" numberOfLines={2}>
          {item.name}
        </Text>
      </VStack>
    </Pressable>
  );

  return (
    <SafeAreaView flex={1} bg="gray.50">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Box bg="white" px={4} py={3} shadow={1}>
          <VStack space={3}>
            <HStack justifyContent="space-between" alignItems="center">
              <VStack>
                <Text fontSize="sm" color="gray.500">
                  Good morning,
                </Text>
                <Text fontSize="lg" fontWeight="bold" color="gray.800">
                  {user?.firstName || 'Welcome'}
                </Text>
              </VStack>
              
              <HStack space={3}>
                <Pressable
                  onPress={() => navigation.navigate('Search')}
                  p={2}
                >
                  <Icon name="notifications-outline" size={24} color="gray.600" />
                </Pressable>
                <Pressable
                  onPress={() => navigation.navigate('Cart')}
                  p={2}
                >
                  <Icon name="bag-outline" size={24} color="gray.600" />
                </Pressable>
              </HStack>
            </HStack>

            {/* Search Bar */}
            <Pressable onPress={() => navigation.navigate('Search')}>
              <Input
                placeholder="Search products..."
                isReadOnly
                leftElement={
                  <Box ml={3}>
                    <Icon name="search" size={20} color="gray.400" />
                  </Box>
                }
                bg="gray.100"
                borderWidth={0}
                rounded="full"
                py={3}
              />
            </Pressable>
          </VStack>
        </Box>

        {/* Categories */}
        <Box px={4} py={4}>
          <HStack justifyContent="space-between" alignItems="center" mb={3}>
            <Text fontSize="lg" fontWeight="bold" color="gray.800">
              Categories
            </Text>
            <Pressable onPress={() => navigation.navigate('Categories')}>
              <Text fontSize="sm" color="primary.600">
                See all
              </Text>
            </Pressable>
          </HStack>
          
          <FlatList
            data={categories.slice(0, 6)}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </Box>

        {/* Featured Products */}
        <Box px={4} py={4}>
          <HStack justifyContent="space-between" alignItems="center" mb={3}>
            <Text fontSize="lg" fontWeight="bold" color="gray.800">
              Featured Products
            </Text>
            <Pressable onPress={() => navigation.navigate('Categories')}>
              <Text fontSize="sm" color="primary.600">
                See all
              </Text>
            </Pressable>
          </HStack>
          
          <FlatList
            data={featuredProducts}
            renderItem={renderFeaturedProduct}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 16 }}
          />
        </Box>

        {/* Promotional Banner */}
        <Box mx={4} my={4}>
          <Box
            bg="gradient.to.r"
            from="primary.600"
            to="primary.800"
            rounded="xl"
            p={6}
            overflow="hidden"
          >
            <VStack space={3}>
              <Text fontSize="xl" fontWeight="bold" color="white">
                Special Offer!
              </Text>
              <Text fontSize="md" color="primary.100">
                Get 25% off on your first order
              </Text>
              <Button
                variant="solid"
                bg="white"
                _text={{ color: 'primary.600' }}
                _pressed={{ bg: 'gray.100' }}
                size="sm"
                maxWidth="120px"
              >
                Shop Now
              </Button>
            </VStack>
          </Box>
        </Box>

        <Box height="20px" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;