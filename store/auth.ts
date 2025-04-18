import { create } from 'zustand';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  inMemoryPersistence,
  type User
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, COLLECTIONS } from '../services/firebase';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Stockage de l'état de connexion
const AUTH_STATE_KEY = 'washp_auth_state';

type AuthStore = {
  user: User | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  clearError: () => void;
  sendVerificationEmail: () => Promise<void>;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: true,
  error: null,

  setLoading: (loading: boolean) => set({ loading }),
  clearError: () => set({ error: null }),

  signUp: async (email: string, password: string, name: string) => {
    try {
      set({ loading: true, error: null });
      
      // Set persistence selon la plateforme
      if (Platform.OS === 'web') {
        await setPersistence(auth, browserLocalPersistence);
      }
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      await updateProfile(userCredential.user, {
        displayName: name
      });
      
      await setDoc(doc(db, COLLECTIONS.USERS, userCredential.user.uid), {
        email,
        name,
        createdAt: new Date().toISOString()
      });
      
      // Sauvegarder l'état de connexion pour les plateformes mobiles
      if (Platform.OS !== 'web') {
        await AsyncStorage.setItem(AUTH_STATE_KEY, 'true');
      }
      
      set({ user: userCredential.user, loading: false });
    } catch (error) {
      console.error('Sign up error:', error);
      let errorMessage = 'Une erreur est survenue lors de l\'inscription';
      
      if (error instanceof Error) {
        if (error.message.includes('email-already-in-use')) {
          errorMessage = 'Cette adresse email est déjà utilisée';
        } else if (error.message.includes('invalid-email')) {
          errorMessage = 'Adresse email invalide';
        } else if (error.message.includes('weak-password')) {
          errorMessage = 'Le mot de passe doit contenir au moins 6 caractères';
        }
      }
      
      set({ error: errorMessage, loading: false });
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });
      
      // Set persistence selon la plateforme
      if (Platform.OS === 'web') {
        await setPersistence(auth, browserLocalPersistence);
      }
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Sauvegarder l'état de connexion pour les plateformes mobiles
      if (Platform.OS !== 'web') {
        await AsyncStorage.setItem(AUTH_STATE_KEY, 'true');
      }
      
      set({ user: userCredential.user, loading: false });
    } catch (error) {
      console.error('Sign in error:', error);
      let errorMessage = 'Une erreur est survenue lors de la connexion';
      
      if (error instanceof Error) {
        if (error.message.includes('user-not-found')) {
          errorMessage = 'Aucun compte ne correspond à cette adresse email';
        } else if (error.message.includes('wrong-password')) {
          errorMessage = 'Mot de passe incorrect';
        } else if (error.message.includes('invalid-email')) {
          errorMessage = 'Adresse email invalide';
        } else if (error.message.includes('too-many-requests')) {
          errorMessage = 'Trop de tentatives. Veuillez réessayer plus tard';
        }
      }
      
      set({ error: errorMessage, loading: false });
    }
  },

  signOut: async () => {
    try {
      set({ loading: true, error: null });
      
      await firebaseSignOut(auth);
      
      // Effacer l'état de connexion pour les plateformes mobiles
      if (Platform.OS !== 'web') {
        await AsyncStorage.removeItem(AUTH_STATE_KEY);
      }
      
      set({ user: null, loading: false });
    } catch (error) {
      console.error('Sign out error:', error);
      set({ 
        error: 'Une erreur est survenue lors de la déconnexion',
        loading: false 
      });
    }
  },

  sendVerificationEmail: async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Aucun utilisateur connecté');
      }
      
      // Cette fonction est conservée pour compatibilité mais n'est plus utilisée
      // car la vérification par email a été supprimée
      
      return;
    } catch (error) {
      console.error('Send verification email error:', error);
      throw error;
    }
  }
}));