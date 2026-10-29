import React, { useState } from 'react';
import { X, User, Building2, Shield, Lock, Mail, Phone, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, defaultRole = 'user' }) {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [role, setRole] = useState(defaultRole); // 'user' | 'host' | 'admin'

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    upiId: '',
    upiName: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (tab === 'login') {
        const res = await api.login(formData.email, formData.password, role);
        api.setToken(res.token);
        onAuthSuccess(res.user);
        onClose();
      } else {
        const res = await api.register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          role,
          upiId: formData.upiId,
          upiName: formData.upiName
        });
        api.setToken(res.token);
        setSuccessMsg('Account registered successfully!');
        setTimeout(() => {
          onAuthSuccess(res.user);
          onClose();
        }, 800);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoEmail, demoPass, demoRole) => {
    setRole(demoRole);
    setFormData(prev => ({
      ...prev,
      email: demoEmail,
      password: demoPass
    }));
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md glass-panel rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              {tab === 'login' ? 'Welcome Back' : 'Create an Account'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Access cinema ticketing, host tools, and admin management
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Demo Logins Banner */}
        <div className="px-6 py-3 bg-white/5 border-b border-white/5">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span>⚡ 1-Click Quick Demo Login</span>
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickDemo('user@demo.com', 'user123', 'user')}
              className="py-1.5 px-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-[11px] font-semibold flex items-center justify-center gap-1 transition-all"
            >
              <User className="w-3 h-3" />
              <span>User</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('host@pvr.com', 'host123', 'host')}
              className="py-1.5 px-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold flex items-center justify-center gap-1 transition-all"
            >
              <Building2 className="w-3 h-3" />
              <span>Host</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin@eticket.com', 'admin123', 'admin')}
              className="py-1.5 px-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-[11px] font-semibold flex items-center justify-center gap-1 transition-all"
            >
              <Shield className="w-3 h-3" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Tab Switcher */}
          <div className="flex bg-white/5 p-1 rounded-xl mb-4 border border-white/5">
            <button
              type="button"
              onClick={() => { setTab('login'); setError(''); }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                tab === 'login' ? 'bg-white/15 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setTab('register'); setError(''); }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                tab === 'register' ? 'bg-white/15 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          {/* Role Selector */}
          <div className="mb-4">
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Select Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole('user')}
                className={`py-2 px-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all ${
                  role === 'user'
                    ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 shadow-sm'
                    : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Customer</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('host')}
                className={`py-2 px-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all ${
                  role === 'host'
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-sm'
                    : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Theater Host</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`py-2 px-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all ${
                  role === 'admin'
                    ? 'border-amber-500 bg-amber-500/20 text-amber-300 shadow-sm'
                    : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          {/* Error / Success Alerts */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-300 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-300 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {tab === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {role === 'host' ? 'Company / Organizer Name' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={role === 'host' ? 'PVR Cinemas Ltd' : 'John Doe'}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                </div>

                {role === 'host' && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                    <p className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
                      UPI QR Payment Configuration
                    </p>
                    <p className="text-[11px] text-slate-300">
                      Users will pay directly to this UPI ID for your shows:
                    </p>
                    <div>
                      <input
                        type="text"
                        required
                        value={formData.upiId}
                        onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                        placeholder="cinema.host@icici"
                        className="w-full bg-black/40 border border-emerald-500/30 rounded-lg px-3 py-1.5 text-xs text-emerald-200 placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-mono"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={role === 'admin' ? 'admin@eticket.com' : role === 'host' ? 'host@pvr.com' : 'user@demo.com'}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <span>Processing...</span>
              ) : (
                <>
                  <span>{tab === 'login' ? `Sign In as ${role.toUpperCase()}` : 'Complete Registration'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
