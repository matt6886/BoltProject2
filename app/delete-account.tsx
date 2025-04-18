import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Logo } from '../components/Logo';
import { ThemeContext } from '../components/ThemeProvider';
import { useFonts, Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Platform } from 'react-native';
import { useAuthStore } from '../store/auth';
import { deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

export default function DeleteAccountScreen() {
  const { theme } = useContext(ThemeContext);
  const { user } = useAuthStore();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
  });

  const handleBack = () => {
    router.back();
  };

  const handleDeleteAccount = async () => {
    if (!password) {
      setErrorMessage("Veuillez saisir votre mot de passe");
      return;
    }

    if (!user || !user.email) {
      setErrorMessage("Information utilisateur manquante");
      return;
    }

    try {
      setIsDeleting(true);
      setErrorMessage(null);
      
      // Réauthentifier l'utilisateur avant de supprimer le compte
      const authCredential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, authCredential);
      
      // Supprimer le compte
      await deleteUser(user);
      
      Alert.alert(
        "Compte supprimé",
        "Votre compte a été supprimé avec succès",
        [{ 
          text: "OK",
          onPress: () => router.replace('/auth/sign-in')
        }]
      );
    } catch (error) {
      console.error('Error deleting account:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('auth/wrong-password')) {
          setErrorMessage("Mot de passe incorrect");
        } else if (error.message.includes('auth/too-many-requests')) {
          setErrorMessage("Trop de tentatives. Veuillez réessayer plus tard");
        } else if (error.message.includes('auth/requires-recent-login')) {
          setErrorMessage("Pour des raisons de sécurité, veuillez vous reconnecter avant de supprimer votre compte");
        } else {
          setErrorMessage("Une erreur est survenue. Veuillez réessayer");
        }
      } else {
        setErrorMessage("Une erreur est survenue. Veuillez réessayer");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <ChevronLeft size={24} color={theme.primary} />
        </Pressable>
        <Logo />
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.error }]}>
          Supprimer le compte
        </Text>
        
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          Cette action est irréversible. Toutes vos données seront définitivement supprimées. Pour confirmer, veuillez entrer votre mot de passe.
        </Text>

        <View style={styles.formContainer}>
          <Text style={[styles.label, { color: theme.text }]}>
            Mot de passe
          </Text>
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: theme.card,
                borderColor: errorMessage ? theme.error : theme.border,
                color: theme.text
              }
            ]}
            placeholder="Entrez votre mot de passe"
            placeholderTextColor={theme.textSecondary}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          
          {errorMessage && (
            <Text style={[styles.errorText, { color: theme.error }]}>
              {errorMessage}
            </Text>
          )}

          <View style={styles.buttonContainer}>
            <Pressable
              style={[styles.cancelButton, { borderColor: theme.border }]}
              onPress={handleBack}
              disabled={isDeleting}
            >
              <Text style={[styles.cancelButtonText, { color: theme.text }]}>
                Annuler
              </Text>
            </Pressable>
            
            <Pressable
              style={[
                styles.deleteButton,
                { backgroundColor: theme.error },
                isDeleting && styles.buttonDisabled
              ]}
              onPress={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.deleteButtonText}>
                  Supprimer
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 24,
    marginBottom: 16,
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 32,
  },
  formContainer: {
    marginTop: 16,
  },
  label: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  deleteButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  deleteButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: 16,
  },
});