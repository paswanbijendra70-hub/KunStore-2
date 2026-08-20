import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { CheckCircle, XCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [pendingApps, setPendingApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingApps();
  }, []);

  const fetchPendingApps = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'apps'), where('status', '==', 'pending'));
      const snapshot = await getDocs(q);
      setPendingApps(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (appId: string) => {
    try {
      await updateDoc(doc(db, 'apps', appId), { status: 'published' });
      setPendingApps(pendingApps.filter(app => app.id !== appId));
    } catch (err) {
      console.error(err);
      alert('Failed to approve');
    }
  };

  const handleReject = async (appId: string) => {
    try {
      await updateDoc(doc(db, 'apps', appId), { status: 'rejected' });
      setPendingApps(pendingApps.filter(app => app.id !== appId));
    } catch (err) {
      console.error(err);
      alert('Failed to reject');
    }
  };

  if (loading) return <div className="p-6">Loading pending apps...</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-black text-gray-900 mb-2">Admin Dashboard</h1>
      <p className="text-gray-600 mb-8">Review and approve pending applications.</p>

      {pendingApps.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500">
          No pending apps to review.
        </div>
      ) : (
        <div className="space-y-4">
          {pendingApps.map(app => (
            <div key={app.id} className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col md:flex-row gap-6 justify-between shadow-sm">
              <div className="flex gap-4 items-start">
                <img src={app.icon || 'https://via.placeholder.com/150'} alt={app.name} className="w-16 h-16 rounded-xl object-cover bg-gray-100" />
                <div>
                  <h3 className="font-bold text-xl text-gray-900">{app.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">{app.developerName || app.developerId}</p>
                  <p className="text-sm text-gray-700 line-clamp-2">{app.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button onClick={() => handleApprove(app.id)} className="bg-green-100 text-green-700 hover:bg-green-200 font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" /> Approve
                </button>
                <button onClick={() => handleReject(app.id)} className="bg-red-100 text-red-700 hover:bg-red-200 font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                  <XCircle className="w-5 h-5" /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
