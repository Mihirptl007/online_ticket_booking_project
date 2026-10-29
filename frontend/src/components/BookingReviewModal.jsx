import React, { useState, useEffect } from 'react';
import { X, Clock, ArrowRight, ShieldCheck, Film, MapPin, Ticket, AlertTriangle, ArrowLeft } from 'lucide-react';

export default function BookingReviewModal({
  bookingData,
  onClose,
  onProceedToPayment,
  onCancelHold
}) {
  const { booking, show, holdExpiresAt } = bookingData || {};

  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  useEffect(() => {
    if (!holdExpiresAt) return;

    const interval = setInterval(() => {
      const diff = Math.floor((new Date(holdExpiresAt) - new Date()) / 1000);
      if (diff <= 0) {
        setTimeLeft(0);
        clearInterval(interval);
      } else {
        setTimeLeft(diff);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [holdExpiresAt]);

  if (!booking) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-lg my-auto glass-panel rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onCancelHold}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Change seats"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h3 className="text-base font-bold text-white">Review Booking Order</h3>
              <p className="text-[11px] text-slate-400">Order #{booking.bookingId}</p>
            </div>
          </div>

          <button
            onClick={onCancelHold}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 10-Minute Hold Countdown Banner */}
        <div className={`px-5 py-2.5 flex items-center justify-between text-xs font-semibold ${
          timeLeft <= 120
            ? 'bg-red-500/20 text-red-300 border-b border-red-500/30'
            : 'bg-amber-500/15 text-amber-300 border-b border-amber-500/20'
        }`}>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Seats Temporarily Held For You</span>
          </div>
          <span className="font-mono text-sm tracking-wider font-extrabold bg-black/40 px-2.5 py-0.5 rounded-lg border border-amber-500/30">
            {formattedTime}
          </span>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          
          {/* Movie & Theater Summary Card */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="font-bold text-base text-white">{booking.movieTitle}</h4>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{booking.theaterName}</span>
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {booking.screenName}
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-md inline-block">
                  {booking.showDate}
                </span>
                <span className="text-xs font-extrabold text-white block mt-1 font-mono">
                  {booking.showTime}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-slate-400">Reserved Seats ({booking.ticketCount}):</span>
              <div className="flex flex-wrap gap-1">
                {booking.seats && booking.seats.map(s => (
                  <span key={s.seatNumber} className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono font-bold text-[11px]">
                    {s.seatNumber} ({s.type})
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span>Ticket Base Price ({booking.ticketCount} seat{booking.ticketCount > 1 ? 's' : ''})</span>
              <span className="font-mono text-white">₹{booking.subtotal}</span>
            </div>

            <div className="flex items-center justify-between text-slate-400">
              <span>Convenience & Booking Fee</span>
              <span className="font-mono text-slate-300">₹{booking.convenienceFee}</span>
            </div>

            <div className="flex items-center justify-between text-slate-400">
              <span>Integrated GST (18%)</span>
              <span className="font-mono text-slate-300">₹{booking.tax}</span>
            </div>

            <div className="pt-2.5 mt-2.5 border-t border-white/10 flex items-center justify-between text-sm font-bold">
              <span className="text-white">Total Amount Payable</span>
              <span className="text-cyan-400 font-extrabold text-lg font-mono">₹{booking.totalAmount}</span>
            </div>
          </div>

          {/* Payment Notice / Host QR Banner */}
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center gap-2.5 text-xs text-cyan-300">
            <ShieldCheck className="w-4 h-4 shrink-0 text-cyan-400" />
            <span>
              Next: Payment is routed directly to the event host's verified UPI QR code.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onCancelHold}
              className="py-3 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              Cancel Hold
            </button>

            <button
              type="button"
              disabled={timeLeft <= 0}
              onClick={() => onProceedToPayment(booking)}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-xl shadow-cyan-500/25 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <span>Confirm & Proceed to Payment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
