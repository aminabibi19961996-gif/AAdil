import React, { useState } from 'react';
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
import { Mail, Lock, User, Smartphone, ArrowRight, CheckCircle2 } from 'lucide-react-native';

if (Platform.OS !== 'web') {
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    scopes: ['profile', 'email'],
  });
}

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState('SIGNIN'); // 'SIGNIN' | 'SIGNUP'
  const [authMethod, setAuthMethod] = useState('PASSWORD'); // 'PASSWORD' | 'OTP'
  const [step, setStep] = useState('FORM'); // 'FORM' | 'OTP_VERIFY'

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const showErrorDetails = (title, message, error) => {
    const details = [
      error.code && `Code: ${error.code}`,
      error.message && `Message: ${error.message}`,
      error.status && `Status: ${error.status}`,
      error.statusCode && `StatusCode: ${error.statusCode}`,
    ].filter(Boolean).join('\n');

    Alert.alert(title, message, [
      { text: 'OK', style: 'cancel' },
      { text: 'Show Details', onPress: () => Alert.alert('Error Details', details || 'No details available') },
    ]);
  };

  const resetForm = () => {
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setOtp('');
    setStep('FORM');
    setAuthMethod('PASSWORD');
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    resetForm();
  };

  // ─── Email + Password Sign In ─────────────────────────
  const handlePasswordSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Missing Information', 'Please enter email and password.');
      return;
    }
    setLoading(true);
    try {
      if (__DEV__) console.log('[Password Auth] Signing in:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) {
        if (__DEV__) console.error('[Password Auth] Error:', JSON.stringify(error, null, 2));
        if (error.message?.includes('Invalid login')) {
          Alert.alert('Login Failed', 'Invalid email or password. Please try again.');
        } else if (error.message?.includes('Email not confirmed')) {
          Alert.alert('Email Not Confirmed', 'Please check your email and click the confirmation link before signing in.');
        } else {
          showErrorDetails('Login Failed', error.message || 'Could not sign in.', error);
        }
        return;
      }
      if (__DEV__) console.log('[Password Auth] SUCCESS! Session:', !!data?.session);
    } catch (error) {
      if (__DEV__) console.error('[Password Auth] CATCH:', error.message);
      Alert.alert('Login Error', error.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Email + Password Sign Up ─────────────────────────
  const handlePasswordSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Missing Information', 'Please enter email and password.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      if (__DEV__) console.log('[SignUp] Creating account for:', email);
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName.trim() || undefined,
          },
        },
      });
      if (error) {
        if (__DEV__) console.error('[SignUp] Error:', JSON.stringify(error, null, 2));
        showErrorDetails('Sign Up Failed', error.message || 'Could not create account.', error);
        return;
      }

      if (__DEV__) console.log('[SignUp] Response — session:', !!data?.session, '| user:', !!data?.user);

      if (data?.session) {
        // Auto-confirmed (email confirmation disabled in Supabase)
        if (__DEV__) console.log('[SignUp] SUCCESS! Auto-signed in.');
        Alert.alert('Account Created', 'Welcome! Your account has been created successfully.');
      } else if (data?.user) {
        // Confirmation email sent
        Alert.alert(
          'Check Your Email',
          'We sent a confirmation link to ' + email + '. Please confirm your email, then sign in.',
          [{ text: 'OK', onPress: () => switchMode('SIGNIN') }]
        );
      }
    } catch (error) {
      if (__DEV__) console.error('[SignUp] CATCH:', error.message);
      Alert.alert('Sign Up Error', error.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  // ─── OTP ──────────────────────────────────────────────
  const sendOtp = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    setLoading(true);
    try {
      if (__DEV__) console.log('[OTP Auth] Sending OTP to:', email);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: undefined,
        },
      });
      if (error) {
        if (__DEV__) console.error('[OTP Auth] sendOtp error:', JSON.stringify(error, null, 2));
        throw error;
      }
      if (__DEV__) console.log('[OTP Auth] OTP sent successfully');
      setStep('OTP_VERIFY');
    } catch (error) {
      if (__DEV__) console.error('[OTP Auth] CATCH:', error.message);
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
      if (__DEV__) console.log('[OTP Auth] Verifying OTP for:', email);
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });
      if (error) {
        if (__DEV__) console.error('[OTP Auth] verifyOtp error:', JSON.stringify(error, null, 2));
        throw error;
      }
      if (__DEV__) {
        console.log('[OTP Auth] SUCCESS! Session:', !!data?.session);
        console.log('[OTP Auth] User email:', data?.session?.user?.email);
      }
    } catch (error) {
      if (__DEV__) console.error('[OTP Auth] CATCH:', error.message);
      Alert.alert('Error verifying OTP', error.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Google ───────────────────────────────────────────
  const initiateGoogleLogin = async () => {
    try {
      setLoading(true);
      if (Platform.OS === 'web') {
        if (__DEV__) console.log('[Google Auth] Starting web OAuth flow');
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        if (__DEV__) console.log('[Google Auth] Web OAuth initiated, redirecting...');
      } else {
        if (__DEV__) console.log('[Google Auth] Step 1/4: Checking Play Services...');
        await GoogleSignin.hasPlayServices();
        if (__DEV__) console.log('[Google Auth] Step 2/4: Play Services OK. Calling signIn()...');

        const response = await GoogleSignin.signIn();
        if (__DEV__) console.log('[Google Auth] Step 2/4: signIn() returned. Keys:', Object.keys(response || {}));
        if (__DEV__) console.log('[Google Auth] Step 2/4: response.data keys:', Object.keys(response?.data || {}));

        const idToken = response?.data?.idToken || response?.idToken;

        if (__DEV__) console.log('[Google Auth] Step 3/4: idToken present:', !!idToken, '| length:', idToken?.length || 0);

        if (!idToken) {
          if (__DEV__) console.error('[Google Auth] FAILED: No idToken. Full response:', JSON.stringify(response, null, 2));
          throw new Error('No ID token received from Google. This usually means the Google Console SHA-1 fingerprint does not match the app signing key.');
        }

        if (__DEV__) console.log('[Google Auth] Step 4/4: Sending idToken to Supabase signInWithIdToken...');
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: idToken,
        });

        if (error) {
          if (__DEV__) console.error('[Google Auth] FAILED at Supabase:', JSON.stringify(error, null, 2));
          showErrorDetails(
            'Login Failed',
            error.message || 'Could not complete Google sign-in. Please try again.',
            error
          );
          return;
        }

        if (__DEV__) {
          console.log('[Google Auth] SUCCESS! Session:', !!data?.session);
          console.log('[Google Auth] User email:', data?.session?.user?.email);
          console.log('[Google Auth] Provider:', data?.session?.user?.app_metadata?.provider);
        }
      }
    } catch (error) {
      if (__DEV__) console.error('[Google Auth] CATCH block error:', JSON.stringify(error, null, 2));
      if (__DEV__) console.error('[Google Auth] Error code:', error.code, '| message:', error.message);

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        if (__DEV__) console.log('[Google Auth] User cancelled sign-in');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        if (__DEV__) console.log('[Google Auth] Sign-in already in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Error', 'Google Play Services are not available on this device.');
      } else {
        showErrorDetails(
          'Google Sign-In Error',
          error.message || 'Something went wrong. Please try again.',
          error
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── OTP Verify Screen ────────────────────────────────
  if (step === 'OTP_VERIFY') {
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
              <Mail color="#FFB800" size={40} strokeWidth={1.5} />
            </View>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1a2332', marginBottom: 8 }}>
              Verify OTP
            </Text>
            <Text style={{ fontSize: 16, color: '#64748b', textAlign: 'center', lineHeight: 22 }}>
              Enter the code we sent to {email}
            </Text>
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8 }}>
              Verification Code
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
                placeholder="00000000"
                placeholderTextColor="#94a3b8"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={8}
                style={{
                  fontSize: 24,
                  letterSpacing: 8,
                  textAlign: 'center',
                  fontWeight: 'bold',
                  color: '#1a2332',
                }}
              />
            </View>
          </View>

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
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1a2332', marginRight: 8 }}>
                  Verify & Login
                </Text>
                <CheckCircle2 color="#1a2332" size={20} />
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => { setStep('FORM'); setOtp(''); }}
            style={{ paddingVertical: 16, alignItems: 'center', marginTop: 8 }}
          >
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#FFB800' }}>
              Use a different email
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ─── Main Sign In / Sign Up Screen ────────────────────
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
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
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
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1a2332', marginBottom: 8 }}>
            {mode === 'SIGNIN' ? 'Welcome Back' : 'Create Account'}
          </Text>
          <Text style={{ fontSize: 16, color: '#64748b', textAlign: 'center', lineHeight: 22 }}>
            {mode === 'SIGNIN'
              ? 'Sign in to your account'
              : 'Join us to start booking cranes & trucks'}
          </Text>
        </View>

        {/* Sign In / Sign Up Tabs */}
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: '#e2e8f0',
            borderRadius: 12,
            padding: 4,
            marginBottom: 24,
          }}
        >
          <TouchableOpacity
            onPress={() => switchMode('SIGNIN')}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 10,
              alignItems: 'center',
              backgroundColor: mode === 'SIGNIN' ? '#ffffff' : 'transparent',
              shadowColor: mode === 'SIGNIN' ? '#000' : 'transparent',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: mode === 'SIGNIN' ? 0.1 : 0,
              shadowRadius: 2,
              elevation: mode === 'SIGNIN' ? 2 : 0,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: mode === 'SIGNIN' ? '#1a2332' : '#64748b',
              }}
            >
              Sign In
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => switchMode('SIGNUP')}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 10,
              alignItems: 'center',
              backgroundColor: mode === 'SIGNUP' ? '#ffffff' : 'transparent',
              shadowColor: mode === 'SIGNUP' ? '#000' : 'transparent',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: mode === 'SIGNUP' ? 0.1 : 0,
              shadowRadius: 2,
              elevation: mode === 'SIGNUP' ? 2 : 0,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: mode === 'SIGNUP' ? '#1a2332' : '#64748b',
              }}
            >
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        {/* ═══ SIGN IN MODE ═══ */}
        {mode === 'SIGNIN' && (
          <View>
            {/* Auth method toggle (Password / OTP) */}
            {authMethod === 'PASSWORD' ? (
              <View>
                {/* Email */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8 }}>
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
                      style={{ flex: 1, marginLeft: 12, fontSize: 16, color: '#1a2332' }}
                    />
                  </View>
                </View>

                {/* Password */}
                <View style={{ marginBottom: 8 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8 }}>
                    Password
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
                    <Lock color="#94a3b8" size={20} />
                    <TextInput
                      placeholder="Enter password"
                      placeholderTextColor="#94a3b8"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      style={{ flex: 1, marginLeft: 12, fontSize: 16, color: '#1a2332' }}
                    />
                  </View>
                </View>

                {/* Use OTP link */}
                <TouchableOpacity
                  onPress={() => { setAuthMethod('OTP'); setPassword(''); }}
                  style={{ alignSelf: 'flex-end', paddingVertical: 8, marginBottom: 8 }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#FFB800' }}>
                    Use OTP instead
                  </Text>
                </TouchableOpacity>

                {/* Sign In Button */}
                <TouchableOpacity
                  onPress={handlePasswordSignIn}
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
                      <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1a2332', marginRight: 8 }}>
                        Sign In
                      </Text>
                      <ArrowRight color="#1a2332" size={20} />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              /* OTP Auth Method */
              <View>
                {/* Email */}
                <View style={{ marginBottom: 8 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8 }}>
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
                      style={{ flex: 1, marginLeft: 12, fontSize: 16, color: '#1a2332' }}
                    />
                  </View>
                </View>

                {/* Use Password link */}
                <TouchableOpacity
                  onPress={() => { setAuthMethod('PASSWORD'); setOtp(''); }}
                  style={{ alignSelf: 'flex-end', paddingVertical: 8, marginBottom: 8 }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#FFB800' }}>
                    Use password instead
                  </Text>
                </TouchableOpacity>

                {/* Send OTP Button */}
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
                      <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1a2332', marginRight: 8 }}>
                        Send OTP
                      </Text>
                      <ArrowRight color="#1a2332" size={20} />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* Divider */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: '#e2e8f0' }} />
              <Text style={{ paddingHorizontal: 16, color: '#94a3b8', fontWeight: '500', fontSize: 14 }}>
                OR
              </Text>
              <View style={{ flex: 1, height: 1, backgroundColor: '#e2e8f0' }} />
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
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#1a2332' }}>
                Continue with Google
              </Text>
            </TouchableOpacity>

            {/* Switch to Sign Up */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24 }}>
              <Text style={{ fontSize: 15, color: '#64748b' }}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => switchMode('SIGNUP')}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#FFB800' }}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ═══ SIGN UP MODE ═══ */}
        {mode === 'SIGNUP' && (
          <View>
            {/* Full Name */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8 }}>
                Full Name
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
                <User color="#94a3b8" size={20} />
                <TextInput
                  placeholder="Enter your full name"
                  placeholderTextColor="#94a3b8"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                  style={{ flex: 1, marginLeft: 12, fontSize: 16, color: '#1a2332' }}
                />
              </View>
            </View>

            {/* Email */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8 }}>
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
                  style={{ flex: 1, marginLeft: 12, fontSize: 16, color: '#1a2332' }}
                />
              </View>
            </View>

            {/* Password */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8 }}>
                Password
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
                <Lock color="#94a3b8" size={20} />
                <TextInput
                  placeholder="Min. 6 characters"
                  placeholderTextColor="#94a3b8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  style={{ flex: 1, marginLeft: 12, fontSize: 16, color: '#1a2332' }}
                />
              </View>
            </View>

            {/* Confirm Password */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8 }}>
                Confirm Password
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
                <Lock color="#94a3b8" size={20} />
                <TextInput
                  placeholder="Re-enter password"
                  placeholderTextColor="#94a3b8"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  style={{ flex: 1, marginLeft: 12, fontSize: 16, color: '#1a2332' }}
                />
              </View>
            </View>

            {/* Create Account Button */}
            <TouchableOpacity
              onPress={handlePasswordSignUp}
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
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1a2332', marginRight: 8 }}>
                    Create Account
                  </Text>
                  <ArrowRight color="#1a2332" size={20} />
                </>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: '#e2e8f0' }} />
              <Text style={{ paddingHorizontal: 16, color: '#94a3b8', fontWeight: '500', fontSize: 14 }}>
                OR
              </Text>
              <View style={{ flex: 1, height: 1, backgroundColor: '#e2e8f0' }} />
            </View>

            {/* Google Sign Up */}
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
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#1a2332' }}>
                Continue with Google
              </Text>
            </TouchableOpacity>

            {/* Switch to Sign In */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24 }}>
              <Text style={{ fontSize: 15, color: '#64748b' }}>Already have an account? </Text>
              <TouchableOpacity onPress={() => switchMode('SIGNIN')}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#FFB800' }}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
