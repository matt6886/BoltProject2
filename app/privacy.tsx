import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Logo } from '../components/Logo';
import { useContext } from 'react';
import { Platform } from 'react-native';
import { ThemeContext } from '../components/ThemeProvider';

export default function PrivacyPolicy() {
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
          Politique de Confidentialité
        </Text>
        
        <Text style={[styles.date, { color: theme.textSecondary }]}>
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
        </Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            1. Introduction
          </Text>
          <Text style={[styles.paragraph, { color: theme.text }]}>
            WashP ("nous", "notre", "nos") s'engage à protéger votre vie privée. Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos données personnelles conformément au Règlement Général sur la Protection des Données (RGPD).
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            2. Données collectées
          </Text>
          <Text style={[styles.paragraph, { color: theme.text }]}>
            Nous collectons les types de données suivants :
          </Text>
          <View style={styles.list}>
            <Text style={[styles.listItem, { color: theme.text }]}>• Informations de compte (email, nom)</Text>
            <Text style={[styles.listItem, { color: theme.text }]}>• Photos de vêtements analysés</Text>
            <Text style={[styles.listItem, { color: theme.text }]}>• Historique des analyses</Text>
            <Text style={[styles.listItem, { color: theme.text }]}>• Préférences de l'application</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            3. Utilisation des données
          </Text>
          <Text style={[styles.paragraph, { color: theme.text }]}>
            Vos données sont utilisées pour :
          </Text>
          <View style={styles.list}>
            <Text style={[styles.listItem, { color: theme.text }]}>• Fournir nos services d'analyse de vêtements</Text>
            <Text style={[styles.listItem, { color: theme.text }]}>• Améliorer nos algorithmes d'analyse</Text>
            <Text style={[styles.listItem, { color: theme.text }]}>• Personnaliser votre expérience</Text>
            <Text style={[styles.listItem, { color: theme.text }]}>• Communiquer avec vous concernant votre compte</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            4. Stockage et sécurité
          </Text>
          <Text style={[styles.paragraph, { color: theme.text }]}>
            Vos données sont stockées de manière sécurisée sur les serveurs de Firebase. Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, modification, divulgation ou destruction.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            5. Vos droits
          </Text>
          <Text style={[styles.paragraph, { color: theme.text }]}>
            Conformément au RGPD, vous disposez des droits suivants :
          </Text>
          <View style={styles.list}>
            <Text style={[styles.listItem, { color: theme.text }]}>• Droit d'accès à vos données</Text>
            <Text style={[styles.listItem, { color: theme.text }]}>• Droit de rectification</Text>
            <Text style={[styles.listItem, { color: theme.text }]}>• Droit à l'effacement ("droit à l'oubli")</Text>
            <Text style={[styles.listItem, { color: theme.text }]}>• Droit à la portabilité des données</Text>
            <Text style={[styles.listItem, { color: theme.text }]}>• Droit d'opposition au traitement</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            6. Conservation des données
          </Text>
          <Text style={[styles.paragraph, { color: theme.text }]}>
            Nous conservons vos données personnelles aussi longtemps que nécessaire pour fournir nos services ou respecter nos obligations légales. Vous pouvez demander la suppression de votre compte à tout moment.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            7. Partage des données
          </Text>
          <Text style={[styles.paragraph, { color: theme.text }]}>
            Nous ne partageons pas vos données personnelles avec des tiers, sauf :
          </Text>
          <View style={styles.list}>
            <Text style={[styles.listItem, { color: theme.text }]}>• Avec votre consentement explicite</Text>
            <Text style={[styles.listItem, { color: theme.text }]}>• Pour respecter nos obligations légales</Text>
            <Text style={[styles.listItem, { color: theme.text }]}>• Avec nos sous-traitants (hébergement, analyse)</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            8. Cookies et technologies similaires
          </Text>
          <Text style={[styles.paragraph, { color: theme.text }]}>
            Nous utilisons des cookies et technologies similaires pour améliorer votre expérience et analyser l'utilisation de notre application. Vous pouvez contrôler ces paramètres dans les réglages de votre navigateur.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            9. Contact
          </Text>
          <Text style={[styles.paragraph, { color: theme.text }]}>
            Pour toute question concernant cette politique ou l'exercice de vos droits, contactez-nous à :
          </Text>
          <Text style={[styles.contact, { color: theme.primary }]}>
            app.washp.ai@gmail.com
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            10. Modifications
          </Text>
          <Text style={[styles.paragraph, { color: theme.text }]}>
            Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. Les modifications entrent en vigueur dès leur publication. Nous vous informerons des changements importants par email ou via l'application.
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