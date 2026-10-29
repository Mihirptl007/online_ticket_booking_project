import React, { useState, useEffect } from 'react';
import { X, Sparkles, AlertCircle, ArrowRight, Check, Clock, ShieldCheck, Armchair } from 'lucide-react';
import { api } from '../services/api';

export default function SeatPickerModal({
  show,
  currentUser,
  onClose,
  onProceedToReview,
  onRequireAuth
}) {
  const [seatsData, setSeatsData] = useState(null);
  const [selectedSeatNumbers, setSelectedSeatNumbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [holding, setHolding] = useState(false);
  const [error, setError] = useState('');

  const fetchSeats = async () => {
    if (!show) return;
    try {
      setLoading(true);
      const res = await api.getShowSeats(show.showId);
      setSeatsData(res);
      setError('');
    } catch (err) {
      setError(err.message || 'Error fetching seating layout');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeats();
  }, [show]);

  if (!show) return null;

  const toggleSeat = (seat) => {
    if (seat.status !== 'AVAILABLE') return;

    if (selectedSeatNumbers.includes(seat.seatNumber)) {
      setSelectedSeatNumbers(prev => prev.filter(s => s !== seat.seatNumber));
    } else {
      if (selectedSeatNumbers.length >= 8) {
        setError('Maximum 8 seats allowed per booking transaction.');
        return;
      }
      setError('');
      setSelectedSeatNumbers(prev => [...prev, seat.seatNumber]);
    }
  };

  // Group seats by rows
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const seatsByRow = {};
  rows.forEach(r => { seatsByRow[r] = []; });

  if (seatsData && seatsData.seats) {
    seatsData.seats.forEach(s => {
      if (seatsByRow[s.row]) {
        seatsByRow[s.row].push(s);
      }
    });
  }

  // Calculate pricing
  const selectedSeatObjects = seatsData?.seats?.filter(s => selectedSeatNumbers.includes(s.seatNumber)) || [];
  const subtotal = selectedSeatObjects.reduce((sum, s) => sum + s.price, 0);

  const handleHoldAndProceed = async () => {
    if (selectedSeatNumbers.length === 0) {
      setError('Please select at least one seat to proceed.');
      return;
    }

    if (!currentUser) {
      onRequireAuth();
      return;
    }

    setHolding(true);
    setError('');

    try {
      const res = await api.holdAndCreateBooking(
        currentUser.userId,
        show.showId,
        selectedSeatNumbers
      );

      if (res.success) {
        onProceedToReview({
          booking: res.booking,
          show,
          holdExpiresAt: res.holdExpiresAt,
          holdExpiresInSeconds: res.holdExpiresInSeconds
        });
      }
    } catch (err) {
      setError(err.message || 'Selected seats could not be reserved. They might have been held just now.');
      fetchSeats(); // Refresh seats to reflect latest status
    } finally {
      setHolding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-3xl my-auto glass-panel rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                {show.format || 'IMAX 2D'}
              </span>
              <span className="text-xs text-slate-400">
                {show.screenName}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mt-0.5">
              {show.movieTitle || show.movie?.title || 'Cinema Screening'}
            </h3>
            <p className="text-xs text-slate-400">
              {show.theaterName || show.theater?.name} • {show.date} at <strong className="text-white">{show.time}</strong>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">

          {/* Seat Status Legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-400 pb-2 border-b border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-white/10 border border-white/20" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-cyan-500 border border-cyan-400 shadow shadow-cyan-500/50" />
              <span className="text-cyan-300 font-medium">Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-amber-500/30 border border-amber-500/60" />
              <span>Held (Temporary)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-slate-800 border border-slate-700 opacity-60 flex items-center justify-center text-[9px] text-slate-500 font-bold">
                ✕
              </div>
              <span>Sold Out</span>
            </div>
          </div>

          {/* Curved Cinema Screen */}
          <div className="pt-2 text-center">
            <div className="cinema-screen-curve" />
            <p className="text-[10px] uppercase font-bold tracking-widest text-cyan-400/80 mt-2">
              All Eyes This Way • Cinema Screen
            </p>
          </div>

          {/* Seat Matrix */}
          {loading ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              Loading interactive seat layout...
            </div>
          ) : (
            <div className="space-y-4 max-h-[46vh] overflow-y-auto px-2">
              {rows.map((rowName) => {
                const rowSeats = seatsByRow[rowName] || [];
                const isVip = ['A', 'B'].includes(rowName);
                const isGold = ['C', 'D', 'E'].includes(rowName);
                const tierName = isVip ? 'VIP Recliner' : isGold ? 'Prime Gold' : 'Classic Silver';
                const tierPrice = isVip
                  ? show.tierPricing?.vip || 750
                  : isGold
                  ? show.tierPricing?.gold || 450
                  : show.tierPricing?.silver || 280;

                return (
                  <div key={rowName} className="space-y-1">
                    {/* Tier Divider Label for first row of tier */}
                    {(rowName === 'A' || rowName === 'C' || rowName === 'F') && (
                      <div className="flex items-center justify-between text-[11px] text-slate-400 px-3 py-1 bg-white/[0.02] rounded-lg border border-white/5 my-2">
                        <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                          <Armchair className="w-3.5 h-3.5 text-cyan-400" />
                          {tierName}
                        </span>
                        <span className="font-mono text-cyan-400 font-semibold">₹{tierPrice}</span>
                      </div>
                    )}

                    {/* Row of seats */}
                    <div className="flex items-center justify-center gap-2 sm:gap-3">
                      <span className="w-4 text-xs font-bold text-slate-500 text-center font-mono">
                        {rowName}
                      </span>

                      <div className="flex items-center gap-1.5 sm:gap-2">
                        {rowSeats.map((seat, idx) => {
                          const isSelected = selectedSeatNumbers.includes(seat.seatNumber);
                          const isHeld = seat.status === 'HELD';
                          const isBooked = seat.status === 'BOOKED';

                          // Aisle gap after 4 seats
                          const addAisle = idx === 3;

                          return (
                            <React.Fragment key={seat.seatNumber}>
                              <button
                                type="button"
                                disabled={isBooked || isHeld}
                                onClick={() => toggleSeat(seat)}
                                className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center ${
                                  isSelected
                                    ? 'bg-gradient-to-tr from-cyan-500 to-blue-500 text-black font-extrabold shadow-lg shadow-cyan-500/50 scale-110 border border-cyan-300'
                                    : isBooked
                                    ? 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed opacity-50'
                                    : isHeld
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 cursor-not-allowed'
                                    : 'bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/10 hover:border-cyan-400/50'
                                }`}
                                title={`${seat.seatNumber} (${seat.type} - ₹${seat.price})`}
                              >
                                {isBooked ? '✕' : seat.col}
                              </button>
                              {addAisle && <div className="w-4 sm:w-6" />}
                            </React.Fragment>
                          );
                        })}
                      </div>

                      <span className="w-4 text-xs font-bold text-slate-500 text-center font-mono">
                        {rowName}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Bottom Action Footer */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-400">
                Selected Seats ({selectedSeatNumbers.length}):
              </div>
              <div className="flex items-center gap-1.5 flex-wrap mt-1">
                {selectedSeatNumbers.length === 0 ? (
                  <span className="text-xs text-slate-500 italic">None selected yet</span>
                ) : (
                  selectedSeatNumbers.map(s => (
                    <span key={s} className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold font-mono">
                      {s}
                    </span>
                  ))
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase font-medium">Subtotal</span>
                <span className="text-lg font-extrabold text-white font-mono">₹{subtotal}</span>
              </div>

              <button
                type="button"
                disabled={selectedSeatNumbers.length === 0 || holding}
                onClick={handleHoldAndProceed}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/40 active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none"
              >
                {holding ? (
                  <span>Reserving Seats...</span>
                ) : (
                  <>
                    <span>Hold & Review</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
