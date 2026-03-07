import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  Platform, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
} from 'react-native';
import { supabase } from '../utils/supabase';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { router } from 'expo-router';
import { Mail, Smartphone, ArrowRight, CheckCircle2 } from 'lucide-react-native';

if (Platform.OS !== 'web') {
  GoogleSignin.configure({
    webClientId: '554236147468-o9kc52m0f1jjgaa1qskto4b7kgdj5gim.apps.googleusercontent.com',
    iosClientId: '554236147468-md9qq3rntkfsf0e6ot8ssuvvdhv9ttr2.apps.googleusercontent.com',
    scopes: ['profile', 'email'],
  });
}

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('EMAIL'); // 'EMAIL' or 'OTP'
  const [loading, setLoading] = useState(false);

  // Check if we are already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/(tabs)');
      }
    });
  }, []);

  const initiateGoogleLogin = async () => {
    try {
      setLoading(true);
      if (Platform.OS === 'web') {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
          },
        });
        if (error) throw error;
      } else {
        await GoogleSignin.hasPlayServices();
        const userInfo = await GoogleSignin.signIn();
        
        if (userInfo.idToken) {
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: userInfo.idToken,
          });
          if (error) throw error;
          // Successful login will redirect via _layout if session changes
          router.replace('/(tabs)');
        } else {
          throw new Error('No ID token present!');
        }
      }
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Play services not available or outdated');
      } else {
        Alert.alert('Google Sign-In Error', error.message || 'Something went wrong.');
      }
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
      });
      if (error) throw error;
      setStep('OTP');
    } catch (error) {
      Alert.alert('Error sending OTP', error.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) {
      Alert.alert('Error', 'Please enter the OTP');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });
      if (error) throw error;
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error verifying OTP', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      className="flex-1 bg-white"
    >
      <View className="flex-1 px-8 justify-center pb-20">
        <View className="items-center mb-10">
          <View className="h-20 w-20 rounded-2xl bg-indigo-600 justify-center items-center mb-6 shadow-sm shadow-indigo-600/40">
            <Smartphone color="white" size={40} strokeWidth={1.5} />
          </View>
          <Text className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</Text>
          <Text className="text-base text-gray-500 text-center">
            {step === 'EMAIL' 
              ? 'Sign in to your account securely.' 
              : `Enter the code we sent to ${email}`}
          </Text>
        </View>

        {step === 'EMAIL' ? (
          <View className="w-full space-y-4">
            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-2">Email Address</Text>
              <View className="flex-row items-center border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus-within:border-indigo-600 focus-within:bg-indigo-50/10">
                <Mail color="#9CA3AF" size={20} className="mr-3" />
                <TextInput
                  placeholder="name@example.com"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  className="flex-1 text-base text-gray-900"
                />
              </View>
            </View>

            <TouchableOpacity 
              onPress={sendOtp} 
              disabled={loading}
              className={`w-full py-4 rounded-xl items-center flex-row justify-center ${loading ? 'bg-indigo-400' : 'bg-indigo-600'}`}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text className="text-white font-semibold text-lg mr-2">Continue with OTP</Text>
                  <ArrowRight color="white" size={20} />
                </>
              )}
            </TouchableOpacity>

            <View className="flex-row items-center justify-center my-6">
              <View className="h-[1px] bg-gray-200 flex-1" />
              <Text className="px-4 text-gray-400 font-medium">OR</Text>
              <View className="h-[1px] bg-gray-200 flex-1" />
            </View>

            <TouchableOpacity 
              onPress={initiateGoogleLogin} 
              disabled={loading}
              className="w-full py-4 rounded-xl items-center justify-center border border-gray-200 bg-white shadow-sm shadow-gray-200"
            >
              <View className="flex-row items-center">
                <Text className="text-gray-900 font-semibold text-lg">Continue with Google</Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="w-full space-y-4">
            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-2">6-Digit Code</Text>
              <View className="flex-row items-center border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus-within:border-indigo-600">
                <TextInput
                  placeholder="000000"
                  placeholderTextColor="#9CA3AF"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                  className="flex-1 text-2xl tracking-[0.5em] text-center font-bold text-gray-900"
                />
              </View>
            </View>

            <TouchableOpacity 
              onPress={verifyOtp} 
              disabled={loading}
              className={`w-full py-4 rounded-xl items-center flex-row justify-center mt-4 ${loading ? 'bg-indigo-400' : 'bg-indigo-600'}`}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text className="text-white font-semibold text-lg mr-2">Verify & Login</Text>
                  <CheckCircle2 color="white" size={20} />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setStep('EMAIL')} 
              className="w-full py-4 items-center justify-center mt-2"
            >
              <Text className="text-indigo-600 font-semibold">Use a different email</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
