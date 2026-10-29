import React, { useState } from 'react';
import { Film, MapPin, Search, User, Shield, Building2, LogOut, Ticket, Sparkles, ChevronDown } from 'lucide-react';

export default function Navbar({
  currentUser,
  activeView,
  setActiveView,
  selectedCity,
  setSelectedCity,
  searchQuery,
  setSearchQuery,
  onOpenAuth,
  onLogout,
  onQuickSwitchUser
}) {
  const [cityMenuOpen, setCityMenuOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  const cities = ['All Cities', 'Mumbai', 'Delhi NCR', 'Bengaluru'];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveView('movies')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-fuchsia-500 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all duration-300">
            <div className="w-full h-full bg-[#0a0c14] rounded-[10px] flex items-center justify-center">
              <Film className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-xl text-white font-mono">NOVELLA</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                E-TICKET
              </span>
            </div>
            <p className="text-[11px] text-slate-400 tracking-wider uppercase font-medium">Next-Gen Cinema & Events</p>
          </div>
        </div>

        {/* Center Nav & Filters */}
        <div className="hidden md:flex items-center gap-2 lg:gap-6">
          <nav className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setActiveView('movies')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeView === 'movies'
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Movies
            </button>
            <button
              onClick={() => setActiveView('theaters')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeView === 'theaters'
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Theaters
            </button>
            {currentUser && currentUser.role === 'user' && (
              <button
                onClick={() => setActiveView('my-bookings')}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  activeView === 'my-bookings'
                    ? 'bg-white/15 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Ticket className="w-3.5 h-3.5 text-cyan-400" />
                My Tickets
              </button>
            )}
            {currentUser && currentUser.role === 'host' && (
              <button
                onClick={() => setActiveView('host-dashboard')}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  activeView === 'host-dashboard'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                Host Studio
              </button>
            )}
            {currentUser && currentUser.role === 'admin' && (
              <button
                onClick={() => setActiveView('admin-dashboard')}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  activeView === 'admin-dashboard'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                Admin Panel
              </button>
            )}
          </nav>

          {/* City Dropdown */}
          <div className="relative">
            <button
              onClick={() => setCityMenuOpen(!cityMenuOpen)}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-300 bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg border border-white/10 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>{selectedCity}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {cityMenuOpen && (
              <div className="absolute top-full mt-2 w-44 glass-panel rounded-xl shadow-2xl py-1 z-50 border border-white/10 animate-in fade-in slide-in-from-top-2">
                {cities.map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      setSelectedCity(city);
                      setCityMenuOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs transition-colors ${
                      selectedCity === city
                        ? 'text-cyan-400 bg-cyan-500/10 font-semibold'
                        : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search bar */}
          <div className="relative w-52 lg:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search movies, genre, cast..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
            />
          </div>
        </div>

        {/* Right Section: Role Switcher & Auth */}
        <div className="flex items-center gap-2.5">
          {/* Quick Demo Switcher Button */}
          <div className="relative">
            <button
              onClick={() => setDemoMenuOpen(!demoMenuOpen)}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-purple-500/15 to-indigo-500/15 text-purple-300 border border-purple-500/30 hover:border-purple-500/60 transition-all"
              title="1-Click switch between User, Host, and Admin demo roles"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Demo Roles</span>
              <ChevronDown className="w-3 h-3 text-purple-400" />
            </button>

            {demoMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 glass-panel rounded-xl shadow-2xl p-2 z-50 border border-purple-500/30">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-2 py-1">Quick Switch Role:</p>
                <button
                  onClick={() => {
                    onQuickSwitchUser('user');
                    setDemoMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-left hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-cyan-400" />
                    <div>
                      <p className="font-semibold text-slate-200">Customer User</p>
                      <p className="text-[10px] text-slate-400">user@demo.com</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded">USER</span>
                </button>

                <button
                  onClick={() => {
                    onQuickSwitchUser('host');
                    setDemoMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-left hover:bg-white/10 transition-colors mt-1"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    <div>
                      <p className="font-semibold text-slate-200">PVR Host</p>
                      <p className="text-[10px] text-slate-400">host@pvr.com</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">HOST</span>
                </button>

                <button
                  onClick={() => {
                    onQuickSwitchUser('admin');
                    setDemoMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-left hover:bg-white/10 transition-colors mt-1"
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-400" />
                    <div>
                      <p className="font-semibold text-slate-200">Administrator</p>
                      <p className="text-[10px] text-slate-400">admin@eticket.com</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">ADMIN</span>
                </button>
              </div>
            )}
          </div>

          {/* User state */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-semibold text-white leading-tight">{currentUser.name}</p>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                  currentUser.role === 'admin'
                    ? 'bg-amber-500/20 text-amber-400'
                    : currentUser.role === 'host'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-cyan-500/20 text-cyan-400'
                }`}>
                  {currentUser.role}
                </span>
              </div>

              <button
                onClick={onLogout}
                className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-white/10 hover:border-red-500/30 transition-all"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onOpenAuth('login')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
