import React, { useState, useEffect } from 'react';
import { Shield, Film, Building2, Calendar, Ticket, Users, BarChart3, Plus, Trash2, Edit, AlertCircle, CheckCircle2, DollarSign, Ban, Check, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export default function AdminDashboardView({ currentUser, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'movies' | 'theaters' | 'shows' | 'bookings' | 'users' | 'reports'
  const [reports, setReports] = useState(null);
  const [movies, setMovies] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [shows, setShows] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Movie Form
  const [showAddMovie, setShowAddMovie] = useState(false);
  const [movieForm, setMovieForm] = useState({
    title: '',
    genre: 'Sci-Fi / Action',
    duration: 150,
    language: 'English',
    rating: '8.5',
    certification: 'UA',
    poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    description: '',
    director: '',
    cast: 'Lead Actor, Supporting Actor'
  });

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [repRes, movRes, thRes, shRes, bkRes, usrRes] = await Promise.all([
        api.getAdminReports(),
        api.getMovies(),
        api.getTheaters(),
        api.getShows(),
        api.getAllBookings(),
        api.getUsers()
      ]);

      setReports(repRes);
      setMovies(movRes.movies || []);
      setTheaters(thRes.theaters || []);
      setShows(shRes.shows || []);
      setBookings(bkRes.bookings || []);
      setUsers(usrRes.users || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Handle Add Movie
  const handleAddMovie = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createMovie({
        ...movieForm,
        cast: movieForm.cast.split(',').map(s => s.trim())
      });
      if (res.success) {
        setShowAddMovie(false);
        setMovieForm({
          title: '',
          genre: 'Sci-Fi / Action',
          duration: 150,
          language: 'English',
          rating: '8.5',
          certification: 'UA',
          poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
          description: '',
          director: '',
          cast: 'Lead Actor, Supporting Actor'
        });
        fetchAdminData();
      }
    } catch (err) {
      alert(err.message || 'Error creating movie');
    }
  };

  // Handle Delete Movie
  const handleDeleteMovie = async (movieId) => {
    if (!window.confirm('Delete this movie and its scheduled shows?')) return;
    try {
      await api.deleteMovie(movieId);
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Error deleting movie');
    }
  };

  // Handle Delete Show
  const handleDeleteShow = async (showId) => {
    if (!window.confirm('Delete this show?')) return;
    try {
      await api.deleteShow(showId);
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Error deleting show');
    }
  };

  // Handle Block / Unblock User
  const handleToggleUser = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
      await api.toggleUserStatus(userId, newStatus);
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Error toggling user status');
    }
  };

  // Handle Cancel Booking
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Cancel this booking as Admin? Seats will be returned to pool.')) return;
    try {
      await api.cancelBooking(bookingId, currentUser.userId, 'admin');
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Error cancelling booking');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
              SYSTEM ADMINISTRATOR CONSOLE
            </span>
            <span className="text-xs text-slate-400 font-mono">Platform Admin</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Shield className="w-6 h-6 text-amber-400" />
            <span>Master Operations & Analytics</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage movies, theaters, scheduled screenings, customer bookings, user permissions and financial reports
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-card border border-white/10 space-y-1">
          <span className="text-[11px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            Platform Revenue
          </span>
          <p className="text-2xl font-black text-white font-mono">
            ₹{reports?.summary?.totalRevenue || 0}
          </p>
          <p className="text-[10px] text-emerald-400">Total gross bookings</p>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-white/10 space-y-1">
          <span className="text-[11px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
            <Ticket className="w-4 h-4 text-cyan-400" />
            Total Bookings
          </span>
          <p className="text-2xl font-black text-white font-mono">
            {reports?.summary?.totalBookings || 0}
          </p>
          <p className="text-[10px] text-slate-400">{reports?.summary?.confirmedBookingsCount || 0} confirmed</p>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-white/10 space-y-1">
          <span className="text-[11px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
            <Film className="w-4 h-4 text-purple-400" />
            Active Movies
          </span>
          <p className="text-2xl font-black text-white font-mono">
            {movies.length}
          </p>
          <p className="text-[10px] text-slate-400">In catalog</p>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-white/10 space-y-1">
          <span className="text-[11px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-amber-400" />
            Registered Users
          </span>
          <p className="text-2xl font-black text-white font-mono">
            {users.length}
          </p>
          <p className="text-[10px] text-slate-400">{reports?.summary?.totalHosts || 0} hosts</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-white/10 text-xs">
        {[
          { id: 'overview', label: 'Dashboard & Reports' },
          { id: 'movies', label: `Manage Movies (${movies.length})` },
          { id: 'theaters', label: `Manage Theaters (${theaters.length})` },
          { id: 'shows', label: `Manage Shows (${shows.length})` },
          { id: 'bookings', label: `Manage Bookings (${bookings.length})` },
          { id: 'users', label: `Manage Users (${users.length})` }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-2 px-4 rounded-xl font-semibold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-amber-500/20 text-amber-300 shadow border border-amber-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: MOVIES */}
      {activeTab === 'movies' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Movie Catalog</h3>
            <button
              onClick={() => setShowAddMovie(!showAddMovie)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Movie</span>
            </button>
          </div>

          {showAddMovie && (
            <form onSubmit={handleAddMovie} className="p-5 rounded-2xl glass-card border border-amber-500/30 space-y-4">
              <h4 className="text-sm font-bold text-amber-400">Register New Movie</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={movieForm.title}
                    onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                    placeholder="e.g. Gladiator II"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Genre</label>
                  <input
                    type="text"
                    required
                    value={movieForm.genre}
                    onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })}
                    placeholder="Action / Historical Drama"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    required
                    value={movieForm.duration}
                    onChange={(e) => setMovieForm({ ...movieForm, duration: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Rating (IMDb)</label>
                  <input
                    type="text"
                    value={movieForm.rating}
                    onChange={(e) => setMovieForm({ ...movieForm, rating: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Director</label>
                  <input
                    type="text"
                    value={movieForm.director}
                    onChange={(e) => setMovieForm({ ...movieForm, director: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Poster URL</label>
                  <input
                    type="url"
                    value={movieForm.poster}
                    onChange={(e) => setMovieForm({ ...movieForm, poster: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Synopsis / Description</label>
                <textarea
                  rows={2}
                  value={movieForm.description}
                  onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })}
                  placeholder="Plot summary..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMovie(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-400 shadow"
                >
                  Add Movie
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {movies.map((m) => (
              <div key={m.movieId} className="p-4 rounded-2xl glass-card border border-white/10 flex gap-4">
                <img
                  src={m.poster}
                  alt={m.title}
                  className="w-20 h-28 object-cover rounded-xl bg-slate-900 shrink-0"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-white line-clamp-1">{m.title}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{m.genre}</p>
                    <p className="text-[10px] text-amber-400 mt-1 font-bold">★ {m.rating} • {m.duration}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-[10px] text-slate-500">{m.showCount || 0} active shows</span>
                    <button
                      onClick={() => handleDeleteMovie(m.movieId)}
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/15 transition-colors"
                      title="Delete Movie"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: THEATERS */}
      {activeTab === 'theaters' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white">System Theaters & Screens</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {theaters.map((th) => (
              <div key={th.theaterId} className="p-5 rounded-2xl glass-card border border-white/10 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-base text-white">{th.name}</h4>
                    <p className="text-xs text-slate-400">{th.location}, {th.city}</p>
                  </div>
                  <span className="text-[11px] font-mono text-cyan-300 bg-white/5 px-2 py-0.5 rounded">
                    Host: {th.hostId}
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
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white">All Platform Scheduled Shows</h3>
          <div className="space-y-3">
            {shows.map((s) => (
              <div
                key={s.showId}
                className="p-4 rounded-2xl glass-card border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                      {s.format}
                    </span>
                    <span className="text-xs font-semibold text-white">{s.movieTitle}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {s.theaterName} • {s.date} at <strong className="text-white font-mono">{s.time}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-cyan-300">₹{s.price}</span>
                  <button
                    onClick={() => handleDeleteShow(s.showId)}
                    className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white">All Bookings Across Platform</h3>
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Booking ID</th>
                  <th className="px-4 py-3">Movie</th>
                  <th className="px-4 py-3">Theater</th>
                  <th className="px-4 py-3">User ID</th>
                  <th className="px-4 py-3">Seats</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {bookings.map((b) => (
                  <tr key={b.bookingId} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-mono text-cyan-300 font-bold">{b.bookingId}</td>
                    <td className="px-4 py-3 text-white font-medium">{b.movieTitle}</td>
                    <td className="px-4 py-3">{b.theaterName}</td>
                    <td className="px-4 py-3 font-mono text-slate-400">{b.userId}</td>
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
                    <td className="px-4 py-3">
                      {b.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleCancelBooking(b.bookingId)}
                          className="px-2.5 py-1 rounded-lg text-[11px] text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: USERS */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white">User Accounts & Permissions</h3>
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">User ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">UPI ID (Host)</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {users.map((u) => (
                  <tr key={u.userId} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-mono text-slate-400">{u.userId}</td>
                    <td className="px-4 py-3 font-medium text-white">{u.name}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        u.role === 'admin'
                          ? 'bg-amber-500/20 text-amber-300'
                          : u.role === 'host'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-cyan-500/20 text-cyan-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-emerald-400">
                      {u.upiId || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-red-500/20 text-red-300'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleUser(u.userId, u.status)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors ${
                            u.status === 'active'
                              ? 'text-red-400 border-red-500/30 hover:bg-red-500/10'
                              : 'text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/10'
                          }`}
                        >
                          {u.status === 'active' ? 'Block' : 'Unblock'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: REPORTS & ANALYTICS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Movie Revenue Chart */}
            <div className="p-5 rounded-2xl glass-card border border-white/10 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span>Top Revenue Movies</span>
              </h4>

              <div className="space-y-3">
                {reports?.movieAnalytics?.map((mov) => {
                  const maxRev = reports.movieAnalytics[0]?.revenue || 1;
                  const pct = Math.round((mov.revenue / (maxRev || 1)) * 100);

                  return (
                    <div key={mov.movieId} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-medium">{mov.title}</span>
                        <span className="text-white font-mono font-bold">₹{mov.revenue}</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(pct, 5)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Theater Performance */}
            <div className="p-5 rounded-2xl glass-card border border-white/10 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>Theater Revenue & Ticket Sales</span>
              </h4>

              <div className="space-y-3">
                {reports?.theaterAnalytics?.map((th) => (
                  <div key={th.theaterId} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-white">{th.name}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{th.city} • {th.ticketsSold} tickets sold</p>
                    </div>
                    <span className="text-emerald-400 font-mono font-bold text-sm">₹{th.revenue}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
