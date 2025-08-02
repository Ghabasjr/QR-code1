import React, { useState } from 'react';
import {
  Box,
  VStack,
  FormControl,
  Input,
  Button,
  Text,
  HStack,
  Pressable,
  useToast,
  KeyboardAvoidingView,
  ScrollView,
} from 'native-base';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { AppDispatch, RootState } from '@/store';
import { login } from '@/store/slices/authSlice';

interface LoginFormData {
  email: string;
  password: string;
}

const LoginScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const toast = useToast();
  
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await dispatch(login(data)).unwrap();
      toast.show({
        title: 'Login Successful',
        status: 'success',
        description: 'Welcome back!',
      });
    } catch (error: any) {
      toast.show({
        title: 'Login Failed',
        status: 'error',
        description: error.message || 'Please check your credentials',
      });
    }
  };

  return (
    <KeyboardAvoidingView
      flex={1}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView flex={1} bg="white" contentContainerStyle={{ flexGrow: 1 }}>
        <Box flex={1} justifyContent="center" px={6}>
          <VStack space={8} alignItems="center">
            {/* Logo */}
            <VStack space={4} alignItems="center">
              <Box
                width={80}
                height={80}
                bg="primary.600"
                rounded="full"
                justifyContent="center"
                alignItems="center"
              >
                <Text fontSize="2xl" color="white" fontWeight="bold">
                  E
                </Text>
              </Box>
              <VStack space={1} alignItems="center">
                <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                  Welcome Back
                </Text>
                <Text fontSize="md" color="gray.500" textAlign="center">
                  Sign in to your account
                </Text>
              </VStack>
            </VStack>

            {/* Form */}
            <VStack space={4} width="100%">
              <FormControl isInvalid={!!errors.email}>
                <FormControl.Label>Email</FormControl.Label>
                <Controller
                  control={control}
                  name="email"
                  rules={{
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      placeholder="Enter your email"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      leftElement={
                        <Box ml={3}>
                          <Icon name="mail-outline" size={20} color="gray.400" />
                        </Box>
                      }
                    />
                  )}
                />
                <FormControl.ErrorMessage>
                  {errors.email?.message}
                </FormControl.ErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.password}>
                <FormControl.Label>Password</FormControl.Label>
                <Controller
                  control={control}
                  name="password"
                  rules={{
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      placeholder="Enter your password"
                      type={showPassword ? 'text' : 'password'}
                      leftElement={
                        <Box ml={3}>
                          <Icon name="lock-closed-outline" size={20} color="gray.400" />
                        </Box>
                      }
                      rightElement={
                        <Pressable
                          onPress={() => setShowPassword(!showPassword)}
                          mr={3}
                        >
                          <Icon
                            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                            size={20}
                            color="gray.400"
                          />
                        </Pressable>
                      }
                    />
                  )}
                />
                <FormControl.ErrorMessage>
                  {errors.password?.message}
                </FormControl.ErrorMessage>
              </FormControl>

              <HStack justifyContent="flex-end">
                <Pressable onPress={() => navigation.navigate('ForgotPassword')}>
                  <Text fontSize="sm" color="primary.600">
                    Forgot Password?
                  </Text>
                </Pressable>
              </HStack>

              <Button
                onPress={handleSubmit(onSubmit)}
                isLoading={isLoading}
                isDisabled={!isValid}
                size="lg"
                colorScheme="primary"
              >
                Sign In
              </Button>
            </VStack>

            {/* Sign Up Link */}
            <HStack justifyContent="center" space={1}>
              <Text fontSize="sm" color="gray.500">
                Don't have an account?
              </Text>
              <Pressable onPress={() => navigation.navigate('Register')}>
                <Text fontSize="sm" color="primary.600" fontWeight="medium">
                  Sign Up
                </Text>
              </Pressable>
            </HStack>

            {/* Social Login */}
            <VStack space={3} width="100%">
              <HStack alignItems="center" space={3}>
                <Box flex={1} height="1px" bg="gray.300" />
                <Text fontSize="sm" color="gray.500">
                  Or continue with
                </Text>
                <Box flex={1} height="1px" bg="gray.300" />
              </HStack>

              <HStack space={3} justifyContent="center">
                <Button
                  variant="outline"
                  flex={1}
                  leftIcon={<Icon name="logo-google" size={20} />}
                >
                  Google
                </Button>
                <Button
                  variant="outline"
                  flex={1}
                  leftIcon={<Icon name="logo-apple" size={20} />}
                >
                  Apple
                </Button>
              </HStack>
            </VStack>
          </VStack>
        </Box>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;