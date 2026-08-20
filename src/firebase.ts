import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where, updateDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

const firebaseConfig = {
  projectId: "compelling-bongo-4wh20",
  appId: "1:634465762619:web:dd94c61fa6f21f51a84b1e",
  apiKey: "AIzaSyBU53e3dH_FpDDURDtnkeXdbuF8kbSa9kY",
  authDomain: "compelling-bongo-4wh20.firebaseapp.com",
  storageBucket: "compelling-bongo-4wh20.firebasestorage.app",
  messagingSenderId: "634465762619",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, 'ai-studio-kunstoreredediti-e62e49c8-6a96-4f6e-a296-f5375083907e');
const auth = getAuth(app);

export { app, db, auth };
