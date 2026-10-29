import React, { useState, useEffect } from 'react';
import { Ticket, Calendar, Clock, MapPin, XCircle, Eye, ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';

export default function UserBookingsView({ currentUser, onSelectTicket, onBackToMovies }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  const fetchBookings = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const res = await api.getUserBookings(currentUser.userId);
      setBookings(res.bookings || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [currentUser]);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? Reserved seats will be released.')) {
      return;
    }

    setCancellingId(bookingId);
    try {
      const res = await api.cancelBooking(bookingId, currentUser.userId, 'user');
      if (res.success) {
        fetchBookings();
      }
    } catch (err) {
      alert(err.message || 'Error cancelling booking');
    } finally {
      setCancellingId(null);
    }
  };

  const handleViewTicket = async (b) => {
    try {
      if (b.ticketId) {
        const res = await api.getTicket(b.ticketId);
        onSelectTicket({ booking: b, ticket: res.ticket });
      } else {
        onSelectTicket({ booking: b });
      }
    } catch {
      onSelectTicket({ booking: b });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToMovies}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Ticket className="w-6 h-6 text-cyan-400" />
              <span>My Movie Tickets</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage your cinema reservations, download e-tickets, and view booking history
            </p>
          </div>
        </div>

        <button
          onClick={fetchBookings}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
        >
          Refresh Tickets
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs text-red-300">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-slate-500 text-sm">
          Loading your tickets...
        </div>
      ) : bookings.length === 0 ? (
        <div className="p-12 text-center rounded-3xl glass-card border border-white/10 space-y-3">
          <Ticket className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Tickets Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You haven't booked any movie shows yet. Browse current blockbusters and reserve your seats now!
          </p>
          <button
            onClick={onBackToMovies}
            className="mt-3 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 transition-all shadow-lg shadow-cyan-500/20"
          >
            Explore Movies
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookings.map((b) => {
            const isConfirmed = b.status === 'CONFIRMED';
            const isCancelled = b.status === 'CANCELLED';

            return (
              <div
                key={b.bookingId}
                className="p-5 rounded-2xl glass-card border border-white/10 space-y-4 hover:border-white/20 transition-all"
              >
                {/* Top Status & Booking ID */}
                <div className="flex items-center justify-between text-xs pb-3 border-b border-white/5">
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
                    <span>ID:</span>
                    <span className="text-cyan-300 font-bold">{b.bookingId}</span>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                    isConfirmed
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : isCancelled
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {b.status}
                  </span>
                </div>

                {/* Movie Title & Theater */}
                <div>
                  <h4 className="text-lg font-bold text-white leading-tight">
                    {b.movieTitle}
                  </h4>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{b.theaterName} • {b.screenName}</span>
                  </p>
                </div>

                {/* Show Details Grid */}
                <div className="grid grid-cols-2 gap-3 bg-white/[0.02] p-3 rounded-xl border border-white/5 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Date & Time</span>
                    <span className="font-semibold text-slate-200 mt-0.5 block">
                      {b.showDate} at <strong className="text-white font-mono">{b.showTime}</strong>
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Seats ({b.ticketCount})</span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {b.seats && b.seats.map(s => (
                        <span key={s.seatNumber} className="px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 text-[10px] font-mono font-bold">
                          {s.seatNumber}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Price and Actions */}
                <div className="pt-2 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Amount</span>
                    <span className="text-base font-extrabold text-white font-mono">₹{b.totalAmount}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isConfirmed && (
                      <button
                        onClick={() => handleCancel(b.bookingId)}
                        disabled={cancellingId === b.bookingId}
                        className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 transition-colors"
                      >
                        {cancellingId === b.bookingId ? 'Cancelling...' : 'Cancel'}
                      </button>
                    )}

                    {isConfirmed && (
                      <button
                        onClick={() => handleViewTicket(b)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 transition-all shadow-md shadow-cyan-500/20"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View E-Ticket</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
