import React, { useState } from 'react';
import { db } from './firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Check, Loader2, X, QrCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const plans = [
  { id: 'free', name: 'Free', priceNPR: 0, time: '', desc: 'Basic publishing for hobbyists.', features: ['Publish up to 2 apps', 'Standard review time', 'Community support'] },
  { id: 'payg', name: 'Pay as you go', priceNPR: null, time: '', desc: 'Pay only when you get downloads.', features: ['Unlimited apps', 'NPR 1 per download', 'Faster review', 'Email support'] },
  { id: 'plan_100', name: 'Pro', priceNPR: 100, time: '/year', desc: 'For growing independent developers.', features: ['Publish up to 100 apps', '0% fee on downloads', 'Priority review', 'Analytics dashboard'] },
  { id: 'plan_250', name: 'Enterprise', priceNPR: 250, time: '/lifetime', desc: 'One time cost for professional studios.', features: ['Unlimited apps', 'Lifetime access', 'Dedicated account manager', 'Featured placements'] }
];

export default function DeveloperPlans({ user, userData }: { user: any, userData: any }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [currency, setCurrency] = useState('NPR');
  const rates: Record<string, number> = { NPR: 1, USD: 0.0075, EUR: 0.0069, INR: 0.62 };
  
  // Registration Flow State
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [step, setStep] = useState<'form' | 'payment' | null>(null);
  const [formData, setFormData] = useState({ name: '', company: '' });

  const formatPrice = (nprAmount: number | null) => {
    if (nprAmount === null) return 'Flexible';
    if (nprAmount === 0) return 'Free';
    const converted = nprAmount * rates[currency];
    return new Intl.NumberFormat(currency === 'NPR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency: currency
    }).format(converted);
  };

  const handleSelectPlan = (planId: string) => {
    if (!user) return;
    setSelectedPlan(planId);
    setStep('form');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const plan = plans.find(p => p.id === selectedPlan);
    if (plan?.priceNPR !== 0 && plan?.priceNPR !== null) {
      setStep('payment');
    } else {
      finalizeRegistration();
    }
  };

  const finalizeRegistration = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        role: 'developer',
        developerPlan: selectedPlan,
        developerName: formData.name,
        companyName: formData.company
      });
      navigate('/developer');
    } catch (e) {
      console.error(e);
      alert('Failed to complete registration');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Developer Plans</h1>
          <p className="text-gray-600">Choose a plan to publish your apps on KunStore.</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm w-max">
          <span className="text-sm text-gray-500 font-medium">Currency:</span>
          <select 
            value={currency} 
            onChange={(e) => setCurrency(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-md focus:ring-red-500 focus:border-red-500 block p-1.5 font-bold"
          >
            <option value="NPR">🇳🇵 NPR</option>
            <option value="USD">🇺🇸 USD</option>
            <option value="EUR">🇪🇺 EUR</option>
            <option value="INR">🇮🇳 INR</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map(plan => (
          <div key={plan.id} className={`bg-white rounded-2xl border ${userData?.developerPlan === plan.id || userData?.role === 'admin' ? 'border-red-600 ring-2 ring-red-100' : 'border-gray-200'} p-6 flex flex-col shadow-sm relative`}>
            {(userData?.developerPlan === plan.id || (userData?.role === 'admin' && plan.id === 'plan_250')) && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">Current Plan</span>
            )}
            <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
            <p className="text-gray-500 text-sm mb-6 h-10">{plan.desc}</p>
            <div className="mb-6">
              <span className="text-3xl font-black text-gray-900">{formatPrice(plan.priceNPR)}</span>
              {plan.time && <span className="text-gray-500 font-medium">{plan.time}</span>}
            </div>
            
            <ul className="flex-1 space-y-3 mb-8">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <Check className="w-5 h-5 text-green-500 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button 
              onClick={() => handleSelectPlan(plan.id)}
              disabled={loading || userData?.developerPlan === plan.id || userData?.role === 'admin'}
              className={`w-full py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2
                ${userData?.developerPlan === plan.id || userData?.role === 'admin'
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20'}`}
            >
              {userData?.developerPlan === plan.id || (userData?.role === 'admin' && plan.id === 'plan_250') ? 'Active' : 'Select Plan'}
            </button>
          </div>
        ))}
      </div>

      {/* Registration Modal */}
      {step && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {step === 'form' ? 'Developer Profile' : 'Complete Payment'}
              </h2>
              <button onClick={() => { setStep(null); setSelectedPlan(null); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              {step === 'form' && (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Developer / Publisher Name *</label>
                    <input 
                      type="text" required
                      value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Company Name (Optional)</label>
                    <input 
                      type="text"
                      value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      placeholder="e.g. ASP Studios"
                    />
                  </div>
                  <button type="submit" className="w-full bg-red-600 text-white font-bold py-3 rounded-xl mt-4 hover:bg-red-700 transition-colors">
                    Continue
                  </button>
                </form>
              )}

              {step === 'payment' && (
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                    <QrCode className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Scan to Pay</h3>
                  <p className="text-gray-500 text-sm mb-6">
                    Please scan this QR code with your mobile banking app or digital wallet to complete the payment for {plans.find(p => p.id === selectedPlan)?.name}.
                  </p>
                  
                  {/* Fake QR Code Image using Google Charts API */}
                  <div className="p-4 border-2 border-dashed border-gray-200 rounded-2xl mb-6">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PaymentToKunStorePlan${selectedPlan}`} alt="Payment QR Code" className="w-48 h-48 mx-auto" />
                  </div>

                  <button 
                    onClick={finalizeRegistration}
                    disabled={loading}
                    className="w-full bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'I have completed the payment'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
