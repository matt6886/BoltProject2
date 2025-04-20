import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, Platform, ActivityIndicator, Image } from 'react-native';
import { Camera, CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { Link, useRouter } from 'expo-router';
import { useFonts, Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Camera as LucideCamera, Tag, Image as ImageIcon, ChevronLeft, Plus, X, Check } from 'lucide-react-native';
import Animated, { 
  useAnimatedStyle, 
  withTiming,
  withSpring,
  Easing,
  useSharedValue,
  withSequence
} from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { analyzeClothing, type ClothingCare } from '../../services/openai';
import { AnalysisResults } from '../../components/AnalysisResults';
import { useHistoryStore } from '../../store/history';
import { LoadingScreen } from '../../components/LoadingScreen';
import { LinearGradient } from 'expo-linear-gradient';
import { t } from '../../utils/i18n';
import { useAuthStore } from '@/store/auth';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type ScanMode = 'garment' | 'label' | 'gallery';
type CapturedImage = {
  uri: string;
  base64: string;
};

const BASE_CORNER_SIZE_H = 100;
const BASE_CORNER_SIZE_V = 140;
const CORNER_RADIUS = 8;
const CORNER_THICKNESS = 3;
const GARMENT_SCALE = 1.0;
const LABEL_SCALE = 0.7;
const MODE_ANIMATION_DURATION = 300;
const BUTTON_HEIGHT = 32;
const BUTTON_SPACING = 8;
const CAPTURE_BUTTON_SIZE = 64;
const MODE_BUTTONS_TOP_MARGIN = 24;
const ICON_SIZE = 16;
const BOTTOM_SPACING = 32;
const CAPTURE_BUTTON_MARGIN = 50;

export default function AnalyzeScreen() {
  const [mode, setMode] = useState<ScanMode>('label');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isCameraAvailable, setIsCameraAvailable] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ClothingCare | null>(
    null
  );
  const [lastCapturedImage, setLastCapturedImage] = useState<string | null>(
    null
  );
  const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([]);
  const [showCaptureOptions, setShowCaptureOptions] = useState(false);
  const cameraRef = useRef<CameraView | null>(null);
  const cornerScale = useSharedValue(LABEL_SCALE);
  const thumbnailScale = useSharedValue(1);
  const previousMode = useRef<ScanMode>('label');
  const addHistoryItem = useHistoryStore((state) => state.addItem);
  const router = useRouter();
  const { user } = useAuthStore();

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
  });

  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission]);

  useEffect(() => {
    (async () => {
      try {
        if (Platform.OS === 'web') {
          if (!navigator?.mediaDevices?.getUserMedia) {
            setIsCameraAvailable(false);
            setError("La caméra n'est pas disponible sur ce navigateur.");
            return;
          }

          try {
            await navigator.mediaDevices.getUserMedia({ video: true });
            setIsCameraAvailable(true);
            setHasPermission(true);
          } catch (err) {
            setIsCameraAvailable(false);
            if (err instanceof Error) {
              if (err.name === 'NotAllowedError') {
                setError(
                  "Accès à la caméra refusé. Veuillez l'autoriser dans les paramètres."
                );
              } else {
                setError("La caméra n'est pas accessible.");
              }
            }
          }
        } else {
          // For non-web platforms, use Expo Camera
          const { status } = await Camera.requestCameraPermissionsAsync();
          if (status === 'granted') {
            setIsCameraAvailable(true);
          } else {
            setIsCameraAvailable(false);
          }

          setHasPermission(status === 'granted');

          if (status !== 'granted') {
            setError('Caméra non disponible sur cet appareil');
          } else if (status !== 'granted') {
            setError("Permission d'accès à la caméra refusée");
          }
        }
      } catch (err) {
        console.error('Camera initialization error:', err);
        setIsCameraAvailable(false);
        setError("Erreur d'initialisation de la caméra");
      }
    })();
  }, []);

  useEffect(() => {
    return () => {
      setAnalysisResult(null);
      setLastCapturedImage(null);
      setError(null);
      setIsAnalyzing(false);
      setCapturedImages([]);
    };
  }, []);

  const processImage = async (uri: string): Promise<string> => {
    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1024 } }],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      );

      if (!manipResult.base64) {
        throw new Error('Échec de la conversion en base64');
      }

      return manipResult.base64;
    } catch (error) {
      console.error('Error processing image:', error);
      throw new Error("Erreur lors du traitement de l'image");
    }
  };

  const handleCapture = async () => {
    if (!isCameraAvailable || !hasPermission) {
      setError("La caméra n'est pas disponible ou l'accès a été refusé.");
      return;
    }

    if (cameraRef.current) {
      try {
        setError(null);

        const photo = await cameraRef.current.takePictureAsync({
          quality: 1,
          base64: true,
        });

        if (photo.base64) {
          const processedBase64 = await processImage(photo.uri);
          setCapturedImages((prev) => [
            ...prev,
            { uri: photo.uri, base64: processedBase64 },
          ]);

          thumbnailScale.value = withSequence(withSpring(1.2), withSpring(1));
        } else {
          throw new Error('Camera capture failed to provide base64 data');
        }
      } catch (error) {
        console.error('Capture error:', error);
        setError('Erreur lors de la capture. Veuillez réessayer.');
      }
    }
  };

 const compressImageToBase64 = async (
  uri: string,
  maxSizeKB = 50,
  minQuality = 0.1,
  minWidth = 300
): Promise<string> => {
  let compressQuality = 0.9;
  let width = 1024;

  while (width >= minWidth) {
    while (compressQuality >= minQuality) {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width } }],
        {
          compress: compressQuality,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      );

      const base64Length = result.base64.length * (3 / 4); // rough estimate
      const sizeInKB = base64Length / 1024;

      if (sizeInKB <= maxSizeKB) {
        return result.base64 ?? '';
      }

      compressQuality -= 0.1;
    }

    width = Math.floor(width * 0.8);
    compressQuality = 0.9; 
  }

  throw new Error(`not able to compress the image to ${maxSizeKB}KB`);
}

  const handleAnalyzeImages = async () => {
    if (capturedImages.length === 0) {
      setError('Aucune image à analyser');
      return;
    }

    try {
      setIsAnalyzing(true);
      setError(null);
      setShowCaptureOptions(false);

      // const base64Images = capturedImages.map((img) => img.base64);
      const base64Images = await compressImageToBase64(capturedImages[0].uri);
      console.log('base64Images=', base64Images);
      
      const result = await analyzeClothing(base64Images);

      setAnalysisResult(result);
      setLastCapturedImage(capturedImages[0].uri);

      const mimeType = capturedImages[0].base64.startsWith('/9j/')
        ? 'image/jpeg'
        : 'image/png';

        console.log('capturedImages[0].uri=', capturedImages[0].uri);

      addHistoryItem({
        name: result.title,
        temperature: result.summary.temperature,
        cycle: result.summary.program,
        image: `data:${mimeType};base64,${capturedImages[0].base64}`,
        analysisResult: result,
        userId: user?.uid,
      });
    } catch (error) {
      console.error('Analysis error:', error);
      setError(
        error instanceof Error ? error.message : "Erreur lors de l'analyse"
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRemoveLastImage = () => {
    if (capturedImages.length > 0) {
      setCapturedImages((prev) => prev.slice(0, -1));
    }
  };

  const handleRemoveImage = (index: number) => {
    setCapturedImages((prev) => prev.filter((_, i) => i !== index));
    if (capturedImages.length <= 1) {
      setShowCaptureOptions(false);
    }
  };

  const handleNewAnalysis = useCallback(() => {
    setAnalysisResult(null);
    setLastCapturedImage(null);
    setError(null);
    setIsAnalyzing(false);
    setCapturedImages([]);
  }, []);

  const renderThumbnails = () => {
    if (capturedImages.length === 0) return null;

    return (
      <View style={styles.thumbnailsContainer}>
        {capturedImages.map((image, index) => {
          // Create a reversed index to handle fan effect right to left
          const reversedIndex = capturedImages.length - 1 - index;

          return (
            <Animated.View
              key={index}
              style={[
                styles.thumbnailWrapper,
                {
                  right: reversedIndex * 10, // Reduced offset for a more subtle fan effect
                  zIndex: reversedIndex, // Ensure proper stacking order
                },
              ]}
            >
              <Image source={{ uri: image.uri }} style={styles.thumbnail} />
            </Animated.View>
          );
        })}
        {capturedImages.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{capturedImages.length}</Text>
          </View>
        )}
      </View>
    );
  };

  const cornerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withTiming(cornerScale.value, {
            duration: MODE_ANIMATION_DURATION,
            easing: Easing.inOut(Easing.ease),
          }),
        },
      ],
    };
  }, []);

  const renderCorners = useCallback(
    () => (
      <Animated.View style={[styles.cornersContainer, cornerAnimatedStyle]}>
        <View style={[styles.corner, styles.topLeft]} />
        <View style={[styles.corner, styles.topRight]} />
        <View style={[styles.corner, styles.bottomLeft]} />
        <View style={[styles.corner, styles.bottomRight]} />
      </Animated.View>
    ),
    [cornerAnimatedStyle]
  );

  const handleModeChange = useCallback(
    (newMode: ScanMode) => {
      setError(null);
      setAnalysisResult(null);

      if (newMode === 'gallery') {
        handleGalleryAccess();
        return;
      }

      if (
        !isCameraAvailable &&
        (newMode === 'garment' || newMode === 'label')
      ) {
        setError(t('analyze.cameraNotAvailable'));
        return;
      }

      cornerScale.value = withTiming(
        newMode === 'garment' ? GARMENT_SCALE : LABEL_SCALE,
        {
          duration: MODE_ANIMATION_DURATION,
          easing: Easing.inOut(Easing.ease),
        }
      );
      setMode(newMode);
    },
    [isCameraAvailable]
  );

  const handleGalleryAccess = useCallback(async () => {
    try {
      setError(null);
      previousMode.current = mode;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        setLastCapturedImage(result.assets[0].uri);
        if (result.assets[0].base64) {
          await analyzeImage(result.assets[0].base64);
        } else {
          throw new Error('Image base64 data not available');
        }
      }

      setMode(previousMode.current);
    } catch (error) {
      console.error('Gallery access error:', error);
      setError("Impossible de charger l'image. Veuillez réessayer.");
      setMode(previousMode.current);
    }
  }, [mode]);

  const analyzeImage = useCallback(
    async (base64Image: string) => {
      try {
        setError(null);
        setIsAnalyzing(true);
        setAnalysisResult(null);

        const result = await analyzeClothing(base64Image);
        setAnalysisResult(result);

        if (lastCapturedImage) {
          addHistoryItem({
            name: result.title,
            temperature: result.summary.temperature,
            cycle: result.summary.program,
            image: lastCapturedImage,
            analysisResult: result,
          });
        }

        setIsAnalyzing(false);
      } catch (error) {
        console.error('Analysis error:', error);
        setError(
          error instanceof Error ? error.message : "Erreur lors de l'analyse"
        );
        setIsAnalyzing(false);
      }
    },
    [lastCapturedImage, addHistoryItem]
  );

  const renderModeButtons = useCallback(
    () => (
      <View style={styles.modeButtonsContainer}>
        <Pressable
          style={[
            styles.modeButton,
            mode === 'label' && styles.activeModeButton,
          ]}
          onPress={() => handleModeChange('label')}
        >
          <Tag
            size={ICON_SIZE}
            color={mode === 'label' ? '#000000' : '#ffffff'}
          />
          <Text
            style={[
              styles.modeButtonText,
              mode === 'label' && styles.activeModeButtonText,
            ]}
          >
            {t('analyze.label')}
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.modeButton,
            mode === 'garment' && styles.activeModeButton,
          ]}
          onPress={() => handleModeChange('garment')}
        >
          <LucideCamera
            size={ICON_SIZE}
            color={mode === 'garment' ? '#000000' : '#ffffff'}
          />
          <Text
            style={[
              styles.modeButtonText,
              mode === 'garment' && styles.activeModeButtonText,
            ]}
          >
            {t('analyze.garment')}
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.modeButton,
            mode === 'gallery' && styles.activeModeButton,
          ]}
          onPress={() => handleModeChange('gallery')}
        >
          <ImageIcon
            size={ICON_SIZE}
            color={mode === 'gallery' ? '#000000' : '#ffffff'}
          />
          <Text
            style={[
              styles.modeButtonText,
              mode === 'gallery' && styles.activeModeButtonText,
            ]}
          >
            {t('analyze.gallery')}
          </Text>
        </Pressable>
      </View>
    ),
    [mode, handleModeChange]
  );

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      {!isAnalyzing && !analysisResult && (
        <Link href="/(tabs)" asChild>
          <Pressable style={styles.backButtonTouchArea}>
            <View style={styles.backButtonWrapper}>
              <View style={styles.backButtonInner}>
                <ChevronLeft size={24} color="#3A8DFF" />
              </View>
            </View>
          </Pressable>
        </Link>
      )}

      {isCameraAvailable && hasPermission ? (
        <CameraView ref={cameraRef} style={styles.camera} facing={'back'} />
      ) : (
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>
            {error || t('analyze.cameraNotAvailable')}
          </Text>
          <Pressable
            style={styles.galleryButton}
            onPress={() => handleModeChange('gallery')}
          >
            <Text style={styles.galleryButtonText}>
              {t('analyze.useGallery')}
            </Text>
          </Pressable>
        </View>
      )}

      {!analysisResult && !isAnalyzing && (
        <>
          {renderCorners()}
          {renderModeButtons()}
          {renderThumbnails()}

          {/* Bouton pour supprimer la dernière photo */}
          {capturedImages.length > 0 && (
            <Pressable
              style={styles.removeButton}
              onPress={handleRemoveLastImage}
            >
              <X size={22} color="#FF3B30" />
            </Pressable>
          )}

          {/* Bouton d'analyse en haut à droite */}
          {capturedImages.length > 0 && (
            <Pressable
              style={styles.analyzeButton}
              onPress={handleAnalyzeImages}
            >
              <LinearGradient
                colors={['#3D5AFE', '#40B3FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.analyzeButtonGradient}
              >
                <Check size={18} color="#FFFFFF" />
                <Text style={styles.analyzeButtonText}>
                  {t('analyze.analyzeButton')}
                </Text>
              </LinearGradient>
            </Pressable>
          )}

          <Pressable style={styles.captureButton} onPress={handleCapture}>
            <View style={styles.captureButtonInner} />
          </Pressable>
        </>
      )}

      {error && !isAnalyzing && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {isAnalyzing ? (
        <LoadingScreen />
      ) : analysisResult ? (
        <AnalysisResults
          analysisResult={analysisResult}
          lastCapturedImage={lastCapturedImage}
          onNewAnalysis={handleNewAnalysis}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  messageContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  messageText: {
    color: '#ffffff',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  galleryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  galleryButtonText: {
    color: '#ffffff',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  cornersContainer: {
    position: 'absolute',
    top: -40,
    left: 0,
    right: 0,
    bottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: BASE_CORNER_SIZE_H,
    height: BASE_CORNER_SIZE_V,
    borderColor: '#FFFFFF',
    borderWidth: CORNER_THICKNESS,
    borderRadius: CORNER_RADIUS,
  },
  topLeft: {
    top: '15%',
    left: '10%',
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: '15%',
    right: '10%',
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: '15%',
    left: '10%',
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: '15%',
    right: '10%',
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  modeButtonsContainer: {
    position: 'absolute',
    bottom: BOTTOM_SPACING,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: BUTTON_SPACING,
    paddingHorizontal: 20,
    marginTop: MODE_BUTTONS_TOP_MARGIN,
  },
  modeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    height: BUTTON_HEIGHT,
    paddingHorizontal: 12,
    borderRadius: BUTTON_HEIGHT / 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  activeModeButton: {
    backgroundColor: '#E3F2FD',
    borderColor: '#E3F2FD',
  },
  modeButtonText: {
    fontFamily: 'Inter-Regular',
    color: '#ffffff',
    fontSize: 12,
  },
  activeModeButtonText: {
    color: '#000000',
    fontFamily: 'Inter-SemiBold',
  },
  captureButton: {
    position: 'absolute',
    bottom: BOTTOM_SPACING + CAPTURE_BUTTON_MARGIN,
    alignSelf: 'center',
    width: CAPTURE_BUTTON_SIZE,
    height: CAPTURE_BUTTON_SIZE,
    borderRadius: CAPTURE_BUTTON_SIZE / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  captureButtonInner: {
    width: CAPTURE_BUTTON_SIZE - 12,
    height: CAPTURE_BUTTON_SIZE - 12,
    borderRadius: (CAPTURE_BUTTON_SIZE - 12) / 2,
    backgroundColor: '#ffffff',
  },
  errorContainer: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 68, 68, 0.8)',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
  },
  backButtonTouchArea: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
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
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  thumbnailsContainer: {
    position: 'absolute',
    bottom: BOTTOM_SPACING + CAPTURE_BUTTON_SIZE + 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnailWrapper: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  countBadge: {
    position: 'absolute',
    bottom: -15,
    right: -12,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    color: '#3A8DFF',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  removeButton: {
    position: 'absolute',
    bottom: BOTTOM_SPACING + CAPTURE_BUTTON_SIZE + 20,
    right: 80,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999
  },
  analyzeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 64 : 44,
    right: 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  analyzeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 6,
  },
  analyzeButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  }
});