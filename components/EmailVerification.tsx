import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/auth';
import { Mail } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export function EmailVerification() {
  const { user, sendVerificationEmail } = useAuthStore();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResend = async () => {
    try {
      setSending(true);
      setError(null);
      await sendVerificationEmail();
      setSent(true);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Une erreur est survenue');
      }
    } finally {
      setSending(false);
    }
  };

  if (!user || user.emailVerified) {
    return null;
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(255, 247, 237, 0.95)', 'rgba(255, 237, 213, 0.95)']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Mail size={24} color="#FB923C" />
          </View>
          
          <View style={styles.textContainer}>
            <Text style={styles.title}>Vérifiez votre email</Text>
            <Text style={styles.description}>
              Un email de vérification a été envoyé à {user.email}.
              Veuillez cliquer sur le lien dans l'email pour activer votre compte.
            </Text>
          </View>

          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          <Pressable
            style={[styles.button, sending && styles.buttonDisabled]}
            onPress={handleResend}
            disabled={sending || sent}>
            {sending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>
                {sent ? 'Email envoyé' : 'Renvoyer l\'email'}
              </Text>
            )}
          </Pressable>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 16,
    zIndex: 1000,
  },
  gradient: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  content: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(251, 146, 60, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FB923C',
    marginBottom: 4,
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#FB923C',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#EF4444',
    marginTop: 8,
  },
});