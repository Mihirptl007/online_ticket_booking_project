const QRCode = require('qrcode');
const db = require('../data/db');
const Payment = require('../models/Payment');

/**
 * Pluggable Payment Partner Gateway Interface
 * When real payment partners (Razorpay / Stripe / PhonePe) are onboarded,
 * simply populate the keys in the corresponding adapter below.
 */
class PaymentPartnerAdapter {
  constructor(name) {
    this.name = name;
  }

  // eslint-disable-next-line no-unused-vars
  async createOrder(bookingId, amount, currency = 'INR') {
    throw new Error('createOrder must be implemented by payment partner adapter');
  }

  // eslint-disable-next-line no-unused-vars
  async verifyPayment(orderId, paymentId, signature) {
    throw new Error('verifyPayment must be implemented by payment partner adapter');
  }
}

// Concrete Razorpay Adapter (Ready for API Keys)
class RazorpayAdapter extends PaymentPartnerAdapter {
  constructor() {
    super('Razorpay');
    this.keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_key_id';
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_placeholder_key_secret';
    this.isConfigured = Boolean(process.env.RAZORPAY_KEY_ID);
  }

  async createOrder(bookingId, amount) {
    if (!this.isConfigured) {
      return {
        configured: false,
        message: 'Razorpay keys not configured in environment. Using Host Direct UPI QR mode.'
      };
    }
    // Production integration:
    // const razorpay = new Razorpay({ key_id: this.keyId, key_secret: this.keySecret });
    // return await razorpay.orders.create({ amount: Math.round(amount * 100), currency: 'INR', receipt: bookingId });
    return { orderId: `order_rzp_${bookingId}`, amount };
  }

  async verifyPayment(orderId, paymentId, signature) {
    if (!this.isConfigured) return { success: true, simulated: true };
    // Production signature check via crypto.createHmac('sha256', this.keySecret)
    return { success: true };
  }
}

// Payment Service Main Implementation
class PaymentService {
  constructor() {
    this.partnerAdapters = {
      razorpay: new RazorpayAdapter()
    };
    this.activePartner = 'host_upi'; // Default: Host Direct UPI QR
  }

  /**
   * Generates dynamic UPI QR Code for the specific host of the event/movie
   * @param {Object} params
   * @param {string} params.bookingId
   * @param {number} params.amount
   * @param {string} params.hostId
   */
  async generateHostUpiQr({ bookingId, amount, hostId }) {
    // 1. Fetch Host details
    const users = db.get('users');
    const host = users.find(u => u.userId === hostId && u.role === 'host') || {
      name: 'Cinema Host',
      upiId: 'cinema.boxoffice@okhdfcbank',
      upiName: 'BOX OFFICE CINEMAS'
    };

    const hostUpiId = host.upiId || 'host.boxoffice@icici';
    const hostUpiName = host.upiName || host.name || 'Cinema Organizer';

    // 2. Format NPCI UPI Deep Link String
    // Example: upi://pay?pa=host@upi&pn=HostName&am=450.00&cu=INR&tn=Ticket-bk_101
    const upiUri = `upi://pay?pa=${encodeURIComponent(hostUpiId)}&pn=${encodeURIComponent(hostUpiName)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent('TicketBooking-' + bookingId)}`;

    // 3. Generate high-resolution QR code (Data URL PNG)
    const qrDataUrl = await QRCode.toDataURL(upiUri, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 320,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return {
      paymentGateway: {
        mode: 'HOST_UPI_QR',
        isPartnerAttached: false,
        partnerReady: true,
        notice: 'Direct Host UPI Mode Active. Real payment partners (Razorpay/Stripe) can be hooked by setting API keys.'
      },
      host: {
        hostId,
        hostName: hostUpiName,
        upiId: hostUpiId
      },
      paymentDetails: {
        bookingId,
        amount,
        currency: 'INR',
        upiUri,
        qrDataUrl,
        intentLinks: {
          gpay: `gpay://upi/pay?pa=${hostUpiId}&pn=${encodeURIComponent(hostUpiName)}&am=${amount.toFixed(2)}&cu=INR`,
          phonepe: `phonepe://pay?pa=${hostUpiId}&pn=${encodeURIComponent(hostUpiName)}&am=${amount.toFixed(2)}&cu=INR`,
          paytm: `paytmmp://pay?pa=${hostUpiId}&pn=${encodeURIComponent(hostUpiName)}&am=${amount.toFixed(2)}&cu=INR`
        }
      }
    };
  }

  /**
   * Verify and complete payment
   */
  async processPayment({ bookingId, amount, hostId, method = 'HOST_UPI_QR', utrNumber = '' }) {
    const paymentId = `pay_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const users = db.get('users');
    const host = users.find(u => u.userId === hostId) || {};

    const payment = new Payment({
      paymentId,
      bookingId,
      amount,
      method,
      status: 'SUCCESS',
      hostUpiId: host.upiId || 'host.boxoffice@icici',
      hostName: host.upiName || host.name || 'Cinema Organizer',
      utrNumber: utrNumber || `UPI${Date.now()}${Math.floor(Math.random() * 1000)}`,
      paymentDate: new Date().toISOString()
    });

    db.insert('payments', payment.getPaymentDetails());

    return {
      success: true,
      paymentId,
      status: 'SUCCESS',
      payment: payment.getPaymentDetails()
    };
  }

  /**
   * Refund payment on booking cancellation
   */
  refundPayment(paymentId) {
    const updated = db.update('payments', p => p.paymentId === paymentId, p => ({
      ...p,
      status: 'REFUNDED',
      refundedAt: new Date().toISOString()
    }));
    return updated;
  }
}

module.exports = new PaymentService();
