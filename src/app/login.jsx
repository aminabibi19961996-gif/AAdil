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
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('EMAIL');
  const [loading, setLoading] = useState(false);

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
        const response = await GoogleSignin.signIn();
        const idToken = response?.data?.idToken || response?.idToken;

        if (idToken) {
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: idToken,
          });
          if (error) throw error;
          router.replace('/(tabs)');
        } else {
          throw new Error('No ID token present!');
        }
      }
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // already in progress
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
      const { error } = await supabase.auth.signInWithOtp({ email });
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
      style={{ flex: 1, backgroundColor: '#f8fafc' }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 40,
          paddingTop: insets.top + 20,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo & Header */}
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              backgroundColor: '#1a2332',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
              shadowColor: '#1a2332',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <Smartphone color="#FFB800" size={40} strokeWidth={1.5} />
          </View>
          <Text
            style={{
              fontSize: 28,
              fontWeight: 'bold',
              color: '#1a2332',
              marginBottom: 8,
            }}
          >
            Welcome Back
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: '#64748b',
              textAlign: 'center',
              lineHeight: 22,
            }}
          >
            {step === 'EMAIL'
              ? 'Sign in to your account securely.'
              : `Enter the code we sent to ${email}`}
          </Text>
        </View>

        {step === 'EMAIL' ? (
          <View>
            {/* Email Input */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: '#475569',
                  marginBottom: 8,
                }}
              >
                Email Address
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#ffffff',
                  borderWidth: 1,
                  borderColor: '#e2e8f0',
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  height: 54,
                }}
              >
                <Mail color="#94a3b8" size={20} />
                <TextInput
                  placeholder="name@example.com"
                  placeholderTextColor="#94a3b8"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={{
                    flex: 1,
                    marginLeft: 12,
                    fontSize: 16,
                    color: '#1a2332',
                  }}
                />
              </View>
            </View>

            {/* OTP Button */}
            <TouchableOpacity
              onPress={sendOtp}
              disabled={loading}
              style={{
                backgroundColor: loading ? '#94a3b8' : '#FFB800',
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                marginBottom: 20,
              }}
            >
              {loading ? (
                <ActivityIndicator color="#1a2332" />
              ) : (
                <>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: 'bold',
                      color: '#1a2332',
                      marginRight: 8,
                    }}
                  >
                    Continue with OTP
                  </Text>
                  <ArrowRight color="#1a2332" size={20} />
                </>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 8,
              }}
            >
              <View
                style={{ flex: 1, height: 1, backgroundColor: '#e2e8f0' }}
              />
              <Text
                style={{
                  paddingHorizontal: 16,
                  color: '#94a3b8',
                  fontWeight: '500',
                  fontSize: 14,
                }}
              >
                OR
              </Text>
              <View
                style={{ flex: 1, height: 1, backgroundColor: '#e2e8f0' }}
              />
            </View>

            {/* Google Login */}
            <TouchableOpacity
              onPress={initiateGoogleLogin}
              disabled={loading}
              style={{
                backgroundColor: '#ffffff',
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: '#e2e8f0',
                marginTop: 8,
                flexDirection: 'row',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: '#1a2332',
                }}
              >
                Continue with Google
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {/* OTP Input */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: '#475569',
                  marginBottom: 8,
                }}
              >
                6-Digit Code
              </Text>
              <View
                style={{
                  backgroundColor: '#ffffff',
                  borderWidth: 1,
                  borderColor: '#e2e8f0',
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  height: 60,
                  justifyContent: 'center',
                }}
              >
                <TextInput
                  placeholder="000000"
                  placeholderTextColor="#94a3b8"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                  style={{
                    fontSize: 28,
                    letterSpacing: 12,
                    textAlign: 'center',
                    fontWeight: 'bold',
                    color: '#1a2332',
                  }}
                />
              </View>
            </View>

            {/* Verify Button */}
            <TouchableOpacity
              onPress={verifyOtp}
              disabled={loading}
              style={{
                backgroundColor: loading ? '#94a3b8' : '#FFB800',
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                marginTop: 8,
              }}
            >
              {loading ? (
                <ActivityIndicator color="#1a2332" />
              ) : (
                <>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: 'bold',
                      color: '#1a2332',
                      marginRight: 8,
                    }}
                  >
                    Verify & Login
                  </Text>
                  <CheckCircle2 color="#1a2332" size={20} />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setStep('EMAIL')}
              style={{
                paddingVertical: 16,
                alignItems: 'center',
                marginTop: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#FFB800',
                }}
              >
                Use a different email
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
