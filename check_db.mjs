import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA2X-1HOFVCmRsTp8K9_b_47BLcP8DjxGA",
  authDomain: "kun-stack.firebaseapp.com",
  projectId: "kun-stack",
  storageBucket: "kun-stack.firebasestorage.app",
  messagingSenderId: "599577615528",
  appId: "1:599577615528:web:f84582abba91e8fa72b69d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, 'ai-studio-kunstoreredediti-e62e49c8-6a96-4f6e-a296-f5375083907e');

async function check() {
  const snapshot = await getDocs(collection(db, "apps"));
  let totalSize = 0;
  for (const d of snapshot.docs) {
    const data = JSON.stringify(d.data());
    console.log(`App ${d.id} size: ${(data.length / 1024).toFixed(2)} KB`);
    totalSize += data.length;
  }
  console.log(`Total payload size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  process.exit(0);
}
check().catch(console.error);
