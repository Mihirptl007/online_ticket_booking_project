// Ticket Model - Matches Class Diagram
class Ticket {
  constructor({
    ticketId,
    bookingId,
    showId,
    userId,
    QRCode = '',
    seatNo = '',
    seatNumbers = [],
    price = 0,
    movieTitle = '',
    theaterName = '',
    screenName = '',
    showDate = '',
    showTime = '',
    status = 'VALID', // 'VALID' | 'CHECKED_IN' | 'CANCELLED'
    generatedAt = new Date().toISOString(),
    checkedInAt = null
  }) {
    this.ticketId = ticketId;
    this.bookingId = bookingId;
    this.showId = showId;
    this.userId = userId;
    this.QRCode = QRCode;
    this.seatNo = seatNo || (Array.isArray(seatNumbers) ? seatNumbers.join(', ') : '');
    this.seatNumbers = Array.isArray(seatNumbers) ? seatNumbers : [seatNo];
    this.price = Number(price);
    this.movieTitle = movieTitle;
    this.theaterName = theaterName;
    this.screenName = screenName;
    this.showDate = showDate;
    this.showTime = showTime;
    this.status = status;
    this.generatedAt = generatedAt;
    this.checkedInAt = checkedInAt;
  }

  // + generate() : void
  generate(qrPayload) {
    this.QRCode = qrPayload;
    this.status = 'VALID';
    this.generatedAt = new Date().toISOString();
  }

  // + cancel() : void
  cancel() {
    this.status = 'CANCELLED';
  }

  // + getTicketDetails() : void
  getTicketDetails() {
    return {
      ticketId: this.ticketId,
      bookingId: this.bookingId,
      showId: this.showId,
      userId: this.userId,
      movieTitle: this.movieTitle,
      theaterName: this.theaterName,
      screenName: this.screenName,
      showDate: this.showDate,
      showTime: this.showTime,
      seatNo: this.seatNo,
      seatNumbers: this.seatNumbers,
      price: this.price,
      QRCode: this.QRCode,
      status: this.status,
      generatedAt: this.generatedAt,
      checkedInAt: this.checkedInAt
    };
  }
}

module.exports = Ticket;
