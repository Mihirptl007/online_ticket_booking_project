import React, { useState, useEffect } from 'react';
import { Building2, Film, Calendar, Plus, QrCode, CheckCircle2, AlertCircle, ScanLine, DollarSign, Ticket, ShieldCheck, Trash2, Edit } from 'lucide-react';
import { api } from '../services/api';

export default function HostDashboardView({ currentUser, onUpdateCurrentUser }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'upi-settings' | 'theaters' | 'shows' | 'scanner' | 'bookings'
  const [report, setReport] = useState(null);
  const [theaters, setTheaters] = useState([]);
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // UPI Settings Form State
  const [upiSettings, setUpiSettings] = useState({
    upiId: currentUser?.upiId || '',
    upiName: currentUser?.upiName || currentUser?.name || '',
    phone: currentUser?.phone || ''
  });
  const [upiSaveSuccess, setUpiSaveSuccess] = useState(false);

  // Add Theater Form State
  const [theaterForm, setTheaterForm] = useState({
    name: '',
    location: '',
    city: 'Mumbai',
    screenName: 'Audi 1 - IMAX with Laser 3D',
    capacity: 64
  });
  const [showAddTheater, setShowAddTheater] = useState(false);

  // Add Show Form State
  const [showForm, setShowForm] = useState({
    movieId: '',
    theaterId: '',
    format: 'IMAX 3D',
    date: new Date().toISOString().split('T')[0],
    time: '18:30',
    price: 450,
    silverPrice: 280,
    goldPrice: 450,
    vipPrice: 750
  });
  const [showAddShow, setShowAddShow] = useState(false);

  // Scanner State
  const [scanQuery, setScanQuery] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(false);

  const fetchHostData = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const [repRes, thRes, shRes, movRes, bkRes] = await Promise.all([
        api.getHostReports(currentUser.userId),
        api.getTheaters({ hostId: currentUser.userId }),
        api.getShows({ hostId: currentUser.userId }),
        api.getMovies(),
        api.getHostBookings(currentUser.userId)
      ]);

      setReport(repRes);
      setTheaters(thRes.theaters || []);
      setShows(shRes.shows || []);
      setMovies(movRes.movies || []);
      setBookings(bkRes.bookings || []);
    } catch (err) {
      console.error('Error fetching host dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostData();
    if (currentUser) {
      setUpiSettings({
        upiId: currentUser.upiId || 'pvr.cinemas@icici',
        upiName: currentUser.upiName || currentUser.name || 'Cinema Organizer',
        phone: currentUser.phone || ''
      });
    }
  }, [currentUser]);

  // Handle UPI Save
  const handleSaveUpi = async (e) => {
    e.preventDefault();
    try {
      const res = await api.updateHostProfile(currentUser.userId, upiSettings);
      if (res.success) {
        setUpiSaveSuccess(true);
        if (onUpdateCurrentUser) onUpdateCurrentUser(res.host);
        setTimeout(() => setUpiSaveSuccess(false), 3000);
      }
    } catch (err) {
      alert(err.message || 'Error updating UPI settings');
    }
  };

  // Handle Add Theater
  const handleAddTheater = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createTheater({
        name: theaterForm.name,
        location: theaterForm.location,
        city: theaterForm.city,
        hostId: currentUser.userId,
        screens: [
          {
            screenId: `sc_${Date.now()}_1`,
            name: theaterForm.screenName,
            capacity: Number(theaterForm.capacity),
            rows: 8,
            cols: 8
          }
        ],
        amenities: ['IMAX Laser', 'Dolby Atmos', 'Premium Recliners']
      });

      if (res.success) {
        setShowAddTheater(false);
        setTheaterForm({
          name: '',
          location: '',
          city: 'Mumbai',
          screenName: 'Audi 1 - IMAX with Laser 3D',
          capacity: 64
        });
        fetchHostData();
      }
    } catch (err) {
      alert(err.message || 'Error adding theater');
    }
  };

  // Handle Add Show
  const handleAddShow = async (e) => {
    e.preventDefault();
    if (!showForm.movieId || !showForm.theaterId) {
      alert('Please select a movie and theater');
      return;
    }

    try {
      const res = await api.createShow({
        movieId: showForm.movieId,
        theaterId: showForm.theaterId,
        hostId: currentUser.userId,
        format: showForm.format,
        date: showForm.date,
        time: showForm.time,
        price: Number(showForm.goldPrice),
        tierPricing: {
          silver: Number(showForm.silverPrice),
          gold: Number(showForm.goldPrice),
          vip: Number(showForm.vipPrice)
        }
      });

      if (res.success) {
        setShowAddShow(false);
        fetchHostData();
      }
    } catch (err) {
      alert(err.message || 'Error scheduling show');
    }
  };

  // Handle Delete Show
  const handleDeleteShow = async (showId) => {
    if (!window.confirm('Delete this scheduled show?')) return;
    try {
      await api.deleteShow(showId);
      fetchHostData();
    } catch (err) {
      alert(err.message || 'Error deleting show');
    }
  };

  // Handle Ticket Scan
  const handleScanTicket = async (e) => {
    e.preventDefault();
    if (!scanQuery.trim()) return;

    setScanning(true);
    setScanResult(null);

    try {
      const res = await api.scanTicket(scanQuery.trim());
      setScanResult(res);
    } catch (err) {
      setScanResult({ valid: false, message: err.message || 'Verification error' });
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      {/* Host Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              CINEMA HOST STUDIO
            </span>
            <span className="text-xs text-slate-400 font-mono">Host ID: {currentUser.userId}</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-emerald-400" />
            <span>{currentUser.name}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your theaters, schedules, UPI payment QR codes, and door entry scanner
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('upi-settings')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-all"
          >
            <QrCode className="w-4 h-4 text-emerald-400" />
            <span>Host UPI QR Settings</span>
          </button>
          <button
            onClick={() => setActiveTab('scanner')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-all"
          >
            <ScanLine className="w-4 h-4 text-cyan-400" />
            <span>Gate Scanner</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-card border border-white/10 space-y-2">
          <span className="text-[11px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            Total Host Revenue
          </span>
          <p className="text-2xl font-black text-white font-mono">
            ₹{report?.summary?.totalRevenue || 0}
          </p>
          <p className="text-[10px] text-emerald-400 font-medium">Direct to your bank account via UPI</p>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-white/10 space-y-2">
          <span className="text-[11px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
            <Ticket className="w-4 h-4 text-cyan-400" />
            Tickets Sold
          </span>
          <p className="text-2xl font-black text-white font-mono">
            {report?.summary?.totalTicketsSold || 0}
          </p>
          <p className="text-[10px] text-slate-400">Across all scheduled shows</p>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-white/10 space-y-2">
          <span className="text-[11px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-indigo-400" />
            My Theaters
          </span>
          <p className="text-2xl font-black text-white font-mono">
            {theaters.length}
          </p>
          <p className="text-[10px] text-slate-400">Venues listed</p>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-white/10 space-y-2">
          <span className="text-[11px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-amber-400" />
            Active Shows
          </span>
          <p className="text-2xl font-black text-white font-mono">
            {shows.length}
          </p>
          <p className="text-[10px] text-slate-400">Screening dates available</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-white/10 text-xs">
        {[
          { id: 'overview', label: 'Overview & Bookings' },
          { id: 'theaters', label: `My Theaters (${theaters.length})` },
          { id: 'shows', label: `My Shows (${shows.length})` },
          { id: 'upi-settings', label: 'UPI QR Settings' },
          { id: 'scanner', label: 'Entrance Ticket Scanner' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-2 px-4 rounded-xl font-semibold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-white/15 text-white shadow border border-white/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: UPI SETTINGS */}
      {activeTab === 'upi-settings' && (
        <div className="max-w-2xl bg-white/[0.02] p-6 rounded-3xl border border-white/10 space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <QrCode className="w-5 h-5 text-emerald-400" />
              <span>Host UPI QR Code Configuration</span>
            </h3>
            <p className="text-xs text-slate-400">
              When users book tickets for your shows, their payment gateway generates a dynamic QR code pre-filled with this UPI ID.
            </p>
          </div>

          {upiSaveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>UPI settings saved successfully! Users will now pay to this VPA.</span>
            </div>
          )}

          <form onSubmit={handleSaveUpi} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Your UPI Virtual Payment Address (VPA)
              </label>
              <input
                type="text"
                required
                value={upiSettings.upiId}
                onChange={(e) => setUpiSettings({ ...upiSettings, upiId: e.target.value })}
                placeholder="e.g. pvr.cinemas@icici or organizer@okaxis"
                className="w-full bg-black/40 border border-white/10 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs text-emerald-300 font-mono transition-colors"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Supports all UPI handles: @icici, @okhdfcbank, @okaxis, @paytm, @ybl
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Business / Display Name on UPI
              </label>
              <input
                type="text"
                required
                value={upiSettings.upiName}
                onChange={(e) => setUpiSettings({ ...upiSettings, upiName: e.target.value })}
                placeholder="e.g. PVR CINEMAS ENTERTAINMENT LTD"
                className="w-full bg-black/40 border border-white/10 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs text-white transition-colors"
              />
            </div>

            <button
              type="submit"
              className="py-2.5 px-6 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
            >
              Save UPI Settings
            </button>
          </form>
        </div>
      )}

      {/* TAB CONTENT: THEATERS */}
      {activeTab === 'theaters' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">My Cinema Theaters</h3>
            <button
              onClick={() => setShowAddTheater(!showAddTheater)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Theater</span>
            </button>
          </div>

          {showAddTheater && (
            <form onSubmit={handleAddTheater} className="p-5 rounded-2xl glass-card border border-emerald-500/30 space-y-4">
              <h4 className="text-sm font-bold text-emerald-400">Register New Theater Venue</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Theater Name</label>
                  <input
                    type="text"
                    required
                    value={theaterForm.name}
                    onChange={(e) => setTheaterForm({ ...theaterForm, name: e.target.value })}
                    placeholder="PVR ICON, Infiniti Mall"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Location / Area</label>
                  <input
                    type="text"
                    required
                    value={theaterForm.location}
                    onChange={(e) => setTheaterForm({ ...theaterForm, location: e.target.value })}
                    placeholder="Andheri West"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">City</label>
                  <select
                    value={theaterForm.city}
                    onChange={(e) => setTheaterForm({ ...theaterForm, city: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi NCR">Delhi NCR</option>
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Hyderabad">Hyderabad</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTheater(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-400 shadow"
                >
                  Save Theater
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {theaters.map((th) => (
              <div key={th.theaterId} className="p-5 rounded-2xl glass-card border border-white/10 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-base text-white">{th.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{th.location}, {th.city}</p>
                  </div>
                  <span className="text-[10px] font-mono bg-white/5 px-2 py-0.5 rounded text-cyan-300 border border-white/10">
                    {th.screens?.length || 1} Screen(s)
                  </span>
                </div>

                <div className="pt-2 border-t border-white/5 space-y-1">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">Screens:</p>
                  {th.screens?.map((scr) => (
                    <div key={scr.screenId} className="flex items-center justify-between text-xs text-slate-300 bg-white/[0.02] px-2.5 py-1.5 rounded-lg">
                      <span>{scr.name}</span>
                      <span className="text-slate-500">{scr.capacity} seats</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: SHOWS */}
      {activeTab === 'shows' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Scheduled Screening Shows</h3>
            <button
              onClick={() => setShowAddShow(!showAddShow)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule New Show</span>
            </button>
          </div>

          {showAddShow && (
            <form onSubmit={handleAddShow} className="p-5 rounded-2xl glass-card border border-cyan-500/30 space-y-4">
              <h4 className="text-sm font-bold text-cyan-400">Schedule Movie Show</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Select Movie</label>
                  <select
                    required
                    value={showForm.movieId}
                    onChange={(e) => setShowForm({ ...showForm, movieId: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="">-- Choose Movie --</option>
                    {movies.map(m => (
                      <option key={m.movieId} value={m.movieId}>{m.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">Select Theater</label>
                  <select
                    required
                    value={showForm.theaterId}
                    onChange={(e) => setShowForm({ ...showForm, theaterId: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="">-- Choose Theater --</option>
                    {theaters.map(t => (
                      <option key={t.theaterId} value={t.theaterId}>{t.name} ({t.city})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">Format</label>
                  <select
                    value={showForm.format}
                    onChange={(e) => setShowForm({ ...showForm, format: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="IMAX 3D">IMAX 3D</option>
                    <option value="IMAX 2D">IMAX 2D</option>
                    <option value="4DX 3D">4DX 3D</option>
                    <option value="Dolby Atmos 4K">Dolby Atmos 4K</option>
                    <option value="Standard 2D">Standard 2D</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">Show Date</label>
                  <input
                    type="date"
                    required
                    value={showForm.date}
                    onChange={(e) => setShowForm({ ...showForm, date: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">Show Time (HH:mm)</label>
                  <input
                    type="time"
                    required
                    value={showForm.time}
                    onChange={(e) => setShowForm({ ...showForm, time: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">Silver Tier Price (₹)</label>
                  <input
                    type="number"
                    value={showForm.silverPrice}
                    onChange={(e) => setShowForm({ ...showForm, silverPrice: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">Gold Tier Price (₹)</label>
                  <input
                    type="number"
                    value={showForm.goldPrice}
                    onChange={(e) => setShowForm({ ...showForm, goldPrice: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">VIP Recliner Price (₹)</label>
                  <input
                    type="number"
                    value={showForm.vipPrice}
                    onChange={(e) => setShowForm({ ...showForm, vipPrice: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddShow(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-cyan-500 hover:bg-cyan-400 shadow"
                >
                  Save & Publish Show
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {shows.map((s) => (
              <div
                key={s.showId}
                className="p-4 rounded-2xl glass-card border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30">
                      {s.format}
                    </span>
                    <span className="text-xs font-semibold text-white">{s.movieTitle}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {s.theaterName} • {s.date} at <strong className="text-white font-mono">{s.time}</strong>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                    Pricing: Silver ₹{s.tierPricing?.silver} | Gold ₹{s.tierPricing?.gold} | VIP ₹{s.tierPricing?.vip}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeleteShow(s.showId)}
                    className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors"
                    title="Delete Show"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: GATE SCANNER */}
      {activeTab === 'scanner' && (
        <div className="max-w-2xl bg-white/[0.02] p-6 rounded-3xl border border-white/10 space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ScanLine className="w-5 h-5 text-cyan-400" />
              <span>Cinema Gate Ticket Scanner</span>
            </h3>
            <p className="text-xs text-slate-400">
              Verify customer digital tickets at the screen door. Enter Ticket ID or scan QR code string to check-in.
            </p>
          </div>

          <form onSubmit={handleScanTicket} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Ticket ID, Booking ID, or QR Verification Token
              </label>
              <input
                type="text"
                required
                value={scanQuery}
                onChange={(e) => setScanQuery(e.target.value)}
                placeholder="e.g. tkt_demo_101 or paste QR string"
                className="w-full bg-black/40 border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={scanning}
              className="py-2.5 px-6 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2"
            >
              <ScanLine className="w-4 h-4" />
              <span>{scanning ? 'Verifying...' : 'Verify Ticket & Check-In'}</span>
            </button>
          </form>

          {/* Scanner Result Card */}
          {scanResult && (
            <div className={`p-5 rounded-2xl border ${
              scanResult.valid
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            } space-y-3 animate-in fade-in`}>
              <div className="flex items-center gap-2">
                {scanResult.valid ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                )}
                <h4 className="font-bold text-sm">
                  {scanResult.valid ? 'VALID ENTRY - CHECKED IN' : 'VERIFICATION FAILED'}
                </h4>
              </div>

              <p className="text-xs">{scanResult.message}</p>

              {scanResult.ticket && (
                <div className="bg-black/40 p-3 rounded-xl border border-white/10 text-xs text-slate-300 space-y-1 font-mono">
                  <p><strong>Movie:</strong> {scanResult.ticket.movieTitle}</p>
                  <p><strong>Seats:</strong> {scanResult.ticket.seatNumbers?.join(', ')}</p>
                  <p><strong>Screen:</strong> {scanResult.ticket.screenName}</p>
                  <p><strong>Time:</strong> {scanResult.ticket.showDate} at {scanResult.ticket.showTime}</p>
                  <p><strong>Ticket ID:</strong> {scanResult.ticket.ticketId}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: OVERVIEW & BOOKINGS */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white">Recent Customer Bookings</h3>
          {bookings.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs rounded-2xl bg-white/5 border border-white/10">
              No bookings placed for your theaters yet.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3">Booking ID</th>
                    <th className="px-4 py-3">Movie</th>
                    <th className="px-4 py-3">Theater</th>
                    <th className="px-4 py-3">Seats</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {bookings.map((b) => (
                    <tr key={b.bookingId} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3 font-mono text-cyan-300 font-bold">{b.bookingId}</td>
                      <td className="px-4 py-3 text-white font-medium">{b.movieTitle}</td>
                      <td className="px-4 py-3">{b.theaterName}</td>
                      <td className="px-4 py-3 font-mono">{b.seats?.map(s => s.seatNumber).join(', ')}</td>
                      <td className="px-4 py-3 font-mono font-bold text-white">₹{b.totalAmount}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          b.status === 'CONFIRMED'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-red-500/20 text-red-300'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
