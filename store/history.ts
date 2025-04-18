import { create } from 'zustand';
import { collection, addDoc, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db, COLLECTIONS } from '../services/firebase';
import type { ClothingCare } from '../services/openai';

export type HistoryItem = {
  id: string;
  name: string;
  date: string;
  temperature: string;
  cycle: string;
  image: string;
  analysisResult: ClothingCare;
  userId?: string;
};

type HistoryStore = {
  items: HistoryItem[];
  loading: boolean;
  error: string | null;
  fetchUserHistory: (userId: string) => Promise<void>;
  addItem: (item: Omit<HistoryItem, 'id' | 'date'>) => Promise<void>;
  clearHistory: (userId: string) => Promise<void>;
};

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  fetchUserHistory: async (userId: string) => {
    try {
      set({ loading: true, error: null });
      
      const historyRef = collection(db, COLLECTIONS.HISTORY);
      
      // Query only items for the specific user
      const basicQuery = query(
        historyRef,
        where('userId', '==', userId)
      );
      
      const snapshot = await getDocs(basicQuery);
      
      if (snapshot.empty) {
        set({ items: [], loading: false });
        return;
      }
      
      try {
        // If data exists, attempt the ordered query
        const orderedQuery = query(
          historyRef,
          where('userId', '==', userId),
          orderBy('date', 'desc')
        );
        
        const orderedSnapshot = await getDocs(orderedQuery);
        const historyItems: HistoryItem[] = [];
        
        orderedSnapshot.forEach((doc) => {
          const data = doc.data();
          historyItems.push({
            id: doc.id,
            ...data,
            date: new Date(data.date).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })
          } as HistoryItem);
        });
        
        set({ items: historyItems, loading: false });
      } catch (indexError) {
        // If ordered query fails due to missing index, fall back to manual sorting
        console.warn('Ordered query failed, falling back to manual sort:', indexError);
        
        const items = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: new Date(data.date).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })
          } as HistoryItem;
        });
        
        // Sort items manually by date
        items.sort((a, b) => {
          try {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return dateB - dateA;
          } catch (error) {
            // If date parsing fails, using original date strings
            const rawDateA = doc.data().date;
            const rawDateB = doc.data().date;
            if (typeof rawDateA === 'string' && typeof rawDateB === 'string') {
              return rawDateB.localeCompare(rawDateA);
            }
            return 0;
          }
        });
        
        set({ 
          items,
          loading: false,
          error: 'Une indexation est requise pour le tri optimal. Le tri manuel est utilisé temporairement.'
        });
        
        // Display a helpful message about the needed index
        console.info(
          "To create the required index, go to: https://console.firebase.google.com/project/washp-bis/firestore/indexes"
        );
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      let errorMessage = 'Erreur lors de la récupération de l\'historique';
      
      if (error instanceof Error) {
        if (error.message.includes('permission-denied')) {
          errorMessage = 'Accès non autorisé à l\'historique';
        }
      }
      
      set({ 
        error: errorMessage,
        loading: false,
        items: [] // Clear items on error
      });
    }
  },

  addItem: async (item: Omit<HistoryItem, 'id' | 'date'>) => {
    try {
      set({ loading: true, error: null });
      
      if (!item.userId) {
        throw new Error('Utilisateur non connecté');
      }
      
      const timestamp = new Date().toISOString();
      const newItem = {
        ...item,
        date: timestamp,
      };
      
      const docRef = await addDoc(collection(db, COLLECTIONS.HISTORY), newItem);
      
      const savedItem: HistoryItem = {
        ...newItem,
        id: docRef.id,
        date: new Date(timestamp).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      };
      
      set(state => ({
        items: [savedItem, ...state.items],
        loading: false
      }));
    } catch (error) {
      console.error('Error adding history item:', error);
      let errorMessage = 'Erreur lors de l\'ajout à l\'historique';
      
      if (error instanceof Error) {
        if (error.message.includes('permission-denied')) {
          errorMessage = 'Accès non autorisé pour ajouter à l\'historique';
        } else if (error.message.includes('Utilisateur non connecté')) {
          errorMessage = error.message;
        }
      }
      
      set({ 
        error: errorMessage,
        loading: false 
      });
    }
  },

  clearHistory: async (userId: string) => {
    try {
      set({ loading: true, error: null });
      
      const historyRef = collection(db, COLLECTIONS.HISTORY);
      const q = query(historyRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      const deletePromises = querySnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      
      await Promise.all(deletePromises);
      
      set({ items: [], loading: false });
    } catch (error) {
      console.error('Error clearing history:', error);
      let errorMessage = 'Erreur lors de la suppression de l\'historique';
      
      if (error instanceof Error) {
        if (error.message.includes('permission-denied')) {
          errorMessage = 'Accès non autorisé pour supprimer l\'historique';
        }
      }
      
      set({ 
        error: errorMessage,
        loading: false 
      });
    }
  }
}));