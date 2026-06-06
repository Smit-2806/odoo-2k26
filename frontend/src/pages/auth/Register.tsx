import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProcurementStore } from '../../store/procurementStore';
import type { Role } from '../../store/procurementStore';
import { ArrowRight } from 'lucide-react';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const login = useProcurementStore((state) => state.login);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    role: 'VENDOR' as Role,
    country: 'India',
    additionalInfo: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In mock setup, we log the user in immediately
    login(formData.email, formData.role);
    navigate('/dashboard');
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-8 shadow-2xl max-w-lg mx-auto">
      <div className="flex flex-col items-center mb-6">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center font-bold text-lg text-white mb-3">
          VB
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Create Account</h2>
        <p className="text-xs text-slate-500 mt-1">Register to join the VendorBridge ERP Network</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              First Name
            </label>
            <input
              type="text"
              required
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-lg px-3 py-2 text-xs text-white focus:outline-none transition-colors"
              placeholder="e.g. John"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Last Name
            </label>
            <input
              type="text"
              required
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-lg px-3 py-2 text-xs text-white focus:outline-none transition-colors"
              placeholder="e.g. Doe"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Phone Number
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-lg px-3 py-2 text-xs text-white focus:outline-none transition-colors"
              placeholder="e.g. +91 98765 43210"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-lg px-3 py-2 text-xs text-white focus:outline-none transition-colors"
              placeholder="e.g. john@company.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
              className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none transition-colors cursor-pointer"
            >
              <option value="VENDOR">Vendor / Supplier</option>
              <option value="PROCUREMENT">Procurement Officer</option>
              <option value="FINANCE">Finance Manager</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Country
            </label>
            <input
              type="text"
              required
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-lg px-3 py-2 text-xs text-white focus:outline-none transition-colors"
              placeholder="e.g. India"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Additional Information
          </label>
          <textarea
            value={formData.additionalInfo}
            onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-lg px-3 py-2 text-xs text-white focus:outline-none transition-colors h-16 resize-none"
            placeholder="Introduce your company or fields of business..."
          />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 rounded-lg bg-gradient-to-tr from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 text-xs font-semibold text-white shadow-lg transition-all flex items-center justify-center gap-2 group mt-2"
        >
          Register Account
          <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-xs text-slate-500">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/auth/login')}
            className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
          >
            Sign in here
          </button>
        </p>
      </div>
    </div>
  );
};
export default Register;
