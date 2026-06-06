import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, FileText, CheckSquare, BarChart3, ArrowRight, Activity, Users } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Users className="h-6 w-6 text-purple-400" />,
      title: "Vendor Onboarding",
      description: "Self-service registration, document validation, and verified onboarding flows."
    },
    {
      icon: <FileText className="h-6 w-6 text-blue-400" />,
      title: "RFQ Lifecycle",
      description: "Easily create, distribute, and compare bids from registered suppliers."
    },
    {
      icon: <CheckSquare className="h-6 w-6 text-emerald-400" />,
      title: "Approval Chains",
      description: "Custom multi-level approval stages for quotations and purchase orders."
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-orange-400" />,
      title: "Analytics & KPIs",
      description: "Track procurement cycles, supplier reliability, and historical pricing trends."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans selection:bg-purple-500 selection:text-white">
      {/* Navbar */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center font-bold text-white shadow-lg shadow-purple-500/20">
              VB
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              VendorBridge
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/auth/login')}
              className="text-sm font-medium hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate('/auth/register')}
              className="px-4 py-2 rounded-lg bg-white text-slate-950 text-sm font-medium hover:bg-slate-200 transition-colors shadow-lg shadow-white/5"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/5 text-purple-300 text-xs font-semibold tracking-wide uppercase">
            <Activity className="h-3.5 w-3.5 animate-pulse" />
            Active Platform Development
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-none bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Enterprise Procurement,<br/>
            <span className="bg-gradient-to-r from-purple-400 via-purple-500 to-blue-400 bg-clip-text text-transparent">Streamlined.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-slate-400 text-lg md:text-xl font-normal leading-relaxed">
            A comprehensive, modular ERP platform handling registration, RFQs, bids, multi-level approvals, purchase orders, and secure invoices in a single clean ecosystem.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto px-8 py-3 rounded-lg bg-gradient-to-tr from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 text-white font-medium shadow-xl shadow-purple-600/20 transition-all flex items-center justify-center gap-2 group"
            >
              Access ERP Dashboard
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => navigate('/auth/register')}
              className="w-full sm:w-auto px-8 py-3 rounded-lg border border-slate-800 bg-slate-900/50 hover:bg-slate-900 text-slate-300 hover:text-white transition-colors"
            >
              Supplier Portal
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <section className="max-w-7xl mx-auto mt-32 w-full relative z-10 border-t border-slate-900 pt-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feat, index) => (
              <div 
                key={index} 
                className="p-6 rounded-xl border border-slate-900 bg-slate-950/40 hover:bg-slate-950/60 hover:border-slate-800 transition-all text-left space-y-4"
              >
                <div className="p-3 bg-slate-900 rounded-lg w-fit">
                  {feat.icon}
                </div>
                <h3 className="font-semibold text-lg text-white">{feat.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feat.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Shield className="h-4 w-4 text-purple-500" />
            <span>Secure & Auditable ERP Platform</span>
          </div>
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} VendorBridge Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
export default LandingPage;
