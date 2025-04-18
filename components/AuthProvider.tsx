import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useAuthStore } from '../store/auth';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Clé pour stockage de l'état d'authentification
const AUTH_STATE_KEY = 'washp_auth_state';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const segments = useSegments();
  const router = useRouter();
  const { user, loading, setLoading } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const checkAuthState = async () => {
      try {
        // Pour les plateformes mobiles, on vérifie l'état stocké localement
        if (Platform.OS !== 'web') {
          const savedAuthState = await AsyncStorage.getItem(AUTH_STATE_KEY);
          if (savedAuthState === 'true' && !auth.currentUser) {
            // L'utilisateur était authentifié, mais Firebase ne l'a pas encore chargé
            // On attend que Firebase confirme l'authentification via onAuthStateChanged
            return;
          }
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
      }
    };

    checkAuthState();

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        useAuthStore.setState({ user: firebaseUser });
        setLoading(false);
        setIsInitialized(true);
      },
      (error) => {
        console.error('Auth state change error:', error);
        setLoading(false);
        setIsInitialized(true);
      }
    );

    return unsubscribe;
  }, [setLoading]);

  useEffect(() => {
    if (!isInitialized || loading) return;

    const inAuthGroup = segments[0] === 'auth';
    const isPublicRoute = segments[0] === 'terms' || segments[0] === 'privacy';
    
    if (!user && !inAuthGroup && !isPublicRoute) {
      // Redirect to sign-in if user is not signed in and trying to access protected screens
      router.replace('/auth/sign-in');
    } else if (user && inAuthGroup) {
      // Redirect to home if user is signed in and trying to access auth screens
      router.replace('/(tabs)');
    }
  }, [user, segments, loading, isInitialized, router]);

  if (!isInitialized || loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#FFFFFF', '#F8FBFF', '#F0F7FF']}
          style={StyleSheet.absoluteFill}
        />
        <ActivityIndicator size="large" color="#3A8DFF" />
      </View>
    );
  }

  return children;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});