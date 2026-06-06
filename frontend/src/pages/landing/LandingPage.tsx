import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, FileText, CheckSquare, BarChart3, ArrowRight, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { HeroGeometric } from '@/components/ui/HeroGeometric';

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

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.5 + i * 0.2,
        ease: [0.25, 0.4, 0.25, 1],
      },
    }),
  };

  return (
    <div className="min-h-screen bg-[#030303] text-slate-100 flex flex-col justify-between font-sans selection:bg-purple-500 selection:text-white">
      {/* Navbar */}
      <header className="border-b border-white/[0.08] bg-[#030303]/80 backdrop-blur sticky top-0 z-50">
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
              className="text-sm font-medium text-white/80 hover:text-white transition-colors"
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

      {/* Hero with Geometric Background Animation */}
      <HeroGeometric>
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center relative w-full">
          <div className="max-w-4xl mx-auto space-y-8 relative z-10">


            <motion.h1
              custom={0}
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-none"
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">
                Enterprise Procurement,
              </span>
              <br/>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-purple-500 to-blue-400">
                Streamlined.
              </span>
            </motion.h1>

            <motion.p
              custom={1}
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              className="max-w-2xl mx-auto text-white/60 text-lg md:text-xl font-light leading-relaxed tracking-wide"
            >
              A comprehensive, modular ERP platform handling registration, RFQs, bids, multi-level approvals, purchase orders, and secure invoices in a single clean ecosystem.
            </motion.p>

            <motion.div
              custom={2}
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <button 
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto px-8 py-3 rounded-lg bg-gradient-to-tr from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 text-white font-medium shadow-xl shadow-purple-600/20 transition-all flex items-center justify-center gap-2 group"
              >
                Access ERP Dashboard
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => navigate('/auth/register')}
                className="w-full sm:w-auto px-8 py-3 rounded-lg border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] text-slate-300 hover:text-white transition-colors"
              >
                Supplier Portal
              </button>
            </motion.div>
          </div>

          {/* Features Grid */}
          <section className="max-w-7xl mx-auto mt-32 w-full relative z-10 border-t border-white/[0.08] pt-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feat, index) => (
                <motion.div 
                  key={index}
                  custom={3 + index}
                  variants={fadeUpVariants}
                  initial="hidden"
                  animate="visible"
                  className="p-6 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.1] transition-all text-left space-y-4"
                >
                  <div className="p-3 bg-white/[0.03] border border-white/[0.08] rounded-lg w-fit">
                    {feat.icon}
                  </div>
                  <h3 className="font-semibold text-lg text-white">{feat.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{feat.description}</p>
                </motion.div>
              ))}
            </div>
          </section>
        </main>
      </HeroGeometric>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] py-8 bg-[#030303]">
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
