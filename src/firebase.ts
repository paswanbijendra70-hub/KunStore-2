import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where, updateDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyA2X-1HOFVCmRsTp8K9_b_47BLcP8DjxGA",
  authDomain: "kun-stack.firebaseapp.com",
  projectId: "kun-stack",
  storageBucket: "kun-stack.firebasestorage.app",
  messagingSenderId: "599577615528",
  appId: "1:599577615528:web:f84582abba91e8fa72b69d",
  measurementId: "G-LG5TLWV18L"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, 'ai-studio-kunstoreredediti-e62e49c8-6a96-4f6e-a296-f5375083907e');
const auth = getAuth(app);

const storage = getStorage(app);
export { app, db, auth, storage };
