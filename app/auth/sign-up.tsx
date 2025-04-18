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
import { Mail, Lock, User, ArrowRight } from 'lucide-react-native';
import { useAuthStore } from '../../store/auth';
import { Logo } from '../../components/Logo';
import { ThemeContext } from '../../components/ThemeProvider';
import { Checkbox } from '../../components/Checkbox';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const router = useRouter();
  
  const { signUp, loading, error } = useAuthStore();
  const { theme } = useContext(ThemeContext);
  
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
  });

  const handleSignUp = async () => {
    if (!consent) {
      setConsentError(true);
      return;
    }
    
    try {
      await signUp(email, password, name);
      router.replace('/(tabs)');
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleNavigate = (path: string) => {
    router.push(path);
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
          <Text style={[styles.title, { color: theme.text }]}>Créer un compte</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Rejoignez WashP pour prendre soin de vos vêtements intelligemment
          </Text>
        </View>

        <View style={styles.form}>
          <View style={[styles.inputContainer, { backgroundColor: theme.card }]}>
            <View style={styles.inputIcon}>
              <User size={20} color={theme.primary} />
            </View>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Votre nom"
              placeholderTextColor={theme.textSecondary}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoComplete="name"
            />
          </View>

          <View style={[styles.inputContainer, { backgroundColor: theme.card }]}>
            <View style={styles.inputIcon}>
              <Mail size={20} color={theme.primary} />
            </View>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Votre email"
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
              placeholder="Votre mot de passe"
              placeholderTextColor={theme.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="new-password"
            />
          </View>

          <View style={styles.consentContainer}>
            <Checkbox
              checked={consent}
              onValueChange={(value) => {
                setConsent(value);
                setConsentError(false);
              }}
            />
            <Text style={[styles.consentText, { color: theme.text }]}>
              J'accepte les{' '}
              <Text 
                style={styles.link}
                onPress={() => handleNavigate('/terms')}>
                conditions d'utilisation
              </Text>
              {' '}et la{' '}
              <Text 
                style={styles.link}
                onPress={() => handleNavigate('/privacy')}>
                politique de confidentialité
              </Text>
            </Text>
          </View>

          {consentError && (
            <Text style={styles.consentErrorText}>
              Veuillez accepter les conditions d'utilisation pour continuer
            </Text>
          )}

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Pressable 
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignUp}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.buttonText}>S'inscrire</Text>
                <ArrowRight size={20} color="#FFFFFF" />
              </>
            )}
          </Pressable>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
              Déjà un compte ?
            </Text>
            <Link href="/auth/sign-in" asChild>
              <Pressable>
                <Text style={[styles.footerLink, { color: theme.primary }]}>Se connecter</Text>
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
  consentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 8,
  },
  consentText: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  link: {
    color: '#3A8DFF',
    textDecorationLine: 'underline',
  },
  consentErrorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#FF4444',
    marginTop: 4,
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