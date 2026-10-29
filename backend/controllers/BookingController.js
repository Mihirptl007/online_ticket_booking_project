const bookingService = require('../services/BookingService');

class BookingController {
  async holdAndCreateBooking(req, res) {
    try {
      const { userId, showId, seatNumbers } = req.body;

      if (!userId || !showId || !seatNumbers || !seatNumbers.length) {
        return res.status(400).json({ error: 'userId, showId, and at least one seat number are required' });
      }

      const result = await bookingService.createPendingBooking({
        userId,
        showId,
        seatNumbers
      });

      if (!result.success) {
        return res.status(409).json({
          error: result.message,
          unavailableSeats: result.unavailableSeats
        });
      }

      return res.status(201).json(result);
    } catch (err) {
      console.error('Error in holdAndCreateBooking:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  async confirmBooking(req, res) {
    try {
      const { bookingId, userId, paymentMethod, utrNumber } = req.body;

      if (!bookingId || !userId) {
        return res.status(400).json({ error: 'bookingId and userId are required' });
      }

      const result = await bookingService.confirmBookingPayment({
        bookingId,
        userId,
        paymentMethod: paymentMethod || 'HOST_UPI_QR',
        utrNumber
      });

      return res.json(result);
    } catch (err) {
      console.error('Error confirming booking:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  async cancelBooking(req, res) {
    try {
      const { bookingId } = req.params;
      const { userId, role } = req.body;

      const result = await bookingService.cancelBooking(bookingId, userId, role || 'user');
      return res.json(result);
    } catch (err) {
      console.error('Error cancelling booking:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  getUserBookings(req, res) {
    try {
      const { userId } = req.params;
      const bookings = bookingService.getUserBookings(userId);
      return res.json({ success: true, count: bookings.length, bookings });
    } catch (err) {
      console.error('Error fetching user bookings:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  getHostBookings(req, res) {
    try {
      const { hostId } = req.params;
      const bookings = bookingService.getHostBookings(hostId);
      return res.json({ success: true, count: bookings.length, bookings });
    } catch (err) {
      console.error('Error fetching host bookings:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  getAllBookings(req, res) {
    try {
      const bookings = bookingService.getAllBookings();
      return res.json({ success: true, count: bookings.length, bookings });
    } catch (err) {
      console.error('Error fetching all bookings:', err);
      return res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new BookingController();
