import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Linking, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronDown, ChevronUp } from 'lucide-react-native';
import { Logo } from '../components/Logo';
import { ThemeContext } from '../components/ThemeProvider';
import { useFonts, Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { useAuthStore } from '../store/auth';
import { Platform } from 'react-native';
import { APP_EMAIL } from '../services/firebase';

type FAQItem = {
  question: string;
  answer: string;
};

const FAQData: FAQItem[] = [
  {
    question: "Comment analyser un vêtement ?",
    answer: "Pour analyser un vêtement, accédez à l'onglet 'Analyser' au centre de la barre de navigation. Vous pouvez choisir entre deux modes : 'Étiquette' pour scanner l'étiquette d'entretien ou 'Vêtement' pour analyser le vêtement entier. Vous pouvez également utiliser une photo existante de votre galerie. Prenez une photo claire et attendez que l'IA analyse votre vêtement."
  },
  {
    question: "Comment réaliser une analyse optimale ?",
    answer: "Pour une analyse précise, privilégiez la capture de l'étiquette du vêtement. Assurez-vous également de prendre une photo nette et bien cadrée du vêtement, en incluant les éventuelles taches pour que l'IA puisse vous fournir les meilleures recommandations."
  },
  {
    question: "Les recommandations sont-elles fiables ?",
    answer: "WashP utilise une intelligence artificielle avancée pour analyser vos vêtements et fournir des recommandations d'entretien personnalisées. Bien que nos recommandations soient généralement précises, nous vous conseillons toujours de vérifier l'étiquette d'entretien officielle de votre vêtement, surtout pour les articles délicats ou de grande valeur."
  },
  {
    question: "Quels sont les vêtements que je peux analyser avec WashP ?",
    answer: "WashP peut analyser tout type de vêtement, des classiques aux articles inattendus. Que ce soit des t-shirts, des pantalons, des sacs, des serviettes ou même d'autres textiles, WashP fournit des recommandations de lavage adaptées à chaque type d'article."
  },
  {
    question: "Comment fonctionne l'analyse du tissu ?",
    answer: "Notre IA analyse la composition et la texture du tissu à partir de l'image fournie. Elle identifie le type de tissu (coton, polyester, laine, etc.) et détermine les méthodes d'entretien appropriées en fonction de ses caractéristiques. Plus l'image est nette et bien éclairée, plus l'analyse sera précise."
  },
  {
    question: "Puis-je analyser plusieurs vêtements à la fois ?",
    answer: "Actuellement, WashP analyse un vêtement à la fois pour garantir des résultats précis. Pour analyser plusieurs vêtements, vous devrez effectuer des analyses séparées pour chacun d'entre eux."
  },
  {
    question: "L'application fonctionne-t-elle sans connexion internet ?",
    answer: "Non, WashP nécessite une connexion internet pour fonctionner car l'analyse des vêtements est effectuée par notre IA sur nos serveurs. Assurez-vous d'avoir une connexion stable lors de l'utilisation de l'application."
  },
  {
    question: "Comment supprimer mon compte ?",
    answer: "Pour supprimer votre compte, accédez à l'onglet 'Profil', puis à la section 'Compte'. Appuyez sur 'Supprimer le compte' et confirmez votre choix. Attention, cette action est irréversible et toutes vos données seront définitivement effacées."
  },
  {
    question: "Comment partager mes analyses ?",
    answer: "Après avoir analysé un vêtement, vous pouvez partager les résultats en appuyant sur le bouton 'Partager' sur l'écran des résultats d'analyse. Vous pourrez alors choisir l'application avec laquelle vous souhaitez partager ces informations."
  },
  {
    question: "Mes photos sont-elles conservées ?",
    answer: "Les photos que vous prenez sont envoyées à notre serveur pour analyse puis stockées de manière sécurisée dans votre historique personnel. Nous ne partageons jamais vos photos avec des tiers sans votre consentement explicite. Vous pouvez consulter notre politique de confidentialité pour plus d'informations."
  }
];

export default function FAQScreen() {
  const themeContext = useContext(ThemeContext);
  const theme = themeContext.theme;
  const router = useRouter();
  const { user } = useAuthStore();
  const [expandedIndex, setExpandedIndex] = React.useState<number | null>(null);
  
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
  });

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleBack = () => {
    router.back();
  };

  const contactSupport = () => {
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

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: theme.text }]}>
          Foire aux questions
        </Text>
        
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Trouvez des réponses aux questions les plus fréquentes sur WashP
        </Text>

        <View style={styles.faqContainer}>
          {FAQData.map((item, index) => (
            <Pressable
              key={index}
              style={[
                styles.faqItem,
                { backgroundColor: theme.card },
                expandedIndex === index && styles.faqItemExpanded
              ]}
              onPress={() => toggleExpand(index)}
            >
              <View style={styles.faqQuestion}>
                <Text style={[styles.questionText, { color: theme.text }]}>
                  {item.question}
                </Text>
                {expandedIndex === index ? (
                  <ChevronUp size={20} color={theme.primary} />
                ) : (
                  <ChevronDown size={20} color={theme.primary} />
                )}
              </View>
              
              {expandedIndex === index && (
                <Text style={[styles.answerText, { color: theme.textSecondary }]}>
                  {item.answer}
                </Text>
              )}
            </Pressable>
          ))}
        </View>

        <View style={styles.contactSection}>
          <Text style={[styles.contactTitle, { color: theme.text }]}>
            Vous n'avez pas trouvé votre réponse ?
          </Text>
          <Pressable
            style={[styles.contactButton, { backgroundColor: theme.primary }]}
            onPress={contactSupport}
          >
            <Text style={styles.contactButtonText}>
              Contacter le support
            </Text>
          </Pressable>
        </View>
      </ScrollView>
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
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginBottom: 32,
  },
  faqContainer: {
    gap: 12,
  },
  faqItem: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  faqItemExpanded: {
    shadowOpacity: 0.1,
    elevation: 2,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
  answerText: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
    marginBottom: 4,
  },
  contactSection: {
    marginTop: 40,
    marginBottom: 32,
    alignItems: 'center',
  },
  contactTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
  contactButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  contactButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});