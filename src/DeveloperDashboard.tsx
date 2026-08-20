import React, { useEffect, useState, useRef } from 'react';
import { db } from './firebase';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { PlusCircle, Star, Edit, Trash2, Upload, X } from 'lucide-react';

export default function DeveloperDashboard({ user, userData }: { user: any, userData: any }) {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [updatingApp, setUpdatingApp] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingApp, setEditingApp] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({ name: '', description: '', category: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchMyApps = async () => {
      try {
        const q = query(collection(db, 'apps'), where('developerId', '==', user.uid));
        const snapshot = await getDocs(q);
        setApps(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyApps();
  }, [user]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !updatingApp) return;
    
    if (file.size > 800000) {
      alert("File is too large for database storage (max 800KB).");
      return;
    }

    setIsUploading(true);
    try {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve(ev.target?.result as string);
        reader.readAsDataURL(file);
      });

      await updateDoc(doc(db, 'apps', updatingApp.id), {
        downloadUrl: base64,
        apkName: file.name
      });
      
      setApps(apps.map(a => a.id === updatingApp.id ? { ...a, downloadUrl: base64, apkName: file.name } : a));
      alert("App file updated successfully!");
      setUpdatingApp(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update app file.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteApp = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this app? This action cannot be undone.")) return;
    
    try {
      await deleteDoc(doc(db, 'apps', id));
      setApps(apps.filter(a => a.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete app.");
    }
  };

  const openEditModal = (app: any) => {
    setEditingApp(app);
    setEditFormData({
      name: app.name || '',
      description: app.description || '',
      category: app.category || 'Apps'
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const saveAppEdits = async () => {
    if (!editingApp) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'apps', editingApp.id), editFormData);
      setApps(apps.map(a => a.id === editingApp.id ? { ...a, ...editFormData } : a));
      setEditingApp(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update app details.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="text-gray-500 font-medium">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Manage your published apps and games.</p>
        </div>
        <Link to="/developer/apps/new" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-5 rounded-xl transition-colors flex items-center gap-2 shadow-sm">
          <PlusCircle className="w-5 h-5" /> New App
        </Link>
      </div>

      {apps.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4">
            <PlusCircle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No apps published yet</h3>
          <p className="text-gray-500 mb-6 max-w-sm">Start your developer journey by publishing your first app to KunStore.</p>
          <Link to="/developer/apps/new" className="bg-gray-900 hover:bg-black text-white font-bold py-3 px-8 rounded-xl transition-colors">
            Publish App
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto shadow-sm">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-4 px-6 font-bold text-gray-700 text-sm uppercase tracking-wider">App</th>
                <th className="py-4 px-6 font-bold text-gray-700 text-sm uppercase tracking-wider">Category</th>
                <th className="py-4 px-6 font-bold text-gray-700 text-sm uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 font-bold text-gray-700 text-sm uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {apps.map(app => (
                <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-xl overflow-hidden shrink-0">
                        {app.icon ? <img src={app.icon} alt={app.name} className="w-full h-full object-cover" /> : <span className="w-full h-full flex items-center justify-center font-bold text-gray-400">{app.name.charAt(0)}</span>}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{app.name}</div>
                        <div className="text-sm text-gray-500">{app.platforms.join(', ')}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-600 font-medium">{app.category}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${app.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {app.status === 'published' ? 'Published' : 'Pending'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => openEditModal(app)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Edit App Details"
                        disabled={isUploading}
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => {
                          setUpdatingApp(app);
                          fileInputRef.current?.click();
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Update App File"
                        disabled={isUploading}
                      >
                        <Upload className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteApp(app.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete App"
                        disabled={isUploading}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Hidden file input for updates */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept=".apk,.aab,.exe,.dmg"
      />
      
      {isUploading && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-bold text-gray-900">Uploading new file...</p>
          </div>
        </div>
      )}
      
      {/* Edit App Modal */}
      {editingApp && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Edit App</h3>
              <button onClick={() => setEditingApp(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">App Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={editFormData.name} 
                  onChange={handleEditChange} 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-red-500" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                <textarea 
                  name="description" 
                  rows={3} 
                  value={editFormData.description} 
                  onChange={handleEditChange} 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-red-500" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                <select 
                  name="category" 
                  value={editFormData.category} 
                  onChange={handleEditChange} 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-red-500"
                >
                  <option value="Apps">Apps</option>
                  <option value="Games">Games</option>
                  <option value="Articles">Articles</option>
                </select>
              </div>
            </div>
            
            <div className="mt-8 flex gap-3">
              <button 
                onClick={() => setEditingApp(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-xl transition-colors"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button 
                onClick={saveAppEdits}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
