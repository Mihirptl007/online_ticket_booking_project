import React, { useRef } from 'react';
import { X, Download, Printer, CheckCircle2, Ticket as TicketIcon, Calendar, Clock, MapPin, Film, ShieldCheck } from 'lucide-react';

export default function TicketModal({ ticketData, onClose, onGoToMyBookings }) {
  const { booking, ticket } = ticketData || {};
  const ticketRef = useRef(null);

  if (!ticket && !booking) return null;

  const movieTitle = ticket?.movieTitle || booking?.movieTitle || 'Movie Ticket';
  const theaterName = ticket?.theaterName || booking?.theaterName || 'Cinema';
  const screenName = ticket?.screenName || booking?.screenName || 'Screen 1';
  const showDate = ticket?.showDate || booking?.showDate;
  const showTime = ticket?.showTime || booking?.showTime;
  const seatNumbers = ticket?.seatNumbers || booking?.seats?.map(s => s.seatNumber) || [];
  const ticketId = ticket?.ticketId || 'TKT-PENDING';
  const bookingId = booking?.bookingId || ticket?.bookingId;
  const totalAmount = ticket?.price || booking?.totalAmount || 0;
  const qrCodeUrl = ticket?.QRCode;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-md my-auto glass-panel rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Booking Confirmed!</h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Ticket Area */}
        <div ref={ticketRef} className="p-6 space-y-4">
          
          {/* Boarding Pass / Ticket Body */}
          <div className="relative rounded-3xl bg-gradient-to-b from-[#131722] via-[#0f131c] to-[#0a0c14] border border-white/15 shadow-2xl overflow-hidden">
            
            {/* Top Accent Strip */}
            <div className="h-2.5 w-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-fuchsia-500" />

            {/* Ticket Main Content */}
            <div className="p-5 space-y-4">
              
              {/* Brand and Verification */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TicketIcon className="w-4 h-4 text-cyan-400" />
                  <span className="font-mono font-bold text-xs text-white uppercase tracking-wider">NOVELLA CINEMAS</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {ticket?.status || 'VALID TICKET'}
                </span>
              </div>

              {/* Movie Title & Theater */}
              <div className="border-b border-white/10 pb-3">
                <h4 className="text-xl font-black text-white leading-tight">
                  {movieTitle}
                </h4>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{theaterName}</span>
                </p>
                <p className="text-[11px] text-cyan-300 font-medium mt-0.5">
                  {screenName}
                </p>
              </div>

              {/* Time & Date Grid */}
              <div className="grid grid-cols-2 gap-3 bg-white/[0.03] p-3 rounded-2xl border border-white/5 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Date</span>
                  <span className="font-bold text-white font-mono mt-0.5 block">{showDate}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Showtime</span>
                  <span className="font-bold text-cyan-400 font-mono text-sm mt-0.5 block">{showTime}</span>
                </div>
              </div>

              {/* Seats Info */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Reserved Seats</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {seatNumbers.map(s => (
                      <span key={s} className="px-2 py-0.5 rounded bg-cyan-400 text-black font-extrabold font-mono text-xs shadow-sm">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Amount Paid</span>
                  <span className="text-base font-extrabold text-white font-mono">₹{totalAmount}</span>
                </div>
              </div>

              {/* Perforated Divider */}
              <div className="relative py-2 flex items-center justify-between">
                <div className="w-4 h-8 rounded-r-full bg-[#08090d] -ml-5 border-r border-white/15" />
                <div className="flex-1 border-b-2 border-dashed border-white/15 mx-2" />
                <div className="w-4 h-8 rounded-l-full bg-[#08090d] -mr-5 border-l border-white/15" />
              </div>

              {/* QR Code Verification Section */}
              <div className="flex items-center gap-4 pt-1">
                <div className="p-2 rounded-xl bg-white shadow shrink-0">
                  {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="E-Ticket QR" className="w-20 h-20 object-contain" />
                  ) : (
                    <div className="w-20 h-20 bg-slate-200 flex items-center justify-center text-[9px] text-black">
                      QR CODE
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-1 text-xs">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Digitally Signed E-Pass</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono break-all">
                    TKT: {ticketId}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    BK: {bookingId}
                  </p>
                  <p className="text-[9px] text-slate-400 italic">
                    Present this QR at the cinema screen gate for entry check-in.
                  </p>
                </div>
              </div>

            </div>

          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2.5 no-print">
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                if (onGoToMyBookings) onGoToMyBookings();
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25 transition-all"
            >
              <span>View in My Tickets</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
