import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Image, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Save, 
  ChevronLeft,
  ClipboardList,
  Shirt,
  Sticker,
  WashingMachine,
  Leaf,
  Brush
} from 'lucide-react-native';
import type { ClothingCare } from '../services/openai';
import { useHistoryStore } from '../store/history';
import { useAuthStore } from '../store/auth';
import MaskedView from '@react-native-masked-view/masked-view';
import { ThemeContext } from './ThemeProvider';
import { useContext } from 'react';
import { SocialShare } from './SocialShare';
import { t } from '../utils/i18n';

type AnalysisResultsProps = {
  analysisResult: ClothingCare;
  lastCapturedImage: string | null;
  onNewAnalysis: () => void;
};

const GRADIENTS = {
  summary: ['rgba(240, 249, 250, 0.8)', 'rgba(232, 246, 248, 0.6)', 'rgba(214, 243, 247, 0.4)'],
  fabric: ['rgba(241, 249, 244, 0.8)', 'rgba(236, 247, 240, 0.6)', 'rgba(215, 244, 232, 0.4)'],
  stains: ['rgba(255, 248, 240, 0.8)', 'rgba(255, 243, 232, 0.6)', 'rgba(255, 238, 214, 0.4)'],
  steps: ['rgba(255, 249, 240, 0.8)', 'rgba(255, 245, 232, 0.6)', 'rgba(255, 242, 214, 0.4)'],
  impact: ['rgba(248, 240, 250, 0.8)', 'rgba(243, 232, 247, 0.6)', 'rgba(238, 214, 243, 0.4)'],
  maintenance: ['rgba(255, 240, 245, 0.8)', 'rgba(255, 232, 239, 0.6)', 'rgba(255, 230, 234, 0.4)']
};

const DARK_GRADIENTS = {
  summary: ['rgba(36, 232, 224, 0.1)', 'rgba(36, 232, 224, 0.05)', 'rgba(36, 232, 224, 0.02)'],
  fabric: ['rgba(46, 213, 115, 0.1)', 'rgba(46, 213, 115, 0.05)', 'rgba(46, 213, 115, 0.02)'],
  stains: ['rgba(255, 159, 67, 0.1)', 'rgba(255, 159, 67, 0.05)', 'rgba(255, 159, 67, 0.02)'],
  steps: ['rgba(255, 242, 214, 0.1)', 'rgba(255, 242, 214, 0.05)', 'rgba(255, 242, 214, 0.02)'],
  impact: ['rgba(165, 94, 234, 0.1)', 'rgba(165, 94, 234, 0.05)', 'rgba(165, 94, 234, 0.02)'],
  maintenance: ['rgba(255, 118, 117, 0.1)', 'rgba(255, 118, 117, 0.05)', 'rgba(255, 118, 117, 0.02)']
};

const SHADOWS = {
  summary: {
    primary: 'rgba(36, 232, 224, 0.25)',
    secondary: 'rgba(36, 232, 224, 0.15)'
  },
  fabric: {
    primary: 'rgba(46, 213, 115, 0.25)',
    secondary: 'rgba(46, 213, 115, 0.15)'
  },
  stains: {
    primary: 'rgba(255, 159, 67, 0.25)',
    secondary: 'rgba(255, 159, 67, 0.15)'
  },
  steps: {
    primary: 'rgba(255, 242, 214, 0.25)',
    secondary: 'rgba(255, 242, 214, 0.15)'
  },
  impact: {
    primary: 'rgba(165, 94, 234, 0.25)',
    secondary: 'rgba(165, 94, 234, 0.15)'
  },
  maintenance: {
    primary: 'rgba(255, 118, 117, 0.25)',
    secondary: 'rgba(255, 118, 117, 0.15)'
  }
};

const ICONS = {
  summary: ClipboardList,
  fabric: Shirt,
  stains: Sticker,
  steps: WashingMachine,
  impact: Leaf,
  maintenance: Brush
};

const ICON_COLORS = {
  summary: '#96e2f6',
  fabric: '#4CAF50',
  stains: '#FF9F43',
  steps: '#FFC107',
  impact: '#A55EEA',
  maintenance: '#FF7675'
};

