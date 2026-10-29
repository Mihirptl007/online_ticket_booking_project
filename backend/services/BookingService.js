const db = require('../data/db');
const Booking = require('../models/Booking');
const showAndSeatService = require('./ShowAndSeatService');
const paymentService = require('./PaymentService');
const ticketService = require('./TicketService');

class BookingService {
  /**
   * Create temporary booking and hold seats
   */
  async createPendingBooking({ userId, showId, seatNumbers }) {
    if (!seatNumbers || !seatNumbers.length) {
      throw new Error('At least one seat must be selected');
    }

    const show = db.get('shows').find(s => s.showId === showId);
    if (!show) {
      throw new Error('Show not found');
    }

    const movie = db.get('movies').find(m => m.movieId === show.movieId) || { title: 'Unknown Movie' };
    const theater = db.get('theaters').find(t => t.theaterId === show.theaterId) || { name: 'Unknown Theater' };

    // 1. Hold seats
    const holdResult = showAndSeatService.holdSeats(showId, seatNumbers, userId, 10);
    if (!holdResult.success) {
      return {
        success: false,
        message: holdResult.message,
        unavailableSeats: holdResult.unavailableSeats
      };
    }

    // 2. Fetch seat details with tier pricing
    const seatsData = showAndSeatService.getSeatsForShow(showId);
    const selectedSeatObjects = seatsData.seats
      .filter(s => seatNumbers.includes(s.seatNumber))
      .map(s => ({
        seatNumber: s.seatNumber,
        row: s.row,
        col: s.col,
        type: s.type,
        price: s.price
      }));

    const subtotal = selectedSeatObjects.reduce((sum, s) => sum + s.price, 0);
    const convenienceFee = Math.round(seatNumbers.length * 25);
    const tax = Math.round((subtotal + convenienceFee) * 0.18);
    const totalAmount = subtotal + convenienceFee + tax;

    const bookingId = `bk_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const booking = new Booking({
      bookingId,
      userId,
      showId,
      movieId: show.movieId,
      movieTitle: movie.title,
      theaterId: show.theaterId,
      theaterName: theater.name,
      screenName: show.screenName,
      hostId: show.hostId,
      showDate: show.date,
      showTime: show.time,
      seats: selectedSeatObjects,
      ticketCount: selectedSeatObjects.length,
      subtotal,
      convenienceFee,
      tax,
      totalAmount,
      status: 'PENDING',
      bookingDate: new Date().toISOString()
    });

    db.insert('bookings', booking.getBookingDetails());

    return {
      success: true,
      booking: booking.getBookingDetails(),
      holdExpiresAt: holdResult.expiresAt,
      holdExpiresInSeconds: holdResult.expiresInSeconds
    };
  }

  /**
   * Complete payment and confirm booking + generate ticket
   */
  async confirmBookingPayment({ bookingId, userId, paymentMethod = 'HOST_UPI_QR', utrNumber = '' }) {
    const bookingData = db.get('bookings').find(b => b.bookingId === bookingId);
    if (!bookingData) {
      throw new Error('Booking record not found');
    }

    if (bookingData.status === 'CONFIRMED') {
      return {
        success: true,
        alreadyConfirmed: true,
        booking: bookingData
      };
    }

    const show = db.get('shows').find(s => s.showId === bookingData.showId) || {
      showId: bookingData.showId,
      movieId: bookingData.movieId,
      theaterId: bookingData.theaterId,
      screenName: bookingData.screenName || 'Screen 1',
      date: bookingData.showDate || new Date().toISOString().split('T')[0],
      time: bookingData.showTime || '18:00'
    };
    const movie = db.get('movies').find(m => m.movieId === bookingData.movieId) || { title: bookingData.movieTitle || 'Movie' };
    const theater = db.get('theaters').find(t => t.theaterId === bookingData.theaterId) || { name: bookingData.theaterName || 'Theater' };
    const user = db.get('users').find(u => u.userId === userId) || { name: 'Customer', email: 'guest@eticket.com' };

    // 1. Process payment
    const paymentResult = await paymentService.processPayment({
      bookingId,
      amount: bookingData.totalAmount,
      hostId: bookingData.hostId,
      method: paymentMethod,
      utrNumber
    });

    // 2. Permanently book seats
    const seatNumbers = bookingData.seats.map(s => s.seatNumber);
    showAndSeatService.confirmSeatBooking(bookingData.showId, seatNumbers, userId, bookingId);

    // 3. Generate E-ticket
    const ticket = await ticketService.generateTicket({
      booking: bookingData,
      show,
      movie,
      theater,
      user
    });

    // 4. Update booking to CONFIRMED
    const updatedBooking = db.update(
      'bookings',
      b => b.bookingId === bookingId,
      b => ({
        ...b,
        status: 'CONFIRMED',
        paymentId: paymentResult.paymentId,
        ticketId: ticket.ticketId,
        confirmedAt: new Date().toISOString()
      })
    );

    return {
      success: true,
      booking: updatedBooking,
      payment: paymentResult.payment,
      ticket
    };
  }

  /**
   * Cancel booking & release seats
   */
  async cancelBooking(bookingId, cancelledByUserId, role = 'user') {
    const booking = db.get('bookings').find(b => b.bookingId === bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    if (role === 'user' && booking.userId !== cancelledByUserId) {
      throw new Error('Unauthorized to cancel this booking');
    }

    if (booking.status === 'CANCELLED') {
      return { success: true, message: 'Booking is already cancelled' };
    }

    // 1. Release seats
    const seatLocks = db.get('seatLocks');
    const seatNumbers = booking.seats.map(s => s.seatNumber);
    const updatedLocks = seatLocks.filter(
      l => !(l.showId === booking.showId && seatNumbers.includes(l.seatNumber))
    );
    db.set('seatLocks', updatedLocks);

    // 2. Refund payment if exists
    if (booking.paymentId) {
      paymentService.refundPayment(booking.paymentId);
    }

    // 3. Cancel ticket if exists
    if (booking.ticketId) {
      ticketService.cancelTicket(booking.ticketId);
    }

    // 4. Update booking
    const updatedBooking = db.update('bookings', b => b.bookingId === bookingId, b => ({
      ...b,
      status: 'CANCELLED',
      cancelledAt: new Date().toISOString(),
      cancelledBy: cancelledByUserId
    }));

    return {
      success: true,
      message: 'Booking cancelled and seats released successfully',
      booking: updatedBooking
    };
  }

  getUserBookings(userId) {
    const bookings = db.get('bookings').filter(b => b.userId === userId);
    return bookings.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));
  }

  getHostBookings(hostId) {
    const bookings = db.get('bookings').filter(b => b.hostId === hostId);
    return bookings.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));
  }

  getAllBookings() {
    const bookings = db.get('bookings');
    return bookings.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));
  }
}

module.exports = new BookingService();
