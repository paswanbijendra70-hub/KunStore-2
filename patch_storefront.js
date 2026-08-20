const fs = require('fs');
let code = fs.readFileSync('src/StoreFront.tsx', 'utf8');

// 1. Add isAppInstalled state
code = code.replace(
  "const [activePlatform, setActivePlatform] = useState<string>('All');",
  `const [activePlatform, setActivePlatform] = useState<string>('All');
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);`
);

// 2. Add appinstalled listener
code = code.replace(
  "window.addEventListener('beforeinstallprompt', (e) => {",
  `if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true) {
      setIsAppInstalled(true);
    }
    
    window.addEventListener('appinstalled', () => {
      setIsAppInstalled(true);
    });

    window.addEventListener('beforeinstallprompt', (e) => {`
);

// 3. Conditional render for install banner
code = code.replace(
  /<div className="my-12 p-8 bg-red-50/g,
  `{!isAppInstalled && (
          <div className="my-12 p-8 bg-red-50`
);

code = code.replace(
  /<\/button>\n\s*<\/div>\n\s*<\/main>/g,
  `</button>\n        </div>\n        )}\n      </main>`
);

// 4. Update Header for Mobile search and Publish Apps link visibility
code = code.replace(
  /<header className="bg-red-600 sticky top-0 z-50 shadow-md">[\s\S]*?{user \? \(/,
  `<header className="bg-red-600 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {!mobileSearchOpen ? (
            <>
              <div className="flex items-center gap-2 sm:gap-4">
                <button className="text-white lg:hidden p-1">
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
                {user ? (`
);

code = code.replace(
  /{userData\?\.role === 'developer' \? \([\s\S]*?\) : \([\s\S]*?\)}/g,
  `{userData?.role === 'developer' ? (
                  <Link to="/developer" className="flex items-center gap-1 sm:gap-2 text-white hover:bg-red-700 px-2 sm:px-3 py-2 rounded-lg transition-colors">
                    <Code className="w-5 h-5" />
                    <span className="hidden sm:block font-medium">Dev Portal</span>
                  </Link>
                ) : (
                  <Link to="/developer/plans" className="flex items-center gap-1 sm:gap-2 text-white hover:bg-red-700 px-2 sm:px-3 py-2 rounded-lg transition-colors">
                    <Code className="w-5 h-5" />
                    <span className="hidden sm:block font-medium">Publish</span>
                  </Link>
                )}`
);

code = code.replace(
  /<span className="hidden lg:block font-medium">Sign out<\/span>/,
  `<span className="hidden sm:block font-medium">Sign out</span>`
);
code = code.replace(
  /<span className="hidden lg:block font-medium">Sign in<\/span>/,
  `<span className="hidden sm:block font-medium">Sign in</span>`
);

// Insert mobile search bar alternative
code = code.replace(
  /<\/button>\n\s*<\/div>\n\s*\) : \(/,
  `</button>\n              </div>\n            ) : (`
);

// We need to inject the mobile search bar branch
code = code.replace(
  /<\/div>\n\s*<\/div>\n\s*\{\/\* Categories \/ Platforms Bar \*\/\}/,
  `            </div>
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
        
        {/* Categories / Platforms Bar */}`
);

fs.writeFileSync('src/StoreFront.tsx', code);
console.log('Patched src/StoreFront.tsx');
