import { Tabs } from 'expo-router';
import { History, ScanLine, User } from 'lucide-react-native';
import { View, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useContext } from 'react';
import { ThemeContext } from '../../components/ThemeProvider';
import { t } from '../../utils/i18n';

export default function TabLayout() {
  const { theme, isDarkMode } = useContext(ThemeContext);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 16,
          left: 16,
          right: 16,
          backgroundColor: isDarkMode ? 'rgba(26, 26, 26, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          borderTopWidth: 0,
          height: 56,
          paddingBottom: Platform.OS === 'ios' ? 8 : 0,
          paddingHorizontal: 8,
          borderRadius: 28,
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          shadowColor: theme.cardShadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDarkMode ? 0.3 : 0.1,
          shadowRadius: 12,
          elevation: 8,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : '#A3D5FF',
        tabBarLabelStyle: {
          fontFamily: 'Inter-Regular',
          fontSize: 11,
          marginBottom: Platform.OS === 'ios' ? 0 : 4,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.history'),
          tabBarIcon: ({ color, focused }) => (
            <View style={[
              styles.tabIcon,
              focused && [styles.tabIconActive, { backgroundColor: isDarkMode ? 'rgba(58, 141, 255, 0.15)' : 'rgba(234, 246, 255, 0.8)' }]
            ]}>
              <History size={22} color={color} />
            </View>
          ),
          href: '/',
        }}
      />
      <Tabs.Screen
        name="analyze"
        options={{
          title: t('tabs.analyze'),
          tabBarIcon: ({ color }) => (
            <View style={styles.scanButtonContainer}>
              <LinearGradient
                colors={['#3D5AFE', '#40B3FF']}
                style={styles.scanButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}>
                <ScanLine size={22} color="#FFFFFF" />
              </LinearGradient>
            </View>
          ),
          tabBarLabel: () => null,
          href: '/analyze',
          tabBarStyle: { display: 'none' }
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color, focused }) => (
            <View style={[
              styles.tabIcon,
              focused && [styles.tabIconActive, { backgroundColor: isDarkMode ? 'rgba(58, 141, 255, 0.15)' : 'rgba(234, 246, 255, 0.8)' }]
            ]}>
              <User size={22} color={color} />
            </View>
          ),
          href: '/profile',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    padding: 8,
    borderRadius: 12,
  },
  tabIconActive: {
    backgroundColor: 'rgba(234, 246, 255, 0.8)',
  },
  scanButtonContainer: {
    width: 42,
    height: 42,
    marginBottom: 0,
    borderRadius: 21,
    shadowColor: '#3D5AFE',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  scanButton: {
    width: '100%',
    height: '100%',
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#40B3FF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});