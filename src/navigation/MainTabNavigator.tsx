import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { Badge, useTheme } from 'native-base';
import Icon from 'react-native-vector-icons/Ionicons';

import { TabParamList } from '@/types';
import { RootState } from '@/store';
import HomeScreen from '@/screens/HomeScreen';
import CategoriesScreen from '@/screens/CategoriesScreen';
import SearchScreen from '@/screens/SearchScreen';
import CartScreen from '@/screens/CartScreen';
import ProfileScreen from '@/screens/ProfileScreen';

const Tab = createBottomTabNavigator<TabParamList>();

const MainTabNavigator: React.FC = () => {
  const theme = useTheme();
  const cartItemsCount = useSelector((state: RootState) => state.cart.totalItems);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Categories':
              iconName = focused ? 'grid' : 'grid-outline';
              break;
            case 'Search':
              iconName = focused ? 'search' : 'search-outline';
              break;
            case 'Cart':
              iconName = focused ? 'bag' : 'bag-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'home-outline';
          }

          const TabIcon = () => (
            <Icon name={iconName} size={size} color={color} />
          );

          // Add badge for cart
          if (route.name === 'Cart' && cartItemsCount > 0) {
            return (
              <div style={{ position: 'relative' }}>
                <TabIcon />
                <Badge
                  colorScheme="red"
                  rounded="full"
                  mb={-1}
                  mr={-1}
                  zIndex={1}
                  variant="solid"
                  alignSelf="flex-end"
                  _text={{ fontSize: 10 }}
                  position="absolute"
                  right={-6}
                  top={-3}
                >
                  {cartItemsCount > 99 ? '99+' : cartItemsCount}
                </Badge>
              </div>
            );
          }

          return <TabIcon />;
        },
        tabBarActiveTintColor: theme.colors.primary[600],
        tabBarInactiveTintColor: theme.colors.gray[400],
        tabBarStyle: {
          backgroundColor: theme.colors.white,
          borderTopColor: theme.colors.gray[200],
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{
          tabBarLabel: 'Categories',
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: 'Search',
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarLabel: 'Cart',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;