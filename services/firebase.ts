import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBR_bUV0dnWEbKIeJAGvzhoJ30BuhcyvJw",
  authDomain: "washp-bis.firebaseapp.com",
  projectId: "washp-bis",
  storageBucket: "washp-bis.firebasestorage.app",
  messagingSenderId: "38439046094",
  appId: "1:38439046094:web:e729b1c86423bb750db99f",
  measurementId: "G-PVF85R65KR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// Define app email for support and notifications
export const APP_EMAIL = 'app.washp.ai@gmail.com';

// Collection references
export const COLLECTIONS = {
  HISTORY: 'history',
  USERS: 'users',
} as const;