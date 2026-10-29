const paymentService = require('../services/PaymentService');
const bookingService = require('../services/BookingService');
const db = require('../data/db');

class PaymentController {
  async generateHostUpiQr(req, res) {
    try {
      const { bookingId, amount, hostId } = req.body;

      if (!bookingId || !amount) {
        return res.status(400).json({ error: 'bookingId and amount are required' });
      }

      // If hostId is not provided, look it up from the booking
      let targetHostId = hostId;
      if (!targetHostId) {
        const booking = db.get('bookings').find(b => b.bookingId === bookingId);
        if (booking) {
          targetHostId = booking.hostId;
        }
      }

      const result = await paymentService.generateHostUpiQr({
        bookingId,
        amount: Number(amount),
        hostId: targetHostId || 'usr_host_1'
      });

      return res.json({
        success: true,
        ...result
      });
    } catch (err) {
      console.error('Error generating UPI QR:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  async verifyAndConfirm(req, res) {
    try {
      const { bookingId, userId, utrNumber, paymentMethod } = req.body;

      if (!bookingId || !userId) {
        return res.status(400).json({ error: 'bookingId and userId are required' });
      }

      const result = await bookingService.confirmBookingPayment({
        bookingId,
        userId,
        paymentMethod: paymentMethod || 'HOST_UPI_QR',
        utrNumber: utrNumber || `UPI${Date.now()}`
      });

      return res.json(result);
    } catch (err) {
      console.error('Error verifying payment:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  getGatewayInfo(req, res) {
    try {
      return res.json({
        success: true,
        gateway: {
          currentMode: 'HOST_UPI_QR',
          description: 'Payment is directly routed to the event host UPI ID via dynamic QR code.',
          pluggablePartners: [
            {
              name: 'Razorpay',
              status: 'READY_TO_ATTACH',
              requiredKeys: ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'],
              documentation: 'Set these keys in backend/.env to activate Razorpay checkout modal.'
            },
            {
              name: 'Stripe',
              status: 'READY_TO_ATTACH',
              requiredKeys: ['STRIPE_PUBLISHABLE_KEY', 'STRIPE_SECRET_KEY'],
              documentation: 'Set these keys in backend/.env to activate Stripe Elements.'
            }
          ]
        }
      });
    } catch (err) {
      console.error('Error fetching gateway info:', err);
      return res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new PaymentController();
