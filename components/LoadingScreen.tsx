import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Scan, Shirt, WashingMachine, FlaskRound as Flask } from 'lucide-react-native';
import Animated, { 
  useAnimatedStyle, 
  withRepeat, 
  withSequence,
  withTiming,
  withDelay,
  Easing,
  useSharedValue,
} from 'react-native-reanimated';
import { useContext } from 'react';
import { ThemeContext } from './ThemeProvider';
import { t } from '../utils/i18n';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BUBBLE_COUNT = 8;
const ICON_DURATION = 1500;

const ICONS = [
  { component: Scan, label: 'analyze.analyzing' },
  { component: Shirt, label: 'analyze.identification' },
  { component: WashingMachine, label: 'analyze.program' },
  { component: Flask, label: 'analyze.detergent' }
];

export function LoadingScreen() {
  const [currentIconIndex, setCurrentIconIndex] = React.useState(0);
  const fadeAnim = useSharedValue(1);
  const scaleAnim = useSharedValue(1);
  const { theme, isDarkMode } = useContext(ThemeContext);

  React.useEffect(() => {
    const animate = async () => {
      const nextIndex = (currentIconIndex + 1) % ICONS.length;
      fadeAnim.value = withSequence(
        withTiming(0, { 
          duration: ICON_DURATION / 2,
          easing: Easing.bezier(0.4, 0, 0.2, 1)
        }),
        withTiming(1, { 
          duration: ICON_DURATION / 2,
          easing: Easing.bezier(0.4, 0, 0.2, 1)
        })
      );
      scaleAnim.value = withSequence(
        withTiming(0.8, { 
          duration: ICON_DURATION / 2,
          easing: Easing.bezier(0.4, 0, 0.2, 1)
        }),
        withTiming(1, { 
          duration: ICON_DURATION / 2,
          easing: Easing.bezier(0.4, 0, 0.2, 1)
        })
      );
      setTimeout(() => {
        setCurrentIconIndex(nextIndex);
      }, ICON_DURATION / 2);
    };

    const interval = setInterval(animate, ICON_DURATION);
    return () => clearInterval(interval);
  }, [currentIconIndex]);

  const iconStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ scale: scaleAnim.value }]
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1000, easing: Easing.bezier(0.4, 0, 0.2, 1) }),
        withTiming(0.4, { duration: 1000, easing: Easing.bezier(0.4, 0, 0.2, 1) })
      ),
      -1,
      true
    ),
  }));

  const dotsStyle = useAnimatedStyle(() => ({
    opacity: withRepeat(
      withSequence(
        withTiming(1, { duration: 600 }),
        withDelay(200, withTiming(0.3, { duration: 600 }))
      ),
      -1,
      true
    ),
  }));

  const renderBubbles = () => {
    return Array.from({ length: BUBBLE_COUNT }).map((_, index) => {
      const delay = index * 500;
      const duration = 3000 + Math.random() * 1000;
      const initialScale = 0.3 + Math.random() * 0.3;
      const finalScale = 0.6 + Math.random() * 0.4;
      
      const angle = (Math.PI * 2 * index) / BUBBLE_COUNT;
      const radius = 30 + Math.random() * 20;
      const startX = Math.cos(angle) * radius;
      const startY = Math.sin(angle) * radius;

      const bubbleStyle = useAnimatedStyle(() => ({
        transform: [
          { 
            translateX: withRepeat(
              withDelay(
                delay,
                withSequence(
                  withTiming(startX, { duration: 0 }),
                  withTiming(startX + (Math.random() * 100 - 50), { 
                    duration: duration,
                    easing: Easing.bezier(0.4, 0, 0.2, 1)
                  })
                )
              ),
              -1,
              true
            )
          },
          { 
            translateY: withRepeat(
              withDelay(
                delay,
                withSequence(
                  withTiming(startY, { duration: 0 }),
                  withTiming(-150 - Math.random() * 50, {
                    duration: duration,
                    easing: Easing.bezier(0.4, 0, 0.2, 1)
                  })
                )
              ),
              -1,
              true
            )
          },
          {
            scale: withRepeat(
              withDelay(
                delay,
                withSequence(
                  withTiming(initialScale, { duration: 0 }),
                  withTiming(finalScale, { 
                    duration: duration,
                    easing: Easing.bezier(0.4, 0, 0.2, 1)
                  })
                )
              ),
              -1,
              true
            )
          }
        ],
        opacity: withRepeat(
          withDelay(
            delay,
            withSequence(
              withTiming(0, { duration: 0 }),
              withTiming(0.8, { duration: duration * 0.3 }),
              withTiming(0, { duration: duration * 0.7 })
            )
          ),
          -1,
          true
        ),
      }));

      return (
        <Animated.View key={index} style={[styles.bubble, bubbleStyle]}>
          <LinearGradient
            colors={['#3D5AFE', '#40B3FF']}
            style={styles.bubbleGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>
      );
    });
  };

  const CurrentIcon = ICONS[currentIconIndex].component;

  return (
    <View style={styles.overlay}>
      <LinearGradient
        colors={isDarkMode ? [
          'rgba(13, 13, 13, 0.95)',
          'rgba(13, 13, 13, 0.98)',
          'rgba(13, 13, 13, 0.99)'
        ] : [
          'rgba(255, 255, 255, 0.95)',
          'rgba(255, 255, 255, 0.98)',
          'rgba(255, 255, 255, 0.99)'
        ]}
        style={StyleSheet.absoluteFill}
      />
      
      <View style={styles.content}>
        <View style={styles.iconWrapper}>
          {renderBubbles()}
          <Animated.View style={[styles.glow, glowStyle]} />
          <Animated.View style={[styles.iconContainer, iconStyle]}>
            <LinearGradient
              colors={['#3D5AFE', '#40B3FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconGradient}>
              <CurrentIcon size={48} color="#FFFFFF" strokeWidth={1.5} />
            </LinearGradient>
          </Animated.View>
        </View>

        <View style={styles.textContainer}>
          <Text style={[styles.message, { color: theme.text }]}>
            {t(ICONS[currentIconIndex].label)}
          </Text>
          <Animated.Text style={[styles.dots, dotsStyle, { color: theme.text }]}>
            ...
          </Animated.Text>
        </View>

        <Text style={[styles.subtitle, { color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)' }]}>
          {t('analyze.aiAnalysisDescription')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    alignItems: 'center',
    padding: 24,
    width: '100%',
  },
  iconWrapper: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  bubble: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  bubbleGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  glow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#3D5AFE',
    opacity: 0.15,
    filter: 'blur(20px)',
  },
  iconContainer: {
    shadowColor: '#3D5AFE',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  iconGradient: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  message: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 24,
    textShadowColor: 'rgba(61, 90, 254, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  dots: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 24,
    marginLeft: 2,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 24,
  },
});