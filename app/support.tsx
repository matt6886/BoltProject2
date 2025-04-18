import React, { useContext } from 'react';
import { View, Text, StyleSheet, Pressable, Linking, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Mail, MessageSquare } from 'lucide-react-native';
import { Logo } from '../components/Logo';
import { ThemeContext } from '../components/ThemeProvider';
import { useFonts, Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { useAuthStore } from '../store/auth';
import { Platform } from 'react-native';
import { APP_EMAIL } from '../services/firebase';

export default function SupportScreen() {
  const { theme } = useContext(ThemeContext);
  const { user } = useAuthStore();
  const router = useRouter();
  
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
  });

  const contactByEmail = () => {
    // Prepare email content
    const subject = encodeURIComponent("Demande d'assistance WashP");
    const body = encodeURIComponent(`
Bonjour,

[Décrivez votre problème ici]

Informations sur l'appareil:
- Appareil: ${Platform.OS}
- Version: ${Platform.Version}

Cordialement,
${user?.displayName || "Un utilisateur de WashP"}
    `);
    
    const mailtoUrl = `mailto:${APP_EMAIL}?subject=${subject}&body=${body}`;
    
    Linking.canOpenURL(mailtoUrl).then(supported => {
      if (supported) {
        Linking.openURL(mailtoUrl);
      } else {
        Alert.alert(
          "Erreur",
          "Impossible d'ouvrir l'application mail. Veuillez contacter le support à app.washp.ai@gmail.com",
          [{ text: "OK" }]
        );
      }
    });
  };

  const handleBack = () => {
    router.back();
  };

  const navigateToFAQ = () => {
    router.push('/faq');
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
        <Text style={[styles.title, { color: theme.text }]}>
          Contacter le support
        </Text>
        
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          Notre équipe est là pour vous aider. Choisissez votre méthode de contact préférée ci-dessous.
        </Text>

        <View style={styles.contactOptions}>
          <Pressable 
            style={[styles.contactCard, { backgroundColor: theme.card }]}
            onPress={contactByEmail}
          >
            <View style={[styles.iconContainer, { backgroundColor: theme.primaryLight }]}>
              <Mail size={24} color={theme.primary} />
            </View>
            <View style={styles.contactDetails}>
              <Text style={[styles.contactMethod, { color: theme.text }]}>
                Email
              </Text>
              <Text style={[styles.contactInfo, { color: theme.textSecondary }]}>
                Envoyez-nous un email à {APP_EMAIL}
              </Text>
              <Text style={[styles.contactTime, { color: theme.text }]}>
                Réponse sous 24-48h
              </Text>
            </View>
          </Pressable>

          <View style={[styles.contactCard, { backgroundColor: theme.card }]}>
            <View style={[styles.iconContainer, { backgroundColor: theme.primaryLight }]}>
              <MessageSquare size={24} color={theme.primary} />
            </View>
            <View style={styles.contactDetails}>
              <Text style={[styles.contactMethod, { color: theme.text }]}>
                Assistance en ligne
              </Text>
              <Text style={[styles.contactInfo, { color: theme.textSecondary }]}>
                Consultez notre FAQ pour des réponses rapides à vos questions
              </Text>
              <Pressable 
                style={[styles.linkButton, { borderColor: theme.primary }]}
                onPress={navigateToFAQ}
              >
                <Text style={[styles.linkButtonText, { color: theme.primary }]}>
                  Voir la FAQ
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={[styles.supportHours, { backgroundColor: theme.primaryLight }]}>
          <Text style={[styles.supportTitle, { color: theme.text }]}>
            Heures d'assistance
          </Text>
          <Text style={[styles.supportInfo, { color: theme.textSecondary }]}>
            Lundi au Vendredi: 9h - 18h
          </Text>
          <Text style={[styles.supportInfo, { color: theme.textSecondary }]}>
            Samedi: 10h - 16h
          </Text>
          <Text style={[styles.supportInfo, { color: theme.textSecondary }]}>
            Dimanche: Fermé
          </Text>
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
    padding: 20,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 24,
    marginBottom: 12,
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginBottom: 32,
    lineHeight: 24,
  },
  contactOptions: {
    gap: 16,
    marginBottom: 40,
  },
  contactCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactDetails: {
    flex: 1,
  },
  contactMethod: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginBottom: 6,
  },
  contactInfo: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  contactTime: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  linkButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 4,
  },
  linkButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  supportHours: {
    padding: 20,
    borderRadius: 16,
  },
  supportTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginBottom: 12,
  },
  supportInfo: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginBottom: 6,
  },
});