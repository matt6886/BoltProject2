import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Logo } from '../components/Logo';
import { useContext } from 'react';
import { Platform } from 'react-native';
import { ThemeContext } from '../components/ThemeProvider';

export default function TermsOfService() {
  const { theme } = useContext(ThemeContext);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Link href="/" asChild>
          <Pressable style={styles.backButton}>
            <ChevronLeft size={24} color={theme.primary} />
          </Pressable>
        </Link>
        <Logo />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: theme.text }]}>
          Conditions d'utilisation
        </Text>
        
        <Text style={[styles.date, { color: theme.textSecondary }]}>
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
        </Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            1. Acceptation des conditions
          </Text>
          <Text style={[styles.paragraph, { color: theme.text }]}>
            En utilisant l'application WashP, vous acceptez d'être lié par les présentes conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser l'application.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            2. Description du service
          </Text>
          <Text style={[styles.paragraph, { color: theme.text }]}>
            WashP est une application d'analyse de vêtements qui fournit des recommandations d'entretien personnalisées. Nous utilisons l'intelligence artificielle pour analyser les photos de vos vêtements et vous donner des conseils adaptés.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            3. Compte utilisateur
          </Text>
          <Text style={[styles.paragraph, { color: theme.text }]}>
            Pour utiliser certaines fonctionnalités de l'application, vous devez créer un compte. Vous êtes responsable de :
          </Text>
          <View style={styles.list}>
            <Text style={[styles.listItem, { color: theme.text }]}>• Maintenir la confidentialité de votre mot de passe</Text>
            <Text style={[styles.listItem, { color: theme.text }]}>• Toutes les activités sur votre compte</Text>
            <Text style={[styles.listItem, { color: theme.text }]}>• Nous informer de toute utilisation non autorisée</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            4. Utilisation acceptable
          </Text>
          <Text style={[styles.paragraph, { color: theme.text }]}>
            Vous acceptez de ne pas :
          </Text>
          <View style={styles.list}>
            <Text style={[styles.listItem, { color: theme.text }]}>• Utiliser l'application à des fins illégales</Text>
            <Text style={[styles.listItem, { color: theme.text }]}>• Télécharger du contenu inapproprié ou offensant</Text>
            <Text style={[styles.listItem, { color: theme.text }]}>• Tenter de compromettre la sécurité de l'application</Text>
            <Text style={[styles.listItem, { color: theme.text }]}>• Revendre ou redistribuer nos services</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            5. Propriété intellectuelle
          </Text>
          <Text style={[styles.paragraph, { color: theme.text }]}>
            Tous les droits de propriété intellectuelle liés à l'application et son contenu appartiennent à WashP. Vous ne pouvez pas copier, modifier, distribuer ou utiliser notre contenu sans autorisation explicite.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            6. Responsabilité
          </Text>
          <Text style={[styles.paragraph, { color: theme.text }]}>
            Les recommandations fournies par l'application sont données à titre indicatif. WashP ne peut être tenu responsable des dommages causés aux vêtements suite à l'utilisation de nos conseils. Vous êtes responsable de vérifier les étiquettes d'entretien de vos vêtements.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            7. Modifications du service
          </Text>
          <Text style={[styles.paragraph, { color: theme.text }]}>
            Nous nous réservons le droit de modifier, suspendre ou interrompre tout aspect du service à tout moment, avec ou sans préavis. Nous pouvons également imposer des limites à certaines fonctionnalités ou restreindre votre accès à certaines parties du service.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            8. Résiliation
          </Text>
          <Text style={[styles.paragraph, { color: theme.text }]}>
            Nous pouvons résilier ou suspendre votre accès au service immédiatement, sans préavis ni responsabilité, pour quelque raison que ce soit, y compris si vous violez ces conditions. Vous pouvez également résilier votre compte à tout moment.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            9. Contact
          </Text>
          <Text style={[styles.paragraph, { color: theme.text }]}>
            Pour toute question concernant ces conditions d'utilisation, contactez-nous à :
          </Text>
          <Text style={[styles.contact, { color: theme.primary }]}>
            app.washp.ai@gmail.com
          </Text>
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
  date: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginBottom: 12,
  },
  paragraph: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  list: {
    marginLeft: 8,
    marginTop: 8,
  },
  listItem: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  contact: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginTop: 8,
  },
});