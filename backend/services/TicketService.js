const QRCode = require('qrcode');
const db = require('../data/db');
const Ticket = require('../models/Ticket');

class TicketService {
  /**
   * Generate an E-Ticket with verifiable QR code image
   */
  async generateTicket({ booking, show, movie, theater, user }) {
    const ticketId = `tkt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const seatNumbers = booking.seats.map(s => s.seatNumber);
    const seatString = seatNumbers.join(', ');

    // Verification signature/string
    const verificationPayload = JSON.stringify({
      tkt: ticketId,
      bk: booking?.bookingId,
      sh: show?.showId,
      mov: movie?.title || booking?.movieTitle || 'Movie Ticket',
      th: theater?.name || booking?.theaterName || 'Cinema Theater',
      scr: show?.screenName || booking?.screenName || 'Screen 1',
      date: show?.date || booking?.showDate,
      time: show?.time || booking?.showTime,
      seats: seatNumbers,
      user: user?.name || user?.email || 'Customer',
      v: '1.0'
    });

    // Generate QR code Data URL (PNG)
    const qrDataUrl = await QRCode.toDataURL(verificationPayload, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 250,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });

    const ticket = new Ticket({
      ticketId,
      bookingId: booking.bookingId,
      showId: show.showId,
      userId: booking.userId,
      QRCode: qrDataUrl,
      seatNo: seatString,
      seatNumbers,
      price: booking.totalAmount,
      movieTitle: movie.title,
      theaterName: theater.name,
      screenName: show.screenName,
      showDate: show.date,
      showTime: show.time,
      status: 'VALID',
      generatedAt: new Date().toISOString()
    });

    db.insert('tickets', ticket.getTicketDetails());

    return ticket.getTicketDetails();
  }

  /**
   * Validate or Check-in ticket at the theater gate (Host Ticket Scanner feature)
   */
  scanAndVerifyTicket(query) {
    const tickets = db.get('tickets');
    let ticket = null;

    // Check by ticketId
    ticket = tickets.find(t => t.ticketId === query);

    // Or parse QR JSON string
    if (!ticket) {
      try {
        const parsed = JSON.parse(query);
        if (parsed.tkt) {
          ticket = tickets.find(t => t.ticketId === parsed.tkt);
        }
      } catch {
        // Not a JSON string, try search by bookingId
        ticket = tickets.find(t => t.bookingId === query);
      }
    }

    if (!ticket) {
      return {
        valid: false,
        message: 'Invalid or non-existent ticket.'
      };
    }

    if (ticket.status === 'CANCELLED') {
      return {
        valid: false,
        ticket,
        message: 'This ticket was CANCELLED by the user or administrator.'
      };
    }

    if (ticket.status === 'CHECKED_IN') {
      return {
        valid: false,
        alreadyUsed: true,
        ticket,
        message: `Ticket already used / checked in at ${new Date(ticket.checkedInAt).toLocaleTimeString()}.`
      };
    }

    // Mark as checked in
    const updated = db.update('tickets', t => t.ticketId === ticket.ticketId, t => ({
      ...t,
      status: 'CHECKED_IN',
      checkedInAt: new Date().toISOString()
    }));

    return {
      valid: true,
      message: 'Ticket verified successfully! Welcome to the screening.',
      ticket: updated
    };
  }

  getTicketById(ticketId) {
    const tickets = db.get('tickets');
    return tickets.find(t => t.ticketId === ticketId);
  }

  cancelTicket(ticketId) {
    return db.update('tickets', t => t.ticketId === ticketId, t => ({
      ...t,
      status: 'CANCELLED'
    }));
  }
}

module.exports = new TicketService();
