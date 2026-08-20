import React, { useState, useEffect } from 'react';
import { Search, Menu, User, Download, Star, ChevronRight, Monitor, Smartphone, Apple, LogOut, Code } from 'lucide-react';
import { auth, db } from './firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const AppIcon = ({ src, alt }: { src: string; alt: string }) => {
  const [error, setError] = useState(false);
  return (
    <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 bg-gray-200 rounded-2xl overflow-hidden shadow-sm flex items-center justify-center">
      {!error ? (
        <img src={src || 'https://via.placeholder.com/150'} alt={alt} className="w-full h-full object-cover" onError={() => setError(true)} />
      ) : (
        <span className="text-gray-400 font-bold text-2xl">{alt ? alt.charAt(0) : '?'}</span>
      )}
    </div>
  );
};

const AppCard: React.FC<{ app: any }> = ({ app }) => (
  <Link to={`/app/${app.id}`} className="flex flex-col gap-2 group cursor-pointer">
    <AppIcon src={app.icon} alt={app.name} />
    <div>
      <h3 className="font-bold text-gray-800 text-sm sm:text-base line-clamp-1 group-hover:text-red-600 transition-colors">{app.name}</h3>
      <p className="text-xs text-gray-500 line-clamp-1">{app.developerName || app.developerId}</p>
      <div className="flex items-center gap-1 mt-1">
        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
        <span className="text-xs font-medium text-gray-700">{app.rating || 0}</span>
      </div>
    </div>
  </Link>
);

const Section = ({ title, apps }: { title: string; apps: any[] }) => (
  <section className="mb-10">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{title}</h2>
      <button className="text-red-600 font-medium text-sm hover:underline flex items-center">
        See more <ChevronRight className="w-4 h-4" />
      </button>
    </div>
    {apps.length > 0 ? (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 sm:gap-6">
        {apps.map(app => <AppCard key={app.id} app={app} />)}
      </div>
    ) : (
      <p className="text-gray-500 text-sm">No apps found.</p>
    )}
  </section>
);

