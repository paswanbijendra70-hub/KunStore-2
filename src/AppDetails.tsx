import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from './firebase';
import { doc, getDoc, addDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { ArrowLeft, Download, Star, AlertTriangle, CheckCircle, MessageSquare } from 'lucide-react';

export default function AppDetails({ user }: { user: any }) {
  const { id } = useParams<{ id: string }>();
  const [app, setApp] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [reporting, setReporting] = useState(false);
  const [bugText, setBugText] = useState('');
  const [bugSubmitted, setBugSubmitted] = useState(false);

  const [reviewing, setReviewing] = useState(false);
  const [ratingInput, setRatingInput] = useState(5);
  const [reviewText, setReviewText] = useState('');

  useEffect(() => {
    const fetchAppAndReviews = async () => {
      if (!id) return;
      const docRef = doc(db, 'apps', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setApp({ id: docSnap.id, ...docSnap.data() });
      }

      const q = query(collection(db, 'reviews'), where('appId', '==', id));
      const revSnap = await getDocs(q);
      setReviews(revSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      
      setLoading(false);
    };
    fetchAppAndReviews();
  }, [id]);

  const handleReportBug = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("Please sign in to report a bug.");
    try {
      await addDoc(collection(db, 'bugs'), {
        appId: id,
        developerId: app.developerId,
        userId: user.uid,
        userEmail: user.email,
        description: bugText,
        createdAt: new Date().toISOString(),
        status: 'open'
      });
      setBugSubmitted(true);
      setReporting(false);
    } catch (err) {
      console.error(err);
      alert("Failed to submit bug report.");
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("Please sign in to write a review.");
    if (!id) return;

    try {
      const newReview = {
        appId: id,
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || 'User',
        rating: ratingInput,
        comment: reviewText,
        createdAt: new Date().toISOString()
      };
      
      await addDoc(collection(db, 'reviews'), newReview);
      
      // Calculate new average rating
      const allRatings = [...reviews.map(r => r.rating), ratingInput];
      const avgRating = (allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(1);

      await updateDoc(doc(db, 'apps', id), { rating: parseFloat(avgRating) });
      
      setReviews([{ id: Math.random().toString(), ...newReview }, ...reviews]);
      setApp({ ...app, rating: parseFloat(avgRating) });
      setReviewing(false);
      setReviewText('');
    } catch (err) {
      console.error(err);
      alert("Failed to submit review.");
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading...</div>;
  if (!app) return <div className="p-10 text-center text-gray-500">App not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center">
          <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Store</span>
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8 mb-8">
          <div className="w-32 h-32 sm:w-40 sm:h-40 shrink-0 bg-gray-100 rounded-3xl overflow-hidden shadow-inner">
            <img src={app.icon || 'https://via.placeholder.com/150'} alt={app.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 flex flex-col">
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">{app.name}</h1>
            <p className="text-lg text-gray-500 font-medium mb-4">{app.developerName || 'Developer'}</p>
            
            <div className="flex items-center gap-6 mb-6 text-sm">
              <div className="flex flex-col items-center">
                <span className="font-bold text-gray-900 flex items-center gap-1">{app.rating || '0.0'} <Star className="w-4 h-4 fill-gray-900" /></span>
                <span className="text-gray-500">Rating</span>
              </div>
              <div className="w-px h-8 bg-gray-200"></div>
              <div className="flex flex-col items-center">
                <span className="font-bold text-gray-900">{app.downloads || '0'}</span>
                <span className="text-gray-500">Downloads</span>
              </div>
              <div className="w-px h-8 bg-gray-200"></div>
              <div className="flex flex-col items-center">
                <span className="font-bold text-gray-900">{app.category}</span>
                <span className="text-gray-500">Category</span>
              </div>
            </div>

            <div className="mt-auto flex flex-wrap gap-4">
              <a href={app.downloadUrl || '#'} download target="_blank" rel="noreferrer" className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-colors">
                <Download className="w-5 h-5" /> Install
              </a>
              <button onClick={() => setReporting(true)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-colors">
                <AlertTriangle className="w-5 h-5" /> Report Bug
              </button>
            </div>
          </div>
        </div>

        {app.screenshots && app.screenshots.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Screenshots</h2>
            <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar">
              {app.screenshots.map((s: string, i: number) => (
                <img key={i} src={s} alt="Screenshot" className="h-64 sm:h-80 rounded-xl object-cover bg-gray-100 shadow-sm shrink-0 border border-gray-200" />
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">About this app</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{app.description}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Ratings & Reviews</h2>
            <button onClick={() => setReviewing(true)} className="text-red-600 font-bold hover:bg-red-50 px-4 py-2 rounded-lg transition-colors">
              Write a Review
            </button>
          </div>
          
          {reviews.length === 0 ? (
            <p className="text-gray-500 italic">No reviews yet. Be the first to review this app!</p>
          ) : (
            <div className="space-y-6">
              {reviews.map(review => (
                <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-bold text-gray-900">{review.userName || 'KunStore User'}</div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Review Modal */}
      {reviewing && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Write a Review</h3>
            <form onSubmit={handleSubmitReview}>
              <div className="mb-4 flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button type="button" key={star} onClick={() => setRatingInput(star)}>
                    <Star className={`w-8 h-8 ${star <= ratingInput ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200 hover:text-yellow-200'}`} />
                  </button>
                ))}
              </div>
              <textarea 
                required rows={4} value={reviewText} onChange={e => setReviewText(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 outline-none focus:border-red-500 mb-4"
                placeholder="What do you think about this app?"
              />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setReviewing(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bug Report Modal */}
      {reporting && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Report a Bug</h3>
            <p className="text-gray-500 text-sm mb-4">Describe the issue you are facing. This will be sent directly to the developer.</p>
            <form onSubmit={handleReportBug}>
              <textarea 
                required rows={4} value={bugText} onChange={e => setBugText(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 outline-none focus:border-red-500 mb-4"
                placeholder="Steps to reproduce, expected behavior, actual behavior..."
              />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setReporting(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700">Submit Report</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {bugSubmitted && (
        <div className="fixed bottom-4 right-4 bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-4">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <div className="font-medium">Bug report submitted successfully!</div>
          <button onClick={() => setBugSubmitted(false)} className="ml-4 text-green-600 hover:text-green-800 font-bold">&times;</button>
        </div>
      )}
    </div>
  );
}
