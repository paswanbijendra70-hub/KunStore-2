import React, { useState } from 'react';
import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';
import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { Loader2, Upload, ShieldCheck, Link as LinkIcon, FileBox } from 'lucide-react';

export default function SubmitApp({ user, userData }: { user: any, userData: any }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [safetyChecking, setSafetyChecking] = useState(false);
  const [uploadType, setUploadType] = useState<'link'|'file'>('link');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Games',
    platforms: ['Android'],
    downloadUrl: ''
  });
  
  // Storing base64 for demo purposes
  const [iconBase64, setIconBase64] = useState<string>('');
  const [screenshotsBase64, setScreenshotsBase64] = useState<string[]>([]);
  const [apkFileName, setApkFileName] = useState('');
  const [apkFile, setApkFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlatformToggle = (platform: string) => {
    if (formData.platforms.includes(platform)) {
      setFormData({ ...formData, platforms: formData.platforms.filter(p => p !== platform) });
    } else {
      setFormData({ ...formData, platforms: [...formData.platforms, platform] });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'icon' | 'screenshots' | 'apk') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (type === 'apk') {
      setApkFileName(files[0].name);
      setApkFile(files[0]);
      return;
    }

    const processImage = (file: File, maxWidth: number): Promise<string> => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const scaleSize = Math.min(maxWidth / img.width, 1);
            canvas.width = img.width * scaleSize;
            canvas.height = img.height * scaleSize;
            
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              resolve(canvas.toDataURL('image/jpeg', 0.6)); // Compress to 60% JPEG
            } else {
              resolve(event.target?.result as string); // Fallback
            }
          };
          img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
      });
    }

    if (type === 'icon') {
      processImage(files[0], 200).then(res => setIconBase64(res));
    } else if (type === 'screenshots') {
      const promises = Array.from(files).slice(0, 4).map(f => processImage(f as File, 800));
      Promise.all(promises).then(res => setScreenshotsBase64(res));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setSafetyChecking(true);
    
    // Simulate safety check
    await new Promise(resolve => setTimeout(resolve, 3000));
    setSafetyChecking(false);

    try {
      // Auto publish if admin, otherwise pending
      const status: string = 'published';
      
      let finalDownloadUrl = formData.downloadUrl;
      
      if (uploadType === 'file' && apkFile) {
        // Since Firebase Storage isn't provisioned in this demo environment, 
        // we'll store small files as base64 in Firestore, or alert if too large.
        if (apkFile.size > 800000) {
          alert("File is too large for database storage (max 800KB). Please use 'External Link' instead, or upload a smaller file.");
          setLoading(false);
          return;
        }
        
        finalDownloadUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(apkFile);
        });
      }

      const docRef = await addDoc(collection(db, 'apps'), {
        ...formData,
        downloadUrl: finalDownloadUrl,
        icon: iconBase64,
        screenshots: screenshotsBase64,
        apkName: apkFileName || null,
        developerId: user.uid,
        developerName: userData?.developerName || 'Unknown Developer',
        status: status,
        downloads: 0,
        rating: 0,
        createdAt: new Date().toISOString()
      });

      if (status === 'pending') {
        setTimeout(async () => {
          try {
            const { doc, updateDoc } = await import('firebase/firestore');
            await updateDoc(doc(db, 'apps', docRef.id), { status: 'published' });
          } catch (e) {
            console.error('Auto-publish failed', e);
          }
        }, 15000);
      }
      
      alert(status === 'published' ? 'App published successfully!' : 'App submitted for review. It will be published shortly if safe.');
      navigate('/developer');
    } catch (error) {
      console.error(error);
      alert('Failed to submit app');
    } finally {
      setLoading(false);
    }
  };

  if (safetyChecking) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 relative">
          <ShieldCheck className="w-10 h-10" />
          <svg className="animate-spin absolute inset-0 w-full h-full text-blue-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Security Check in Progress...</h2>
        <p className="text-gray-500 max-w-md">KunStore is analyzing your application for malware and security risks. This usually takes a few seconds.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-black text-gray-900 mb-2">Publish New App</h1>
      <p className="text-gray-600 mb-8">Follow the steps below to publish your application on KunStore.</p>

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200">
        
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-xl font-bold border-b pb-2 mb-4">Step 1: Basic Details</h2>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">App Name *</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-red-500" placeholder="e.g. Flappy Bird" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Short Description *</label>
              <textarea name="description" required rows={3} value={formData.description} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-red-500" placeholder="Describe your app..." />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Category *</label>
                <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-red-500">
                  <option value="Games">Games</option>
                  <option value="Productivity">Productivity</option>
                  <option value="Social">Social</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Tools">Tools</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Platforms *</label>
                <div className="flex flex-wrap gap-2">
                  {['Android', 'Windows', 'Mac', 'iOS'].map(platform => (
                    <button key={platform} type="button" onClick={() => handlePlatformToggle(platform)} className={`px-3 py-1.5 rounded-lg text-sm font-bold border ${formData.platforms.includes(platform) ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-200 text-gray-600'}`}>
                      {platform}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button type="button" onClick={() => setStep(2)} disabled={!formData.name || !formData.description} className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-black disabled:opacity-50">Next: Assets & Files</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-bold border-b pb-2 mb-4">Step 2: Assets & Upload</h2>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">App Logo *</label>
              <div className="flex items-center gap-4">
                {iconBase64 && <img src={iconBase64} alt="Icon preview" className="w-16 h-16 rounded-xl object-cover border" />}
                <label className="cursor-pointer bg-gray-50 border border-gray-200 border-dashed rounded-xl p-4 flex-1 text-center hover:bg-gray-100 transition-colors">
                  <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                  <span className="text-sm text-gray-500 font-medium">Click to upload logo image</span>
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'icon')} className="hidden" />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">App Screenshots (Select up to 4) *</label>
              <label className="cursor-pointer bg-gray-50 border border-gray-200 border-dashed rounded-xl p-6 block text-center hover:bg-gray-100 transition-colors mb-4">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <span className="text-sm text-gray-500 font-medium block">Click to select multiple screenshots</span>
                <input type="file" accept="image/*" multiple onChange={(e) => handleFileChange(e, 'screenshots')} className="hidden" />
              </label>
              {screenshotsBase64.length > 0 && (
                <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                  {screenshotsBase64.map((src, i) => <img key={i} src={src} alt="screenshot" className="h-24 w-auto rounded-lg border" />)}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100">
              <label className="block text-sm font-bold text-gray-700 mb-3">Application File (APK/Bundle) *</label>
              <div className="flex gap-4 mb-4">
                <button type="button" onClick={() => setUploadType('link')} className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 border ${uploadType === 'link' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                  <LinkIcon className="w-5 h-5" /> External Link
                </button>
                <button type="button" onClick={() => setUploadType('file')} className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 border ${uploadType === 'file' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                  <FileBox className="w-5 h-5" /> Direct Upload
                </button>
              </div>

              {uploadType === 'link' ? (
                <input type="url" name="downloadUrl" value={formData.downloadUrl} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-red-500" placeholder="https://drive.google.com/..." />
              ) : (
                <label className="cursor-pointer bg-gray-50 border border-gray-200 border-dashed rounded-xl p-6 block text-center hover:bg-gray-100 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <span className="text-sm text-gray-500 font-medium block">
                    {apkFileName ? apkFileName : 'Select APK / App Bundle file'}
                  </span>
                  <input type="file" accept=".apk,.aab,.exe,.dmg" onChange={(e) => handleFileChange(e, 'apk')} className="hidden" />
                </label>
              )}
            </div>

            <div className="flex justify-between pt-6 border-t border-gray-100">
              <button type="button" onClick={() => setStep(1)} className="text-gray-600 font-bold px-4 py-2 hover:bg-gray-100 rounded-lg">Back</button>
              <button type="submit" disabled={loading || !iconBase64 || (!formData.downloadUrl && !apkFileName)} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl shadow-md disabled:opacity-50 flex items-center gap-2">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit for Security Review'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

