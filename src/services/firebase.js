import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  doc,
  updateDoc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import { getAnalytics, logEvent } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);
export const googleProvider = new GoogleAuthProvider();

// Authentication functions
export const signUp = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await createUserProfile(userCredential.user);
    logEvent(analytics, 'sign_up');
    return userCredential.user;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    logEvent(analytics, 'login');
    return userCredential.user;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    await createUserProfile(result.user);
    logEvent(analytics, 'google_sign_in');
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    logEvent(analytics, 'sign_out');
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// User Profile functions
export const createUserProfile = async (user) => {
  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      email: user.email,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

// Startup Analysis functions
export const saveStartupAnalysis = async (analysisData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User must be logged in to save analysis');

    const analysisWithMetadata = {
      ...analysisData,
      userId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'analyses'), analysisWithMetadata);
    logEvent(analytics, 'analysis_created', {
      industry: analysisData.industry
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving analysis:', error);
    throw error;
  }
};

export const getUserAnalysis = async () => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User must be logged in to get analysis');

    const q = query(
      collection(db, 'analyses'),
      where('userId', '==', user.uid)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting analysis:', error);
    throw error;
  }
};

export const updateAnalysis = async (analysisId, updateData) => {
  try {
    const docRef = doc(db, 'analyses', analysisId);
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
    logEvent(analytics, 'analysis_updated');
  } catch (error) {
    console.error('Error updating analysis:', error);
    throw error;
  }
};

// Report Generation and Storage
export const saveReport = async (analysisId, reportData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User must be logged in to save report');

    // Save report metadata to Firestore
    const reportRef = doc(db, 'reports', analysisId);
    await setDoc(reportRef, {
      userId: user.uid,
      createdAt: serverTimestamp(),
      ...reportData
    });

    logEvent(analytics, 'report_generated');
    return reportRef.id;
  } catch (error) {
    console.error('Error saving report:', error);
    throw error;
  }
};

// Export PDF to Storage
export const exportPDF = async (analysisId, pdfBlob) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User must be logged in to export PDF');

    const storageRef = ref(storage, `reports/${user.uid}/${analysisId}.pdf`);
    await uploadBytes(storageRef, pdfBlob);
    const downloadURL = await getDownloadURL(storageRef);

    logEvent(analytics, 'pdf_exported');
    return downloadURL;
  } catch (error) {
    console.error('Error exporting PDF:', error);
    throw error;
  }
};

export default app;
