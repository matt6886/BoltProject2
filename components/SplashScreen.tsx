import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Logo } from './Logo';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  withRepeat, 
  withSequence,
  withDelay
} from 'react-native-reanimated';

export function SplashScreen() {
  const pulseStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withRepeat(
            withSequence(
              withSpring(1, { damping: 20, stiffness: 90 }),
              withDelay(
                800,
                withSpring(1.05, { damping: 20, stiffness: 90 })
              )
            ),
            -1,
            true
          ),
        },
      ],
    };
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFFFFF', '#F8FBFF', '#F0F7FF']}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View style={[styles.logoContainer, pulseStyle]}>
        <Logo />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    transform: Platform.select({
      web: [{ scale: 1.5 }],
      default: [{ scale: 1.2 }]
    }),
  },
});