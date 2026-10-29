// Booking Model - Matches Class Diagram
class Booking {
  constructor({
    bookingId,
    userId,
    showId,
    movieId,
    movieTitle,
    theaterId,
    theaterName,
    screenName,
    hostId,
    showDate,
    showTime,
    seats = [],
    ticketCount,
    subtotal,
    convenienceFee = 30,
    tax = 18,
    totalAmount,
    status = 'PENDING', // 'PENDING' | 'CONFIRMED' | 'CANCELLED'
    paymentId = null,
    ticketId = null,
    bookingDate = new Date().toISOString()
  }) {
    this.bookingId = bookingId;
    this.userId = userId;
    this.showId = showId;
    this.movieId = movieId;
    this.movieTitle = movieTitle;
    this.theaterId = theaterId;
    this.theaterName = theaterName;
    this.screenName = screenName;
    this.hostId = hostId;
    this.showDate = showDate;
    this.showTime = showTime;
    this.seats = seats;
    this.ticketCount = ticketCount || seats.length;
    this.subtotal = Number(subtotal || seats.reduce((acc, s) => acc + (s.price || 0), 0));
    this.convenienceFee = Number(convenienceFee);
    this.tax = Number(tax);
    this.totalAmount = Number(totalAmount || (this.subtotal + this.convenienceFee + this.tax));
    this.status = status;
    this.paymentId = paymentId;
    this.ticketId = ticketId;
    this.bookingDate = bookingDate;
  }

  // + confirmBooking() : void
  confirmBooking(paymentId, ticketId) {
    this.status = 'CONFIRMED';
    this.paymentId = paymentId;
    this.ticketId = ticketId;
  }

  // + cancelBooking() : void
  cancelBooking() {
    this.status = 'CANCELLED';
  }

  // + getBookingDetails() : void
  getBookingDetails() {
    return {
      bookingId: this.bookingId,
      userId: this.userId,
      showId: this.showId,
      movieTitle: this.movieTitle,
      theaterName: this.theaterName,
      screenName: this.screenName,
      showDate: this.showDate,
      showTime: this.showTime,
      seats: this.seats,
      ticketCount: this.ticketCount,
      subtotal: this.subtotal,
      convenienceFee: this.convenienceFee,
      tax: this.tax,
      totalAmount: this.totalAmount,
      status: this.status,
      paymentId: this.paymentId,
      ticketId: this.ticketId,
      bookingDate: this.bookingDate
    };
  }
}

module.exports = Booking;
