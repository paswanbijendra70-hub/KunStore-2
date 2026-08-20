import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import StoreFront from './StoreFront';
import DeveloperPortal from './DeveloperPortal';
import AppDetails from './AppDetails';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        const isAdmin = currentUser.email === 'paswanbijendra70@gmail.com';
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (isAdmin && data.role !== 'admin') {
            const updatedData = { ...data, role: 'admin', developerPlan: 'plan_250' };
            await setDoc(docRef, updatedData, { merge: true });
            setUserData(updatedData);
          } else {
            setUserData(data);
          }
        } else {
          const newUserData = {
            uid: currentUser.uid,
            email: currentUser.email,
            role: isAdmin ? 'admin' : 'user',
            developerPlan: isAdmin ? 'plan_250' : null
          };
          await setDoc(docRef, newUserData);
          setUserData(newUserData);
        }
      } else {
        setUserData(null);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StoreFront user={user} userData={userData} />} />
        <Route path="/app/:id" element={<AppDetails user={user} />} />
        <Route path="/developer/*" element={<DeveloperPortal user={user} userData={userData} />} />
      </Routes>
    </BrowserRouter>
  );
}
