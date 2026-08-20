import React, { useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, CreditCard, ArrowLeft, Shield } from 'lucide-react';
import DeveloperPlans from './DeveloperPlans';
import DeveloperDashboard from './DeveloperDashboard';
import SubmitApp from './SubmitApp';
import AdminDashboard from './AdminDashboard';

export default function DeveloperPortal({ user, userData }: { user: any, userData: any }) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is not developer or admin, and they are not on the plans page, redirect to plans
    if (user && userData && userData.role !== 'developer' && userData.role !== 'admin' && !location.pathname.includes('/plans')) {
      navigate('/developer/plans');
    }
  }, [user, userData, location.pathname, navigate]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Developer Portal</h1>
        <p className="text-gray-600 mb-6">Please sign in from the main store to access the developer portal.</p>
        <Link to="/" className="text-red-600 hover:underline">Back to Store</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 p-6 flex flex-col gap-6">
        <Link to="/" className="flex items-center gap-2 mb-4">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
          <span className="font-bold text-gray-800">Back to Store</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-xl">D</span>
          </div>
          <span className="font-bold text-xl text-gray-900">Developer</span>
        </div>
        
        <nav className="flex flex-col gap-2 mt-4">
          {(userData?.role === 'developer' || userData?.role === 'admin') && (
            <>
              <Link to="/developer" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === '/developer' ? 'bg-red-50 text-red-600 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
                <LayoutDashboard className="w-5 h-5" /> Dashboard
              </Link>
              <Link to="/developer/apps/new" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === '/developer/apps/new' ? 'bg-red-50 text-red-600 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
                <PlusCircle className="w-5 h-5" /> Publish App
              </Link>
            </>
          )}
          {userData?.role === 'admin' && (
            <Link to="/developer/admin" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === '/developer/admin' ? 'bg-red-50 text-red-600 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
              <Shield className="w-5 h-5" /> Admin Panel
            </Link>
          )}
          <Link to="/developer/plans" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === '/developer/plans' ? 'bg-red-50 text-red-600 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
            <CreditCard className="w-5 h-5" /> Plans & Billing
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <Routes>
          <Route path="/" element={<DeveloperDashboard user={user} userData={userData} />} />
          <Route path="/apps/new" element={<SubmitApp user={user} userData={userData} />} />
          <Route path="/plans" element={<DeveloperPlans user={user} userData={userData} />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>
    </div>
  );
}
