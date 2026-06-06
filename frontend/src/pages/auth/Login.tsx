import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProcurementStore } from '../../store/procurementStore';
import type { Role } from '../../store/procurementStore';
import { ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const login = useProcurementStore((state) => state.login);
  const [username, setUsername] = useState('officer@vendorbridge.com');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState<Role>('PROCUREMENT');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(username, role);
    navigate('/dashboard');
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-8 shadow-2xl">
      <div className="flex flex-col items-center mb-8">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center font-bold text-lg text-white mb-3">
          VB
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Welcome back</h2>
        <p className="text-xs text-slate-500 mt-1">Sign in to your VendorBridge Account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Username / Email
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none transition-colors"
              placeholder="e.g. officer@vendorbridge.com"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Password
            </label>
            <a href="#" className="text-[10px] text-purple-400 hover:text-purple-300 font-medium transition-colors">
              Forgot password?
            </a>
          </div>
          <div className="relative">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>
        </div>

        {/* Demo Assistant Role Selector */}
        <div className="bg-slate-950/60 border border-slate-800/40 p-3 rounded-lg space-y-2">
          <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Sign in as role:</p>
          <div className="grid grid-cols-2 gap-2">
            {(['PROCUREMENT', 'FINANCE', 'VENDOR', 'ADMIN'] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setRole(r);
                  setUsername(
                    r === 'PROCUREMENT' 
                      ? 'officer@vendorbridge.com' 
                      : r === 'FINANCE' 
                      ? 'finance@vendorbridge.com'
                      : r === 'ADMIN'
                      ? 'admin@vendorbridge.com'
                      : 'vendor@infra-supplies.com'
                  );
                }}
                className={`py-1.5 px-2.5 rounded text-[10px] font-bold transition-all border ${
                  role === r
                    ? 'bg-purple-600/10 border-purple-500 text-purple-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 rounded-lg bg-gradient-to-tr from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 text-sm font-semibold text-white shadow-lg transition-all flex items-center justify-center gap-2 group"
        >
          Sign In
          <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-xs text-slate-500">
          Don't have an account?{' '}
          <button
            onClick={() => navigate('/auth/register')}
            className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
          >
            Register here
          </button>
        </p>
      </div>
    </div>
  );
};
export default Login;