export function AnalysisResults({ 
  analysisResult, 
  lastCapturedImage, 
  onNewAnalysis 
}: AnalysisResultsProps) {
  const { user } = useAuthStore();
  const addHistoryItem = useHistoryStore(state => state.addItem);
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const { theme, isDarkMode } = useContext(ThemeContext);

  const handleSave = () => {
    try {
      if (!lastCapturedImage) {
        throw new Error('Aucune image à sauvegarder');
      }

      if (!user) {
        throw new Error('Vous devez être connecté pour sauvegarder l\'analyse');
      }

      addHistoryItem({
        name: analysisResult.title,
        temperature: analysisResult.summary.temperature,
        cycle: analysisResult.summary.program,
        image: lastCapturedImage,
        analysisResult: analysisResult,
        userId: user.uid
      });

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onNewAnalysis();
      }, 1500);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde. Veuillez réessayer.');
    }
  };

  const renderSectionTitle = (title: string, type: keyof typeof GRADIENTS) => {
    const Icon = ICONS[type];
    return (
      <View style={styles.sectionTitleContainer}>
        <View style={[styles.iconContainer, { backgroundColor: `${ICON_COLORS[type]}15` }]}>
          <Icon size={24} color={ICON_COLORS[type]} />
        </View>
        <Text style={[styles.cardTitle, { color: theme.text, marginLeft: 12 }]}>{title}</Text>
      </View>
    );
  };

  const renderCard = (children: React.ReactNode, type: keyof typeof GRADIENTS) => (
    <View style={[
      styles.cardContainer,
      {
        shadowColor: SHADOWS[type].primary,
        backgroundColor: isDarkMode ? 'rgba(26, 26, 26, 0.5)' : `${ICON_COLORS[type]}05`,
        elevation: 8,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        borderWidth: 1,
        borderColor: isDarkMode ? `${ICON_COLORS[type]}15` : `${ICON_COLORS[type]}15`,
      }
    ]}>
      <View style={[
        styles.cardInnerShadow,
        { 
          shadowColor: SHADOWS[type].secondary,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.25,
          shadowRadius: 8,
        }
      ]}>
        <LinearGradient
          colors={isDarkMode ? DARK_GRADIENTS[type] : GRADIENTS[type]}
          style={styles.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          {children}
        </LinearGradient>
      </View>
    </View>
  );

  const renderTitle = () => {
    if (Platform.OS === 'web') {
      return (
        <Text 
          style={[styles.resultTitle]}
          // @ts-ignore - Web-only styles
          style={{
            background: '-webkit-linear-gradient(left, #3D5AFE, #40B3FF)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontFamily: 'Inter-SemiBold',
            fontSize: 24,
            letterSpacing: -0.5,
          }}>
          {analysisResult.title}
        </Text>
      );
    }

    return (
      <MaskedView
        style={{ flex: 1 }}
        maskElement={
          <Text style={styles.resultTitle}>
            {analysisResult.title}
          </Text>
        }>
        <LinearGradient
          colors={['#3D5AFE', '#40B3FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        />
      </MaskedView>
    );
  };

  const shareText = `
${analysisResult.title}

Programme : ${analysisResult.summary.program}
Température : ${analysisResult.summary.temperature}
Essorage : ${analysisResult.summary.spin}
Détergent : ${analysisResult.summary.detergent}

Type de tissu : ${analysisResult.fabricType}

Conseils d'entretien :
${analysisResult.preWash.join('\n')}
${analysisResult.duringWash.join('\n')}
${analysisResult.postWash.join('\n')}
`;

  return (
    <View style={[styles.resultWrapper, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={[theme.background, theme.backgroundSecondary, theme.backgroundSecondary]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      <Pressable 
        style={styles.backButtonTouchArea}
        onPress={onNewAnalysis}>
        <View style={styles.backButtonWrapper}>
          <View style={[styles.backButtonInner, { backgroundColor: theme.card }]}>
            <ChevronLeft size={24} color={theme.primary} />
          </View>
        </View>
      </Pressable>

      <ScrollView 
        style={styles.resultContainer}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          {lastCapturedImage && (
            <Image
              source={{ uri: lastCapturedImage }}
              style={styles.productImage}
              resizeMode="cover"
            />
          )}
          {renderTitle()}
        </View>
        
        {renderCard(
          <>
            {renderSectionTitle(t('analysisResults.summary'), 'summary')}
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>{t('analysisResults.program')}</Text>
                <Text style={[styles.summaryValue, { color: theme.text }]}>{analysisResult.summary.program}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>{t('analysisResults.temperature')}</Text>
                <Text style={[styles.summaryValue, { color: theme.text }]}>{analysisResult.summary.temperature}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>{t('analysisResults.spin')}</Text>
                <Text style={[styles.summaryValue, { color: theme.text }]}>{analysisResult.summary.spin}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>{t('analysisResults.detergent')}</Text>
                <Text style={[styles.summaryValue, { color: theme.text }]}>{analysisResult.summary.detergent}</Text>
              </View>
            </View>
          </>,
          'summary'
        )}

        {renderCard(
          <>
            {renderSectionTitle(t('analysisResults.fabricType'), 'fabric')}
            <Text style={[styles.cardText, { color: theme.text }]}>{analysisResult.fabricType}</Text>
          </>,
          'fabric'
        )}

        {analysisResult.stains && renderCard(
          <>
            {renderSectionTitle(t('analysisResults.stainTreatment'), 'stains')}
            <Text style={[styles.cardText, { color: theme.text }]}>{analysisResult.stains}</Text>
          </>,
          'stains'
        )}

        {renderCard(
          <>
            {renderSectionTitle(t('analysisResults.washingSteps'), 'steps')}
            
            <Text style={[styles.subCardTitle, { color: theme.text }]}>{t('analysisResults.beforeWash')}</Text>
            {analysisResult.preWash.map((step, index) => (
              <View key={index} style={styles.stepItem}>
                <Text style={[styles.bulletPoint, { color: theme.text }]}>•</Text>
                <Text style={[styles.stepText, { color: theme.text }]}>{step}</Text>
              </View>
            ))}

            <Text style={[styles.subCardTitle, { color: theme.text }]}>{t('analysisResults.duringWash')}</Text>
            {analysisResult.duringWash.map((step, index) => (
              <View key={index} style={styles.stepItem}>
                <Text style={[styles.bulletPoint, { color: theme.text }]}>•</Text>
                <Text style={[styles.stepText, { color: theme.text }]}>{step}</Text>
              </View>
            ))}

            <Text style={[styles.subCardTitle, { color: theme.text }]}>{t('analysisResults.afterWash')}</Text>
            {analysisResult.postWash.map((step, index) => (
              <View key={index} style={styles.stepItem}>
                <Text style={[styles.bulletPoint, { color: theme.text }]}>•</Text>
                <Text style={[styles.stepText, { color: theme.text }]}>{step}</Text>
              </View>
            ))}
          </>,
          'steps'
        )}

        {renderCard(
          <>
            {renderSectionTitle(t('analysisResults.environmentalImpact'), 'impact')}
            <View style={styles.impactGrid}>
              <View style={styles.impactItem}>
                <Text style={[styles.impactLabel, { color: theme.text }]}>{t('analysisResults.waterUsage')}</Text>
                <Text style={[styles.impactValue, { color: theme.text }]}>{analysisResult.environmentalImpact.waterUsage}</Text>
              </View>
              <View style={styles.impactItem}>
                <Text style={[styles.impactLabel, { color: theme.text }]}>{t('analysisResults.energyEfficiency')}</Text>
                <Text style={[styles.impactValue, { color: theme.text }]}>{analysisResult.environmentalImpact.energyEfficiency}</Text>
              </View>
            </View>
            <Text style={[styles.subCardTitle, { color: theme.text }]}>{t('analysisResults.ecologicalTips')}</Text>
            {analysisResult.environmentalImpact.ecologicalTips.map((tip, index) => (
              <View key={index} style={styles.stepItem}>
                <Text style={[styles.bulletPoint, { color: theme.text }]}>•</Text>
                <Text style={[styles.stepText, { color: theme.text }]}>{tip}</Text>
              </View>
            ))}
          </>,
          'impact'
        )}

        {renderCard(
          <>
            {renderSectionTitle(t('analysisResults.maintenance'), 'maintenance')}
            <View style={styles.maintenanceItem}>
              <Text style={[styles.maintenanceLabel, { color: theme.text }]}>{t('analysisResults.washFrequency')}</Text>
              <Text style={[styles.maintenanceValue, { color: theme.text }]}>{analysisResult.maintenance.frequency}</Text>
            </View>
            
            <Text style={[styles.subCardTitle, { color: theme.text }]}>{t('analysisResults.storage')}</Text>
            {analysisResult.maintenance.storage.map((tip, index) => (
              <View key={index} style={styles.stepItem}>
                <Text style={[styles.bulletPoint, { color: theme.text }]}>•</Text>
                <Text style={[styles.stepText, { color: theme.text }]}>{tip}</Text>
              </View>
            ))}
            
            <Text style={[styles.subCardTitle, { color: theme.text }]}>{t('analysisResults.repairs')}</Text>
            {analysisResult.maintenance.repairs.map((tip, index) => (
              <View key={index} style={styles.stepItem}>
                <Text style={[styles.bulletPoint, { color: theme.text }]}>•</Text>
                <Text style={[styles.stepText, { color: theme.text }]}>{tip}</Text>
              </View>
            ))}
          </>,
          'maintenance'
        )}

        <View style={styles.actionButtons}>
          <SocialShare
            title={analysisResult.title}
            description={shareText}
            imageUrl={lastCapturedImage || undefined}
          />
          
          <Pressable
            style={[
              styles.actionButton,
              styles.saveButton,
              { 
                backgroundColor: isDarkMode ? 'transparent' : '#FFFFFF',
                borderColor: theme.primary 
              },
              saveSuccess && [
                styles.saveButtonSuccess,
                { backgroundColor: theme.success }
              ]
            ]}
            onPress={handleSave}
            disabled={saveSuccess}>
            <Save 
              size={20} 
              color={saveSuccess ? "#FFFFFF" : theme.primary} 
            />
            <Text style={[
              styles.actionButtonText,
              { color: saveSuccess ? "#FFFFFF" : theme.primary }
            ]}>
              {saveSuccess ? t('analysisResults.savedSuccess') : t('analysisResults.saveButton')}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  resultWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
  },
  backButtonTouchArea: {
    position: 'absolute',
    top: 20,
    left: 0,
    zIndex: 10,
    width: 88,
    height: 88,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonWrapper: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  resultContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  resultTitle: {
    flex: 1,
    fontFamily: 'Inter-SemiBold',
    fontSize: 24,
    letterSpacing: -0.5,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    marginBottom: 16,
    borderRadius: 24,
    overflow: 'hidden',
  },
  cardInnerShadow: {
    flex: 1,
    margin: 1,
    borderRadius: 23,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 24,
    borderRadius: 23,
  },
  cardTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  summaryItem: {
    flex: 1,
    minWidth: '45%',
  },
  summaryLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: 4,
    opacity: 0.6,
  },
  summaryValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  cardText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  bulletPoint: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginRight: 8,
    marginTop: -2,
  },
  stepText: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  impactGrid: {
    marginBottom: 16,
  },
  impactItem: {
    marginBottom: 12,
  },
  impactLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: 4,
  },
  impactValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  subCardTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  maintenanceItem: {
    marginBottom: 16,
  },
  maintenanceLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: 4,
  },
  maintenanceValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: 'column',
    gap: 12,
    marginTop: 24,
    marginBottom: 32,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#3A8DFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButton: {
    borderWidth: 2,
  },
  saveButtonSuccess: {
    borderWidth: 0,
  },
  actionButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
});

export { AnalysisResults }