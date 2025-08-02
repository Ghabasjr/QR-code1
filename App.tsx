import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { NativeBaseProvider } from 'native-base';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import Toast from 'react-native-toast-message';
import { StripeProvider } from '@stripe/stripe-react-native';

import { store, persistor } from '@/store';
import AppNavigator from '@/navigation/AppNavigator';
import LoadingScreen from '@/components/LoadingScreen';
import { theme } from '@/theme';

const STRIPE_PUBLISHABLE_KEY = 'pk_test_your_stripe_publishable_key_here';

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <NativeBaseProvider theme={theme}>
          <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
            <NavigationContainer>
              <StatusBar style="auto" />
              <AppNavigator />
              <Toast />
            </NavigationContainer>
          </StripeProvider>
        </NativeBaseProvider>
      </PersistGate>
    </Provider>
  );
}