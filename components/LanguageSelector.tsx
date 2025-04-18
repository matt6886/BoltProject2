import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, TouchableOpacity } from 'react-native';
import { LanguageContext } from './LanguageProvider';
import { t, getLocaleName } from '../utils/i18n';
import { ThemeContext } from './ThemeProvider';
import { X } from 'lucide-react-native';

interface LanguageOption {
  code: string;
  name: string;
}

export function LanguageSelector() {
  const { locale, setLocale } = useContext(LanguageContext);
  const { theme } = useContext(ThemeContext);
  const [modalVisible, setModalVisible] = useState(false);

  const languages: LanguageOption[] = [
    { code: 'en', name: t('languages.en') },
    { code: 'fr', name: t('languages.fr') }
  ];

  const handleSelectLanguage = (languageCode: string) => {
    setLocale(languageCode);
    setModalVisible(false);
  };

  return (
    <>
      <Pressable
        style={styles.languageButton}
        onPress={() => setModalVisible(true)}>
        <Text style={[styles.languageButtonText, { color: theme.text }]}>
          {getLocaleName(locale)}
        </Text>
      </Pressable>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {t('languages.changeLanguage')}
              </Text>
              <Pressable 
                style={styles.closeButton} 
                onPress={() => setModalVisible(false)}>
                <X size={20} color={theme.text} />
              </Pressable>
            </View>

            <Text style={[styles.modalDescription, { color: theme.textSecondary }]}>
              {t('languages.chooseLanguage')}
            </Text>

            <View style={styles.languageOptions}>
              {languages.map((language) => (
                <Pressable
                  key={language.code}
                  style={[
                    styles.languageOption,
                    locale === language.code && [
                      styles.selectedLanguage,
                      { backgroundColor: theme.primaryLight }
                    ],
                    { borderColor: theme.border }
                  ]}
                  onPress={() => handleSelectLanguage(language.code)}>
                  <Text style={[
                    styles.languageText,
                    { color: theme.text },
                    locale === language.code && { color: theme.primary }
                  ]}>
                    {language.name}
                  </Text>
                  {locale === language.code && (
                    <View style={[styles.checkmark, { backgroundColor: theme.primary }]} />
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  languageButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  languageButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 24,
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
  },
  closeButton: {
    padding: 4,
  },
  modalDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginBottom: 24,
  },
  languageOptions: {
    gap: 12,
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  selectedLanguage: {
    borderColor: 'transparent',
  },
  languageText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  checkmark: {
    width: 8,
    height: 8,
    borderRadius: 4,
  }
});