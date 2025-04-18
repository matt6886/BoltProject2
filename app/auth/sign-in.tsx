import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Pressable, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useFonts, Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, ArrowRight } from 'lucide-react-native';
import { useAuthStore } from '../../store/auth';
import { Logo } from '../../components/Logo';
import { ThemeContext } from '../../components/ThemeProvider';
import { t } from '../../utils/i18n';

export default function SignInScreen() {
  const [email, setEmail] = useState('jeanvalere4b@gmail.com');
  const [password, setPassword] = useState('JeanValere06');
  const router = useRouter();
  
  const { signIn, loading, error } = useAuthStore();
  const { theme } = useContext(ThemeContext);
  
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
  });

  const handleSignIn = async () => {
    try {
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch (error) {
      // Error is handled by the store
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.background }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
      <LinearGradient
        colors={[theme.background, theme.backgroundSecondary, theme.backgroundSecondary]}
        style={StyleSheet.absoluteFill}
      />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Logo />
          <Text style={[styles.title, { color: theme.text }]}>{t('auth.signIn')}</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Connectez-vous pour accéder à votre compte WashP
          </Text>
        </View>

        <View style={styles.form}>
          <View style={[styles.inputContainer, { backgroundColor: theme.card }]}>
            <View style={styles.inputIcon}>
              <Mail size={20} color={theme.primary} />
            </View>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder={t('auth.email')}
              placeholderTextColor={theme.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
            />
          </View>

          <View style={[styles.inputContainer, { backgroundColor: theme.card }]}>
            <View style={styles.inputIcon}>
              <Lock size={20} color={theme.primary} />
            </View>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder={t('auth.password')}
              placeholderTextColor={theme.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="current-password"
            />
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Pressable 
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignIn}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.buttonText}>{t('auth.signIn')}</Text>
                <ArrowRight size={20} color="#FFFFFF" />
              </>
            )}
          </Pressable>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
              {t('auth.noAccount')}
            </Text>
            <Link href="/auth/sign-up" asChild>
              <Pressable>
                <Text style={[styles.footerLink, { color: theme.primary }]}>{t('auth.signUp')}</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 24,
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
    maxWidth: '80%',
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3A8DFF',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 8,
    gap: 8,
    shadowColor: '#3A8DFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  errorContainer: {
    backgroundColor: '#FFE8E8',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#FF4444',
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 8,
  },
  footerText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  footerLink: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
});