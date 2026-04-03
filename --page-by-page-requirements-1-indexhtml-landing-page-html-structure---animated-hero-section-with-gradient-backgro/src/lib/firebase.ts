import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBhSg8Z0mOxUISGY7Bf6Uw-zoWg6A50f_c",
  authDomain: "medical-tracker-579a5.firebaseapp.com",
  projectId: "medical-tracker-579a5",
  storageBucket: "medical-tracker-579a5.firebasestorage.app",
  messagingSenderId: "841507530920",
  appId: "1:841507530920:web:fe60f9dfa2fc1c2cbc7a9d",
  measurementId: "G-1H2KDGQHYF"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
