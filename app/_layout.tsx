import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '../components/AuthProvider';
import { ThemeProvider } from '../components/ThemeProvider';
import { LanguageProvider } from '../components/LanguageProvider';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { View } from 'react-native';
import { SplashScreen as CustomSplashScreen } from '../components/SplashScreen';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
  });

  useFrameworkReady();

  useEffect(() => {
    window.frameworkReady?.();
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Hide the native splash screen after a delay
      setTimeout(() => {
        SplashScreen.hideAsync();
      }, 2000);
    }
  }, [fontsLoaded, fontError]);

  // Show custom splash screen while fonts are loading
  if (!fontsLoaded && !fontError) {
    return <CustomSplashScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LanguageProvider>
        <ThemeProvider>
          <AuthProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen 
                name="auth" 
                options={{ 
                  headerShown: false,
                  gestureEnabled: false 
                }} 
              />
              <Stack.Screen 
                name="(tabs)" 
                options={{ 
                  headerShown: false,
                  gestureEnabled: false 
                }} 
              />
              <Stack.Screen name="terms" />
              <Stack.Screen name="privacy" />
              <Stack.Screen name="faq" />
              <Stack.Screen name="support" />
              <Stack.Screen name="delete-account" />
              <Stack.Screen name="+not-found" options={{ title: 'Oops!' }} />
            </Stack>
            <StatusBar style="auto" />
          </AuthProvider>
        </ThemeProvider>
      </LanguageProvider>
    </GestureHandlerRootView>
  );
}