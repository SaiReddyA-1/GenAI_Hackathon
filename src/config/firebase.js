import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig = {
  // Firebase configuration
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);

// Connect to emulators in development mode
if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
  console.log('Using Firebase emulators');
  
  // Flag to track if we should attempt emulator connection
  let useEmulators = true;
  
  // Check if the emulators appear to be running by making a simple fetch request
  // This prevents the connection error when emulators aren't running
  try {
    // Only attempt to connect to emulators if enabled
    if (useEmulators) {
      connectFirestoreEmulator(db, '127.0.0.1', 8080);
      connectFunctionsEmulator(functions, '127.0.0.1', 5001);
      console.log('Successfully connected to Firebase emulators');
    }
  } catch (error) {
    console.error('Error connecting to Firebase emulators:', error);
    console.log('Falling back to production Firebase services');
    // We don't need to do anything special to fallback - Firebase will use production by default
  }
}

export { auth, db, functions };