export default function StoreFront({ user, userData }: { user: any, userData: any }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [apps, setApps] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activePlatform, setActivePlatform] = useState<string>('All');
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true) {
      setIsAppInstalled(true);
    }
    
    window.addEventListener('appinstalled', () => {
      setIsAppInstalled(true);
    });

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    const fetchApps = async () => {
      const q = query(collection(db, 'apps'), where('status', '==', 'published'));
      const snapshot = await getDocs(q);
      const fetchedApps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setApps(fetchedApps);
    };
    fetchApps();
  }, []);

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          app.developerName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesCategory = true;
    if (activeCategory === 'Games') matchesCategory = app.category === 'Games';
    else if (activeCategory === 'Apps') matchesCategory = app.category !== 'Games' && app.category !== 'Articles';
    else if (activeCategory === 'Articles') matchesCategory = app.category === 'Articles';

    let matchesPlatform = true;
    if (activePlatform !== 'All') {
      matchesPlatform = app.platforms && app.platforms.includes(activePlatform);
    }

    return matchesSearch && matchesCategory && matchesPlatform;
  });

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }
      setDeferredPrompt(null);
    } else {
      alert('To install the app, use your browser menu and select "Install app" or "Add to Home Screen".');
    }
  };

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Navbar */}
      <header className="bg-red-600 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {!mobileSearchOpen ? (
            <>
              <div className="flex items-center gap-2 sm:gap-4">
                <button onClick={() => setMobileMenuOpen(true)} className="text-white lg:hidden p-1">
                  <Menu className="w-6 h-6" />
                </button>
                <a href="/" className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                    <span className="text-red-600 font-black text-xl">K</span>
                  </div>
                  <span className="text-white font-bold text-xl hidden sm:block tracking-tight">KunStore</span>
                </a>
              </div>

              <div className="flex-1 max-w-2xl hidden md:block">
                <div className="relative">
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for apps, games, articles..." 
                    className="w-full bg-red-700 text-white placeholder-red-300 border border-red-500 rounded-full py-2 pl-4 pr-10 focus:outline-none focus:bg-white focus:text-gray-900 focus:placeholder-gray-400 transition-colors"
                  />
                  <Search className="w-5 h-5 absolute right-3 top-2.5 text-red-300 pointer-events-none" />
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-4">
                <button onClick={() => setMobileSearchOpen(true)} className="text-white md:hidden p-1">
                  <Search className="w-6 h-6" />
                </button>
                {user ? (
              <div className="flex items-center gap-4">
                {userData?.role === 'developer' ? (
                  <Link to="/developer" className="flex items-center gap-1 sm:gap-2 text-white hover:bg-red-700 px-2 sm:px-3 py-2 rounded-lg transition-colors">
                    <Code className="w-5 h-5" />
                    <span className="hidden sm:block font-medium">Dev Portal</span>
                  </Link>
                ) : (
                  <Link to="/developer/plans" className="flex items-center gap-1 sm:gap-2 text-white hover:bg-red-700 px-2 sm:px-3 py-2 rounded-lg transition-colors">
                    <Code className="w-5 h-5" />
                    <span className="hidden sm:block font-medium">Publish</span>
                  </Link>
                )}
                <button onClick={handleLogout} className="flex items-center gap-2 text-white hover:bg-red-700 px-3 py-2 rounded-lg transition-colors">
                  <LogOut className="w-5 h-5" />
                  <span className="hidden sm:block font-medium">Sign out</span>
                </button>
              </div>
            ) : (
              <button onClick={handleLogin} className="flex items-center gap-2 text-white hover:bg-red-700 px-3 py-2 rounded-lg transition-colors">
                <User className="w-5 h-5" />
                <span className="hidden sm:block font-medium">Sign in</span>
              </button>
            )}
                      </div>
            </>
          ) : (
            <div className="flex-1 flex items-center gap-2 w-full">
              <div className="relative flex-1">
                <input 
                  type="text" 
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search apps..." 
                  className="w-full bg-red-700 text-white placeholder-red-300 border border-red-500 rounded-full py-2 pl-4 pr-10 focus:outline-none focus:bg-white focus:text-gray-900 focus:placeholder-gray-400 transition-colors"
                />
                <Search className="w-5 h-5 absolute right-3 top-2.5 text-red-300 pointer-events-none" />
              </div>
              <button onClick={() => setMobileSearchOpen(false)} className="text-white font-medium px-2">Cancel</button>
            </div>
          )}
        </div>
        
        {/* Categories / Platforms Bar */}
        <div className="bg-red-700 border-t border-red-800/50">
          <div className="max-w-7xl mx-auto px-4 flex overflow-x-auto hide-scrollbar">
            <nav className="flex whitespace-nowrap gap-6 sm:gap-8 py-3 text-sm font-medium">
              <button onClick={() => setActivePlatform('All')} className={`flex items-center gap-2 ${activePlatform === 'All' ? 'text-white border-b-2 border-white pb-1 -mb-[13px]' : 'text-red-200 hover:text-white transition-colors pb-1'}`}>
                All Platforms
              </button>
              <button onClick={() => setActivePlatform('Android')} className={`flex items-center gap-2 ${activePlatform === 'Android' ? 'text-white border-b-2 border-white pb-1 -mb-[13px]' : 'text-red-200 hover:text-white transition-colors pb-1'}`}>
                <Smartphone className="w-4 h-4" /> Android
              </button>
              <button onClick={() => setActivePlatform('iOS')} className={`flex items-center gap-2 ${activePlatform === 'iOS' ? 'text-white border-b-2 border-white pb-1 -mb-[13px]' : 'text-red-200 hover:text-white transition-colors pb-1'}`}>
                <Smartphone className="w-4 h-4" /> iOS
              </button>
              <button onClick={() => setActivePlatform('Windows')} className={`flex items-center gap-2 ${activePlatform === 'Windows' ? 'text-white border-b-2 border-white pb-1 -mb-[13px]' : 'text-red-200 hover:text-white transition-colors pb-1'}`}>
                <Monitor className="w-4 h-4" /> Windows
              </button>
              <button onClick={() => setActivePlatform('Mac')} className={`flex items-center gap-2 ${activePlatform === 'Mac' ? 'text-white border-b-2 border-white pb-1 -mb-[13px]' : 'text-red-200 hover:text-white transition-colors pb-1'}`}>
                <Apple className="w-4 h-4" /> Mac
              </button>
              <div className="w-px h-5 bg-red-600 mx-2 self-center"></div>
              <button onClick={() => setActiveCategory('All')} className={`${activeCategory === 'All' ? 'text-white border-b-2 border-white pb-1 -mb-[13px]' : 'text-red-200 hover:text-white transition-colors pb-1'}`}>All</button>
              <button onClick={() => setActiveCategory('Games')} className={`${activeCategory === 'Games' ? 'text-white border-b-2 border-white pb-1 -mb-[13px]' : 'text-red-200 hover:text-white transition-colors pb-1'}`}>Games</button>
              <button onClick={() => setActiveCategory('Apps')} className={`${activeCategory === 'Apps' ? 'text-white border-b-2 border-white pb-1 -mb-[13px]' : 'text-red-200 hover:text-white transition-colors pb-1'}`}>Apps</button>
              <button onClick={() => setActiveCategory('Articles')} className={`${activeCategory === 'Articles' ? 'text-white border-b-2 border-white pb-1 -mb-[13px]' : 'text-red-200 hover:text-white transition-colors pb-1'}`}>Articles</button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {filteredApps.length > 0 ? (
          <Section title={searchQuery ? "Search Results" : (activeCategory === 'All' ? "Apps & Games" : activeCategory)} apps={filteredApps} />
        ) : (
          <div className="py-20 text-center text-gray-500">
            No results found matching your criteria.
          </div>
        )}
        
        {!isAppInstalled && (
          <div className="my-12 p-8 bg-red-50 rounded-2xl border border-red-100 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">KunStore App</h2>
            <p className="text-gray-600 max-w-lg">Get the official KunStore app for your device. Faster downloads, auto-updates, and a smoother experience.</p>
          </div>
          <button onClick={handleInstallClick} className="whitespace-nowrap bg-gray-900 hover:bg-black text-white font-bold py-3 px-8 rounded-xl transition-colors">
            Install App
          </button>
        </div>
        )}
      </main>

      <footer className="bg-gray-900 text-gray-400 py-12 mt-20 border-t-4 border-red-600">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-xl">K</span>
              </div>
              <span className="text-white font-bold text-xl tracking-tight">KunStore</span>
            </div>
            <p className="text-sm">Download your favorite apps and games securely and fast. The red-themed alternative app store.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">About</h4>
            <ul className="space-y-2 text-sm flex flex-col">
              <a href="#" className="hover:text-red-400 transition-colors">About us</a>
              <a href="#" className="hover:text-red-400 transition-colors">Contact</a>
              <a href="#" className="hover:text-red-400 transition-colors">Terms of service</a>
              <a href="#" className="hover:text-red-400 transition-colors">Privacy policy</a>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Categories</h4>
            <ul className="space-y-2 text-sm flex flex-col">
              <a href="#" className="hover:text-red-400 transition-colors">Games</a>
              <a href="#" className="hover:text-red-400 transition-colors">Apps</a>
              <a href="#" className="hover:text-red-400 transition-colors">Articles</a>
              <a href="#" className="hover:text-red-400 transition-colors">Collections</a>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Platforms</h4>
            <ul className="space-y-2 text-sm flex flex-col">
              <a href="#" className="hover:text-red-400 transition-colors">Android</a>
              <a href="#" className="hover:text-red-400 transition-colors">Windows</a>
              <a href="#" className="hover:text-red-400 transition-colors">Mac</a>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-gray-800 text-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <p>&copy; {new Date().getFullYear()} KunStore. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="text-gray-500 hover:text-white cursor-pointer transition-colors">English</span>
            <span className="text-gray-500 hover:text-white cursor-pointer transition-colors">Español</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
