/**
 * ==============================================================================
 * NOVELLA E-TICKET MANAGEMENT SYSTEM - COMPREHENSIVE UNIT TEST SUITE
 * ==============================================================================
 * Test Framework : Node.js Built-in Test Runner (node:test + node:assert/strict)
 * Target Modules : backend/models/*, backend/services/*
 * ==============================================================================
 */

const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

// Import Models
const User = require('../backend/models/User');
const Movie = require('../backend/models/Movie');
const Theater = require('../backend/models/Theater');
const Show = require('../backend/models/Show');
const Seat = require('../backend/models/Seat');
const Booking = require('../backend/models/Booking');
const Payment = require('../backend/models/Payment');
const Ticket = require('../backend/models/Ticket');

// Import Services
const showAndSeatService = require('../backend/services/ShowAndSeatService');
const paymentService = require('../backend/services/PaymentService');
const ticketService = require('../backend/services/TicketService');

// Import Database for mocking/isolating if needed
const db = require('../backend/data/db');

describe('--- [UNIT TEST SUITE 1: MODELS] ---', () => {

  describe('1.1 User Model', () => {
    it('UT-USR-01: should instantiate user with active status and default role', () => {
      const user = new User({
        userId: 'usr_test_1',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      });

      assert.equal(user.userId, 'usr_test_1');
      assert.equal(user.name, 'John Doe');
      assert.equal(user.email, 'john@example.com');
      assert.equal(user.role, 'user');
      assert.equal(user.status, 'active');
      assert.ok(user.createdAt);
    });

    it('UT-USR-02: should successfully authenticate with correct password', () => {
      const user = new User({
        userId: 'usr_test_1',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'correct_password'
      });

      const result = user.login('correct_password');
      assert.equal(result.success, true);
      assert.equal(result.message, 'Login successful');
    });

    it('UT-USR-03: should reject authentication with wrong password', () => {
      const user = new User({
        userId: 'usr_test_1',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'correct_password'
      });

      const result = user.login('wrong_password');
      assert.equal(result.success, false);
      assert.equal(result.message, 'Invalid email or password');
    });

    it('UT-USR-04: should reject authentication when account is blocked', () => {
      const user = new User({
        userId: 'usr_test_blocked',
        name: 'Blocked User',
        email: 'blocked@example.com',
        password: 'any_password',
        status: 'blocked'
      });

      const result = user.login('any_password');
      assert.equal(result.success, false);
      assert.match(result.message, /Account is blocked/i);
    });

    it('UT-USR-05: should generate pending booking payload via bookTicket()', () => {
      const user = new User({ userId: 'usr_100', name: 'Alice' });
      const bookingPayload = user.bookTicket('sh_500', ['A1', 'A2'], 900);

      assert.equal(bookingPayload.userId, 'usr_100');
      assert.equal(bookingPayload.showId, 'sh_500');
      assert.deepEqual(bookingPayload.seats, ['A1', 'A2']);
      assert.equal(bookingPayload.totalAmount, 900);
      assert.equal(bookingPayload.status, 'PENDING');
    });

    it('UT-USR-06: should sanitize user data in toSafeObject() without exposing password', () => {
      const user = new User({
        userId: 'usr_secret',
        name: 'Secret Agent',
        email: 'agent@mi6.gov',
        password: 'super_secret_cleartext_password',
        role: 'admin'
      });

      const safe = user.toSafeObject();
      assert.equal(safe.userId, 'usr_secret');
      assert.equal(safe.email, 'agent@mi6.gov');
      assert.equal(safe.role, 'admin');
      assert.equal(safe.password, undefined);
    });
  });

  describe('1.2 Movie Model', () => {
    it('UT-MOV-01: should parse duration, format hours and minutes correctly', () => {
      const movie = new Movie({
        movieId: 'mov_99',
        title: 'Quantum Realm',
        genre: 'Sci-Fi',
        duration: 155, // 2h 35m
        language: 'English',
        rating: '8.7',
        cast: ['Actor One', 'Actor Two'],
        formats: ['IMAX 3D', '4DX']
      });

      const details = movie.getDetails();
      assert.equal(details.movieId, 'mov_99');
      assert.equal(details.duration, '2h 35m');
      assert.equal(details.durationMinutes, 155);
      assert.deepEqual(details.formats, ['IMAX 3D', '4DX']);
      assert.deepEqual(details.cast, ['Actor One', 'Actor Two']);
    });

    it('UT-MOV-02: should filter associated shows by movieId', () => {
      const movie = new Movie({ movieId: 'mov_target', title: 'Target Movie', duration: 120 });
      const allShows = [
        { showId: 'sh_1', movieId: 'mov_target' },
        { showId: 'sh_2', movieId: 'mov_other' },
        { showId: 'sh_3', movieId: 'mov_target' }
      ];

      const matchingShows = movie.getShows(allShows);
      assert.equal(matchingShows.length, 2);
      assert.deepEqual(matchingShows.map(s => s.showId), ['sh_1', 'sh_3']);
    });
  });

  describe('1.3 Theater Model', () => {
    it('UT-THT-01: should initialize theater details and filter shows by theaterId', () => {
      const theater = new Theater({
        theaterId: 'th_inox',
        name: 'INOX Megaplex',
        location: 'Downtown Mall',
        city: 'Mumbai',
        totalScreens: 3,
        screens: [{ screenId: 'sc_1', name: 'Audi 1' }],
        amenities: ['Dolby Atmos', 'Recliner']
      });

      const details = theater.getTheaterDetails();
      assert.equal(details.theaterId, 'th_inox');
      assert.equal(details.name, 'INOX Megaplex');
      assert.equal(details.totalScreens, 3);
      assert.equal(details.amenities.length, 2);

      const allShows = [
        { showId: 's_1', theaterId: 'th_inox' },
        { showId: 's_2', theaterId: 'th_pvr' },
        { showId: 's_3', theaterId: 'th_inox' }
      ];
      assert.equal(theater.getShows(allShows).length, 2);
    });
  });

  describe('1.4 Show Model', () => {
    it('UT-SHW-01: should compute default tier pricing ratios when not explicitly passed', () => {
      const show = new Show({
        showId: 'sh_101',
        movieId: 'mov_1',
        theaterId: 'th_1',
        date: '2026-11-01',
        time: '18:00',
        price: 400,
        tierPricing: null // force default fallback calculation
      });

      // Default tier calculation: Silver 75% (300), Gold 100% (400), VIP 150% (600)
      assert.equal(show.tierPricing.gold, 400);
      assert.equal(show.tierPricing.silver, 300);
      assert.equal(show.tierPricing.vip, 600);
    });

    it('UT-SHW-02: should accurately check seat availability against booked/held locks', () => {
      const show = new Show({ showId: 'sh_avail', price: 300 });
      const locks = [
        { showId: 'sh_avail', seatNumber: 'A1' },
        { showId: 'sh_avail', seatNumber: 'B2' }
      ];

      assert.equal(show.isSeatAvailable('A1', locks), false);
      assert.equal(show.isSeatAvailable('B2', locks), false);
      assert.equal(show.isSeatAvailable('C3', locks), true);
    });
  });

  describe('1.5 Seat Model', () => {
    it('UT-SET-01: should reserve available seat with TTL hold timestamp', () => {
      const seat = new Seat({
        seatId: 'sh_1_A1',
        showId: 'sh_1',
        seatNumber: 'A1',
        price: 450,
        isAvailable: true
      });

      const reserved = seat.reserveSeat('usr_tester', 10);
      assert.equal(reserved, true);
      assert.equal(seat.isAvailable, false);
      assert.equal(seat.heldByUserId, 'usr_tester');
      assert.ok(seat.heldUntil);
      assert.equal(seat.isHeldExpired(), false);
    });

    it('UT-SET-02: should refuse reservation if already reserved and not expired', () => {
      const future = new Date(Date.now() + 5 * 60 * 1000).toISOString();
      const seat = new Seat({
        seatId: 'sh_1_B2',
        showId: 'sh_1',
        seatNumber: 'B2',
        isAvailable: false,
        heldUntil: future,
        heldByUserId: 'usr_first'
      });

      const reservedAgain = seat.reserveSeat('usr_second', 10);
      assert.equal(reservedAgain, false);
      assert.equal(seat.heldByUserId, 'usr_first');
    });

    it('UT-SET-03: should release seat and restore availability', () => {
      const seat = new Seat({
        seatId: 'sh_1_C3',
        seatNumber: 'C3',
        isAvailable: false,
        heldUntil: new Date().toISOString(),
        heldByUserId: 'usr_temp'
      });

      seat.releaseSeat();
      assert.equal(seat.isAvailable, true);
      assert.equal(seat.heldUntil, null);
      assert.equal(seat.heldByUserId, null);
    });
  });

  describe('1.6 Booking Model', () => {
    it('UT-BKG-01: should calculate subtotal, convenience fee, tax, and total amount correctly', () => {
      const seats = [
        { seatNumber: 'A1', price: 500 },
        { seatNumber: 'A2', price: 500 }
      ];

      const booking = new Booking({
        bookingId: 'bk_calc_test',
        userId: 'usr_1',
        showId: 'sh_1',
        seats,
        convenienceFee: 50,
        tax: 27
      });

      assert.equal(booking.subtotal, 1000);
      assert.equal(booking.convenienceFee, 50);
      assert.equal(booking.tax, 27);
      assert.equal(booking.totalAmount, 1077);
      assert.equal(booking.status, 'PENDING');
    });

    it('UT-BKG-02: should transition status to CONFIRMED with paymentId and ticketId', () => {
      const booking = new Booking({
        bookingId: 'bk_conf_test',
        userId: 'usr_1',
        showId: 'sh_1',
        totalAmount: 500
      });

      booking.confirmBooking('pay_999', 'tkt_888');
      assert.equal(booking.status, 'CONFIRMED');
      assert.equal(booking.paymentId, 'pay_999');
      assert.equal(booking.ticketId, 'tkt_888');
    });

    it('UT-BKG-03: should transition status to CANCELLED on cancellation', () => {
      const booking = new Booking({ bookingId: 'bk_canc_test', status: 'CONFIRMED' });
      booking.cancelBooking();
      assert.equal(booking.status, 'CANCELLED');
    });
  });

  describe('1.7 Payment Model', () => {
    it('UT-PAY-01: should initialize with PENDING status and record successful payment', () => {
      const payment = new Payment({
        paymentId: 'pay_init',
        bookingId: 'bk_1',
        amount: 600,
        hostUpiId: 'host@okhdfcbank'
      });

      assert.equal(payment.status, 'PENDING');
      const paid = payment.pay({ utrNumber: 'UTR_TEST_123456' });
      assert.equal(paid, true);
      assert.equal(payment.status, 'SUCCESS');
      assert.equal(payment.utrNumber, 'UTR_TEST_123456');
    });

    it('UT-PAY-02: should support refund transition to REFUNDED', () => {
      const payment = new Payment({ paymentId: 'pay_ref', status: 'SUCCESS' });
      payment.refund();
      assert.equal(payment.status, 'REFUNDED');
    });
  });

  describe('1.8 Ticket Model', () => {
    it('UT-TKT-01: should initialize with VALID status and format seat numbers string', () => {
      const ticket = new Ticket({
        ticketId: 'tkt_init',
        bookingId: 'bk_10',
        showId: 'sh_5',
        seatNumbers: ['D4', 'D5'],
        price: 700,
        movieTitle: 'Inception'
      });

      assert.equal(ticket.status, 'VALID');
      assert.equal(ticket.seatNo, 'D4, D5');
      assert.deepEqual(ticket.seatNumbers, ['D4', 'D5']);
    });

    it('UT-TKT-02: should transition to CANCELLED on cancel()', () => {
      const ticket = new Ticket({ ticketId: 'tkt_canc', status: 'VALID' });
      ticket.cancel();
      assert.equal(ticket.status, 'CANCELLED');
    });
  });
});

