import React, { useState, useCallback, useContext } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Image, Platform, Alert, Linking } from 'react-native';
import { useFonts, Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Bell, 
  Globe, 
  Lock, 
  CircleHelp as HelpCircle, 
  ChevronRight, 
  Moon, 
  Fingerprint, 
  Trash2, 
  LifeBuoy, 
  LogOut,
  Camera
} from 'lucide-react-native';
import { Logo } from '../../components/Logo';
import { useAuthStore } from '../../store/auth';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ThemeContext } from '../../components/ThemeProvider';
import { useThemeStore } from '../../store/theme';
import { APP_EMAIL } from '../../services/firebase';
import { deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { t } from '../../utils/i18n';
import { LanguageContext } from '../../components/LanguageProvider';
import { getLocaleName } from '../../utils/i18n';
import { LanguageSelector } from '../../components/LanguageSelector';

export default function ProfileScreen() {
  const { user, signOut } = useAuthStore();
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricAuth, setBiometricAuth] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const defaultProfileImage = "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=400&auto=format&fit=crop";

  const { theme, isDarkMode } = useContext(ThemeContext);
  const { toggleTheme } = useThemeStore();
  const { locale } = useContext(LanguageContext);

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
  });

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/auth/sign-in');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const handleOpenSupport = () => {
    // Open email client with pre-filled recipient
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

  const handleOpenNotificationSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else if (Platform.OS === 'android') {
      Linking.openSettings();
    } else {
      Alert.alert(
        "Information",
        "Pour modifier les paramètres de notification, veuillez accéder aux paramètres de votre navigateur.",
        [{ text: "OK" }]
      );
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('profile.deleteAccount'),
      "Êtes-vous sûr de vouloir supprimer définitivement votre compte ? Cette action est irréversible et toutes vos données seront perdues.",
      [
        {
          text: t('common.cancel'),
          style: "cancel"
        },
        {
          text: t('common.delete'),
          style: "destructive",
          onPress: () => {
            // Sur le web, rediriger vers la page de confirmation
            if (Platform.OS === 'web') {
              router.push('/delete-account');
            } else {
              // Sur mobile, demander le mot de passe
              if (Platform.OS === 'ios') {
                // iOS seulement: Alert.prompt est disponible
                Alert.prompt(
                  "Vérification",
                  "Veuillez entrer votre mot de passe pour confirmer",
                  [
                    {
                      text: t('common.cancel'),
                      style: "cancel"
                    },
                    {
                      text: "Confirmer",
                      style: "destructive",
                      onPress: async (password) => {
                        if (!password || !user || !user.email) return;
                        
                        try {
                          const credential = EmailAuthProvider.credential(user.email, password);
                          await reauthenticateWithCredential(user, credential);
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
                          Alert.alert(
                            t('common.error'),
                            "Mot de passe incorrect ou problème de connexion",
                            [{ text: "OK" }]
                          );
                        }
                      }
                    }
                  ],
                  "secure-text"
                );
              } else {
                // Android ou autre: rediriger vers la page de confirmation
                router.push('/delete-account');
              }
            }
          }
        }
      ]
    );
  };

  const handleOpenFAQ = () => {
    router.push('/faq');
  };

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  const renderSetting = (
    icon: React.ReactNode,
    title: string,
    description = '',
    rightElement: React.ReactNode = <ChevronRight size={16} color={theme.primary} />,
    onPress?: () => void
  ) => (
    <Pressable 
      style={[styles.settingItem, { borderBottomColor: theme.border }]}
      onPress={onPress}>
      <View style={[styles.settingIcon, { backgroundColor: theme.primaryLight }]}>{icon}</View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: theme.text }]}>{title}</Text>
        {description ? <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>{description}</Text> : null}
      </View>
      {rightElement}
    </Pressable>
  );

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
      <LinearGradient
        colors={[theme.background, theme.backgroundSecondary, theme.backgroundSecondary]}
        style={styles.gradient}
      />
      
      <Logo />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.profileHeader}>
          <Pressable style={styles.profileImageContainer} onPress={handleImagePick}>
            <Image 
              source={{ 
                uri: profileImage || defaultProfileImage
              }} 
              style={styles.profileImage}
              defaultSource={{ uri: defaultProfileImage }}
            />
            <View style={styles.editIconContainer}>
              <Camera size={16} color="#FFFFFF" />
            </View>
          </Pressable>
          <Text style={[styles.profileName, { color: theme.text }]}>{user?.displayName || 'Utilisateur'}</Text>
          <Text style={[styles.profileEmail, { color: theme.textSecondary }]}>{user?.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('profile.notifications')}</Text>
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            {renderSetting(
              <Bell size={20} color={theme.primary} />,
              t('profile.notifications'),
              t('profile.manageNotifications'),
              <View style={styles.settingAction}>
                <ChevronRight size={16} color={theme.primary} />
              </View>,
              handleOpenNotificationSettings
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('profile.preferences')}</Text>
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            {renderSetting(
              <Globe size={20} color={theme.primary} />,
              t('profile.language'),
              getLocaleName(locale),
              <View style={styles.settingAction}>
                <LanguageSelector />
                <ChevronRight size={16} color={theme.primary} />
              </View>
            )}
            
            {renderSetting(
              <Moon size={20} color={theme.primary} />,
              t('profile.darkMode'),
              t('profile.appTheme'),
              <View style={[
                styles.toggle,
                isDarkMode && styles.toggleActive
              ]}>
                <View style={[
                  styles.toggleHandle,
                  isDarkMode && styles.toggleHandleActive
                ]} />
              </View>,
              toggleTheme
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('profile.security')}</Text>
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            {Platform.OS !== 'web' && renderSetting(
              <Fingerprint size={20} color={theme.primary} />,
              t('profile.biometricAuth'),
              t('profile.useBiometric'),
              <View style={[
                styles.toggle,
                biometricAuth && styles.toggleActive
              ]}>
                <View style={[
                  styles.toggleHandle,
                  biometricAuth && styles.toggleHandleActive
                ]} />
              </View>,
              () => setBiometricAuth(!biometricAuth)
            )}
            
            {renderSetting(
              <Lock size={20} color={theme.primary} />,
              t('profile.privacy'),
              t('profile.privacyPolicy'),
              <View style={styles.settingAction}>
                <ChevronRight size={16} color={theme.primary} />
              </View>,
              () => handleNavigate('/privacy')
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('profile.helpSupport')}</Text>
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            {renderSetting(
              <HelpCircle size={20} color={theme.primary} />,
              t('profile.faq'),
              t('profile.frequentlyAsked'),
              <View style={styles.settingAction}>
                <ChevronRight size={16} color={theme.primary} />
              </View>,
              handleOpenFAQ
            )}
            
            {renderSetting(
              <LifeBuoy size={20} color={theme.primary} />,
              t('profile.contactSupport'),
              t('profile.needHelp'),
              <View style={styles.settingAction}>
                <ChevronRight size={16} color={theme.primary} />
              </View>,
              handleOpenSupport
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('profile.account')}</Text>
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            {renderSetting(
              <Trash2 size={20} color={theme.error} />,
              t('profile.deleteAccount'),
              t('profile.deleteAccountDesc'),
              <View style={styles.settingAction}>
                <ChevronRight size={16} color={theme.primary} />
              </View>,
              handleDeleteAccount
            )}

            {renderSetting(
              <LogOut size={20} color={theme.error} />,
              t('auth.signOut'),
              t('profile.signOutDesc'),
              <View style={styles.settingAction}>
                <ChevronRight size={16} color={theme.primary} />
              </View>,
              handleSignOut
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <View style={styles.versionContainer}>
              <Text style={[styles.versionText, { color: theme.text }]}>WashP</Text>
              <Text style={[styles.versionNumber, { color: theme.textSecondary }]}>{t('profile.version')} 1.0.0</Text>
            </View>
            
            <View style={[styles.legalLinks, { borderTopColor: theme.border }]}>
              <Pressable 
                style={styles.legalLink} 
                onPress={() => handleNavigate('/terms')}>
                <Text style={[styles.legalLinkText, { color: theme.primary }]}>
                  Conditions d'utilisation
                </Text>
              </Pressable>
              
              <Pressable 
                style={styles.legalLink} 
                onPress={() => handleNavigate('/privacy')}>
                <Text style={[styles.legalLinkText, { color: theme.primary }]}>
                  Politique de confidentialité
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
        
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    backgroundColor: '#EAF6FF',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3A8DFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  profileName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 24,
    marginBottom: 4,
  },
  profileEmail: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    borderRadius: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  settingIcon: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 2,
  },
  settingDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  settingAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#D0E9FF',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#3A8DFF',
  },
  toggleHandle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleHandleActive: {
    transform: [{ translateX: 20 }],
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  versionText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginBottom: 8,
  },
  versionNumber: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  legalLinks: {
    borderTopWidth: 1,
    paddingTop: 16,
    paddingBottom: 8,
  },
  legalLink: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  legalLinkText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  bottomPadding: {
    height: 100,
  },
});