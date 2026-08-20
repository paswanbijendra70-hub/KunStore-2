const fs = require('fs');
let code = fs.readFileSync('src/StoreFront.tsx', 'utf8');

code = code.replace(
  "const [mobileSearchOpen, setMobileSearchOpen] = useState(false);",
  "const [mobileSearchOpen, setMobileSearchOpen] = useState(false);\n  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);"
);

code = code.replace(
  "<button className=\"text-white lg:hidden p-1\">",
  "<button onClick={() => setMobileMenuOpen(true)} className=\"text-white lg:hidden p-1\">"
);

const drawerCode = `
      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="relative w-64 bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-left">
            <div className="p-4 border-b bg-red-600 flex justify-between items-center text-white">
              <span className="font-bold text-xl">KunStore</span>
              <button onClick={() => setMobileMenuOpen(false)} className="text-white p-1 font-bold text-xl">&times;</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              <div className="font-bold text-gray-900 mb-2">Platforms</div>
              {['All', 'Android', 'iOS', 'Windows', 'Mac'].map(platform => (
                <button 
                  key={platform}
                  onClick={() => { setActivePlatform(platform); setMobileMenuOpen(false); }}
                  className={\`text-left py-2 \${activePlatform === platform ? 'text-red-600 font-bold' : 'text-gray-700'}\`}
                >
                  {platform} {platform === 'All' ? 'Platforms' : ''}
                </button>
              ))}
              
              <div className="border-t my-2"></div>
              <div className="font-bold text-gray-900 mb-2">Categories</div>
              {['All', 'Games', 'Productivity', 'Social', 'Entertainment', 'Tools'].map(category => (
                <button 
                  key={category}
                  onClick={() => { setActiveCategory(category); setMobileMenuOpen(false); }}
                  className={\`text-left py-2 \${activeCategory === category ? 'text-red-600 font-bold' : 'text-gray-700'}\`}
                >
                  {category}
                </button>
              ))}

              <div className="border-t my-2"></div>
              {user ? (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <User className="w-8 h-8 p-1 bg-gray-100 rounded-full text-gray-600" />
                    <span className="text-sm font-medium text-gray-900 truncate">{user.email}</span>
                  </div>
                  {userData?.role === 'developer' || userData?.role === 'admin' ? (
                    <Link to="/developer" onClick={() => setMobileMenuOpen(false)} className="text-left py-2 text-gray-700 font-medium">Developer Portal</Link>
                  ) : (
                    <Link to="/developer/plans" onClick={() => setMobileMenuOpen(false)} className="text-left py-2 text-gray-700 font-medium">Publish App</Link>
                  )}
                  <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="text-left py-2 text-red-600 font-medium">Sign out</button>
                </>
              ) : (
                <button onClick={() => { handleLogin(); setMobileMenuOpen(false); }} className="bg-red-600 text-white py-3 rounded-lg font-bold w-full text-center mt-2">Sign in</button>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="min-h-screen bg-gray-50">`;

code = code.replace(
  /<main className="min-h-screen bg-gray-50">/g,
  drawerCode
);

fs.writeFileSync('src/StoreFront.tsx', code);
console.log("Patched drawer");