describe('--- [UNIT TEST SUITE 2: SERVICES] ---', () => {

  describe('2.1 ShowAndSeatService', () => {
    it('UT-SRV-01: should generate an 8x8 matrix (64 seats) with appropriate tier pricing', () => {
      const shows = db.get('shows');
      assert.ok(shows.length > 0, 'Seed shows must be available');
      const testShow = shows[0];

      const result = showAndSeatService.getSeatsForShow(testShow.showId);
      assert.equal(result.totalSeats, 64);
      assert.equal(result.seats.length, 64);

      // Check tier distribution
      const vipSeats = result.seats.filter(s => s.type === 'VIP');
      const goldSeats = result.seats.filter(s => s.type === 'Gold');
      const silverSeats = result.seats.filter(s => s.type === 'Silver');

      assert.equal(vipSeats.length, 16); // Rows A, B (2 * 8 = 16)
      assert.equal(goldSeats.length, 24); // Rows C, D, E (3 * 8 = 24)
      assert.equal(silverSeats.length, 24); // Rows F, G, H (3 * 8 = 24)
    });

    it('UT-SRV-02: should detect unavailable seats and return appropriate reasons', () => {
      const shows = db.get('shows');
      const testShow = shows[0];

      // Ensure clean state for test seats
      const currentLocks = db.get('seatLocks');
      db.set('seatLocks', currentLocks.filter(l => !['G1', 'G2'].includes(l.seatNumber)));

      try {
        // Hold a seat first
        const holdResult = showAndSeatService.holdSeats(testShow.showId, ['G1'], 'usr_holder_unit', 5);
        assert.equal(holdResult.success, true);

        // Check availability on held seat
        const checkResult = showAndSeatService.checkSeatAvailability(testShow.showId, ['G1', 'G2']);
        assert.equal(checkResult.isAvailable, false);
        assert.equal(checkResult.unavailableSeats.length, 1);
        assert.equal(checkResult.unavailableSeats[0].seatNumber, 'G1');
      } finally {
        // Cleanup
        showAndSeatService.releaseSeats(testShow.showId, ['G1'], 'usr_holder_unit');
      }
    });

    it('UT-SRV-03: should prevent conflicting hold requests on already locked seats', () => {
      const shows = db.get('shows');
      const testShow = shows[0];

      // Ensure clean state for test seats
      const currentLocks = db.get('seatLocks');
      db.set('seatLocks', currentLocks.filter(l => l.seatNumber !== 'H1'));

      try {
        // First user holds H1
        const hold1 = showAndSeatService.holdSeats(testShow.showId, ['H1'], 'usr_alpha', 5);
        assert.equal(hold1.success, true);

        // Second user tries to hold H1
        const hold2 = showAndSeatService.holdSeats(testShow.showId, ['H1'], 'usr_beta', 5);
        assert.equal(hold2.success, false);
        assert.match(hold2.message, /no longer available/i);
      } finally {
        // Alpha releases H1
        showAndSeatService.releaseSeats(testShow.showId, ['H1'], 'usr_alpha');
      }
    });
  });

  describe('2.2 PaymentService', () => {
    it('UT-SRV-04: should generate valid NPCI-compliant UPI deep link string and Data URL QR code', async () => {
      const qrResult = await paymentService.generateHostUpiQr({
        bookingId: 'bk_upi_unit_test',
        amount: 450.50,
        hostId: 'usr_host_1'
      });

      assert.equal(qrResult.paymentGateway.mode, 'HOST_UPI_QR');
      assert.ok(qrResult.paymentDetails.qrDataUrl.startsWith('data:image/png;base64,'));
      
      const upiUri = qrResult.paymentDetails.upiUri;
      assert.ok(upiUri.startsWith('upi://pay?'));
      assert.ok(upiUri.includes('am=450.50'));
      assert.ok(upiUri.includes('cu=INR'));
      assert.ok(upiUri.includes('tn=TicketBooking-bk_upi_unit_test'));
    });

    it('UT-SRV-05: should report configured/simulated status for pluggable Razorpay adapter', async () => {
      const order = await paymentService.partnerAdapters.razorpay.createOrder('bk_partner_test', 500);
      assert.ok(order);
      const verify = await paymentService.partnerAdapters.razorpay.verifyPayment('ord_1', 'pay_1', 'sig_1');
      assert.equal(verify.success, true);
    });
  });

  describe('2.3 TicketService', () => {
    it('UT-SRV-06: should generate complete E-Ticket with verifiable QR payload', async () => {
      const mockBooking = {
        bookingId: 'bk_tkt_unit',
        userId: 'usr_user_1',
        movieTitle: 'Interstellar',
        theaterName: 'PVR IMAX',
        screenName: 'Audi 1',
        showDate: '2026-11-05',
        showTime: '20:00',
        seats: [{ seatNumber: 'E4', price: 350 }],
        totalAmount: 413
      };
      const mockShow = { showId: 'sh_unit_tkt', date: '2026-11-05', time: '20:00', screenName: 'Audi 1' };
      const mockMovie = { title: 'Interstellar' };
      const mockTheater = { name: 'PVR IMAX' };
      const mockUser = { name: 'Mihir Sharma' };

      const ticket = await ticketService.generateTicket({
        booking: mockBooking,
        show: mockShow,
        movie: mockMovie,
        theater: mockTheater,
        user: mockUser
      });

      assert.ok(ticket.ticketId.startsWith('tkt_'));
      assert.equal(ticket.status, 'VALID');
      assert.equal(ticket.seatNo, 'E4');
      assert.ok(ticket.QRCode.startsWith('data:image/png;base64,'));

      // Validate Ticket Gate Scanner Check-in
      const scan1 = ticketService.scanAndVerifyTicket(ticket.ticketId);
      assert.equal(scan1.valid, true);
      assert.equal(scan1.ticket.status, 'CHECKED_IN');

      // Duplicate scan check
      const scan2 = ticketService.scanAndVerifyTicket(ticket.ticketId);
      assert.equal(scan2.valid, false);
      assert.match(scan2.message, /already used/i);
    });

    it('UT-SRV-07: should reject invalid or non-existent ticket query during gate scan', () => {
      const scan = ticketService.scanAndVerifyTicket('tkt_non_existent_random_id');
      assert.equal(scan.valid, false);
      assert.match(scan.message, /Invalid or non-existent ticket/i);
    });
  });
});
