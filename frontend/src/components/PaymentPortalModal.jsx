import React, { useState, useEffect } from 'react';
import { X, QrCode, ShieldCheck, CheckCircle2, AlertCircle, Sparkles, Smartphone, Copy, Check, ArrowRight, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';

export default function PaymentPortalModal({
  booking,
  currentUser,
  onClose,
  onPaymentSuccess
}) {
  const [upiData, setUpiData] = useState(null);
  const [utrNumber, setUtrNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [showPartnerInfo, setShowPartnerInfo] = useState(false);

  useEffect(() => {
    if (!booking) return;

    const fetchHostUpiQr = async () => {
      try {
        setLoading(true);
        const res = await api.generateHostUpiQr(
          booking.bookingId,
          booking.totalAmount,
          booking.hostId
        );
        setUpiData(res);
      } catch (err) {
        setError(err.message || 'Error generating Host UPI QR payment portal');
      } finally {
        setLoading(false);
      }
    };

    fetchHostUpiQr();
  }, [booking]);

  if (!booking) return null;

  const handleCopyUpi = () => {
    if (upiData?.host?.upiId) {
      navigator.clipboard.writeText(upiData.host.upiId);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    }
  };

  const fireConfetti = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // Ignore if confetti not supported
    }
  };

  const handleCompletePayment = async (isSimulated = false) => {
    setProcessing(true);
    setError('');

    const finalUtr = isSimulated
      ? `UPI_SIM_${Date.now()}`
      : utrNumber.trim() || `UPI${Date.now()}`;

    try {
      const res = await api.confirmBooking(
        booking.bookingId,
        currentUser.userId,
        'HOST_UPI_QR',
        finalUtr
      );

      if (res.success) {
        fireConfetti();
        setTimeout(() => {
          onPaymentSuccess(res);
        }, 600);
      }
    } catch (err) {
      setError(err.message || 'Payment confirmation failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-md my-auto glass-panel rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                HOST DIRECT UPI
              </span>
              <span className="text-xs text-slate-400">Zero Commission</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-0.5">Payment Gateway</h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          
          {/* Amount Badge */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-purple-500/10 border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block uppercase font-medium">Payable Amount</span>
              <span className="text-2xl font-extrabold text-white font-mono">₹{booking.totalAmount}</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Booking Reference</span>
              <span className="text-xs font-mono text-cyan-300 font-bold">{booking.bookingId}</span>
            </div>
          </div>

          {/* QR Code Presentation */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 text-center space-y-3">
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-300">
              <QrCode className="w-4 h-4 text-cyan-400" />
              <span>Scan to Pay Directly to Host</span>
            </div>

            {loading ? (
              <div className="w-52 h-52 mx-auto bg-slate-900 rounded-2xl flex items-center justify-center text-xs text-slate-500">
                Generating Host UPI QR...
              </div>
            ) : upiData?.paymentDetails?.qrDataUrl ? (
              <div className="relative inline-block p-3 rounded-2xl bg-white shadow-2xl">
                <img
                  src={upiData.paymentDetails.qrDataUrl}
                  alt="Host UPI QR Code"
                  className="w-48 h-48 sm:w-52 sm:h-52 object-contain"
                />
              </div>
            ) : (
              <div className="py-8 text-xs text-red-400">Unable to load QR Code</div>
            )}

            {/* Host Details */}
            {upiData?.host && (
              <div className="space-y-1 pt-1">
                <p className="text-xs font-bold text-white">{upiData.host.hostName}</p>
                <div className="inline-flex items-center gap-2 bg-black/40 px-3 py-1 rounded-lg border border-white/10 text-xs font-mono text-emerald-400">
                  <span>{upiData.host.upiId}</span>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="p-1 hover:text-white transition-colors"
                    title="Copy UPI ID"
                  >
                    {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Verification input */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Enter UPI Ref / UTR Number (Optional for Demo)
              </label>
              <input
                type="text"
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                placeholder="e.g. 429019284102 or leave blank"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2 pt-1">
              {/* Primary Instant Verify Button */}
              <button
                type="button"
                disabled={processing}
                onClick={() => handleCompletePayment(true)}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {processing ? (
                  <span>Verifying Payment & Generating E-Ticket...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Instant UPI Payment Simulation (1-Click)</span>
                  </>
                )}
              </button>

              {/* Enter UTR Manual Submit */}
              {utrNumber && (
                <button
                  type="button"
                  disabled={processing}
                  onClick={() => handleCompletePayment(false)}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span>Verify Entered UTR: {utrNumber}</span>
                </button>
              )}
            </div>
          </div>

          {/* Pluggable Payment Partner Architecture Notice */}
          <div className="pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={() => setShowPartnerInfo(!showPartnerInfo)}
              className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
            >
              <span>ℹ️ Payment Partner Integration Details</span>
            </button>

            {showPartnerInfo && (
              <div className="mt-2 p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-slate-300 space-y-1.5 animate-in fade-in">
                <p className="font-semibold text-white">Pluggable Payment Gateway Architecture:</p>
                <p>
                  As requested, payments are currently configured in <strong>Host Direct UPI QR Mode</strong>.
                </p>
                <p className="text-slate-400">
                  When you are ready to attach a partner like <strong>Razorpay</strong> or <strong>Stripe</strong>, simply add:
                </p>
                <code className="block bg-black/50 p-2 rounded text-cyan-300 font-mono text-[10px]">
                  RAZORPAY_KEY_ID=your_key_id<br/>
                  RAZORPAY_KEY_SECRET=your_key_secret
                </code>
                <p className="text-slate-400 text-[10px]">
                  The backend adapter in <span className="text-slate-300">backend/services/PaymentService.js</span> will automatically activate the commercial gateway modal.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
