import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable } from 'react-native';
import { useFonts, Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { AnalysisResults } from '../components/AnalysisResults';
import { useHistoryStore } from '../store/history';
import { Logo } from '../components/Logo';
import { Platform } from 'react-native';

export default function AnalysisResultScreen() {
  const { itemId } = useLocalSearchParams();
  const router = useRouter();
  const historyItems = useHistoryStore(state => state.items);
  const [selectedItem, setSelectedItem] = React.useState(null);
  
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
  });

  useEffect(() => {
    if (itemId) {
      const item = historyItems.find(item => item.id === itemId);
      setSelectedItem(item);
    }
  }, [itemId, historyItems]);

  if (!fontsLoaded) {
    return null;
  }

  if (!selectedItem || !selectedItem.analysisResult) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Item introuvable</Text>
        <Pressable 
          style={styles.backButton}
          onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Retour</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFFFFF', '#EAF6FF', '#D0E9FF']}
        style={styles.gradient}
      />
      
      <View style={styles.header}>
        <Pressable 
          style={styles.backButtonTouchArea}
          onPress={() => router.back()}>
          <View style={styles.backButtonWrapper}>
            <View style={styles.backButtonInner}>
              <ChevronLeft size={24} color="#3A8DFF" />
            </View>
          </View>
        </Pressable>
      </View>

      
      <AnalysisResults
        analysisResult={selectedItem.analysisResult}
        lastCapturedImage={selectedItem.image}
        onNewAnalysis={() => router.back()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  gradient: { 
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
  },
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    zIndex: 10,
  },
  backButtonTouchArea: {
    width: 88,    // Large touch area
    height: 88,   // Large touch area
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -22, // Offset to center the visual button while extending touch area
    marginTop: -20,  // Offset to center the visual button while extending touch area
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
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 18,
    color: '#424242',
    marginBottom: 24,
  },
  backButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#3A8DFF',
  },
});