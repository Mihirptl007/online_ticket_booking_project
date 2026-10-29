/**
 * ==============================================================================
 * NOVELLA E-TICKET MANAGEMENT SYSTEM - COMPREHENSIVE INTEGRATION TEST SUITE
 * ==============================================================================
 * Test Framework : Node.js Built-in Test Runner (node:test + node:assert/strict)
 * Target Endpoints: Full REST API + Controllers + Services + Persistence Engine
 * Protocol        : HTTP / Native Fetch against Ephemeral Express Server
 * ==============================================================================
 */

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const http = require('http');

// Express Application
const { app } = require('../backend/server');
const db = require('../backend/data/db');

// Path to persistent database for backup/restore
const DB_FILE = path.join(__dirname, '../backend/data/database.json');

describe('--- [INTEGRATION TEST SUITE: COMPLETE REST API LIFECYCLE] ---', () => {
  let server = null;
  let baseUrl = '';
  let dbBackup = null;

  // Global state across test steps for E2E flow
  let adminToken = '';
  let hostToken = '';
  let userToken = '';
  let currentUserId = 'usr_user_1';
  let activeShowId = '';
  let activeBookingId = '';
  let activeTicketId = '';
  let createdShowId = '';

  // Helper HTTP client
  async function request(method, endpoint, body = null, token = null) {
    const url = `${baseUrl}${endpoint}`;
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const options = { method, headers };
    if (body) {
      options.body = JSON.stringify(body);
    }
    const res = await fetch(url, options);
    const text = await res.text();
    let json = null;
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
    return {
      status: res.status,
      headers: res.headers,
      body: json,
      text
    };
  }

  before(async () => {
    // 1. Snapshot database.json to guarantee 100% non-destructive testing
    if (fs.existsSync(DB_FILE)) {
      dbBackup = fs.readFileSync(DB_FILE, 'utf8');
    }

    // 2. Start HTTP server on ephemeral port (0) to eliminate any port collision
    await new Promise((resolve) => {
      server = http.createServer(app);
      server.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    // 1. Close HTTP server
    if (server) {
      await new Promise(resolve => server.close(resolve));
    }

    // 2. Restore database.json to pristine pre-test snapshot
    if (dbBackup) {
      fs.writeFileSync(DB_FILE, dbBackup, 'utf8');
      db.init(); // Reload restored data
    }
  });

  describe('1. System & Static Serving Endpoints', () => {
    it('IT-SYS-01: GET /api/health should return 200 with ONLINE status and system metadata', async () => {
      const res = await request('GET', '/api/health');
      assert.equal(res.status, 200);
      assert.equal(res.body.status, 'ONLINE');
      assert.equal(res.body.version, '1.0.0');
      assert.ok(res.body.system.includes('E-Ticket'));
    });

    it('IT-SYS-02: GET / should serve the built website HTML entry template', async () => {
      const res = await request('GET', '/');
      assert.equal(res.status, 200);
      assert.ok(res.text.includes('<!doctype html>') || res.text.includes('<div id="root">'));
    });

    it('IT-SYS-03: GET /theaters (client-side route) should fall back to index.html with 200 OK', async () => {
      const res = await request('GET', '/theaters');
      assert.equal(res.status, 200);
      assert.ok(res.text.includes('<div id="root">'));
    });
  });

  describe('2. Authentication & User Management Flow', () => {
    it('IT-ATH-01: POST /api/auth/login as Administrator should return 200, token, and admin permissions', async () => {
      const res = await request('POST', '/api/auth/login', {
        email: 'admin@eticket.com',
        password: 'admin123',
        role: 'admin'
      });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.user.role, 'admin');
      assert.ok(res.body.token);
      adminToken = res.body.token;
    });

    it('IT-ATH-02: POST /api/auth/login as Theater Host should return 200, token, and host UPI profile', async () => {
      const res = await request('POST', '/api/auth/login', {
        email: 'host@pvr.com',
        password: 'host123',
        role: 'host'
      });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.user.role, 'host');
      assert.ok(res.body.user.upiId);
      assert.ok(res.body.token);
      hostToken = res.body.token;
    });

    it('IT-ATH-03: POST /api/auth/login as Customer User should return 200 and user token', async () => {
      const res = await request('POST', '/api/auth/login', {
        email: 'user@demo.com',
        password: 'user123',
        role: 'user'
      });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.user.role, 'user');
      assert.ok(res.body.token);
      userToken = res.body.token;
      currentUserId = res.body.user.userId;
    });

    it('IT-ATH-04: POST /api/auth/login with invalid password should return 401 Unauthorized', async () => {
      const res = await request('POST', '/api/auth/login', {
        email: 'user@demo.com',
        password: 'wrong_password_123'
      });

      assert.equal(res.status, 401);
      assert.ok(res.body.error);
    });

    it('IT-ATH-05: POST /api/auth/login with mismatched role should return 403 Forbidden', async () => {
      const res = await request('POST', '/api/auth/login', {
        email: 'admin@eticket.com',
        password: 'admin123',
        role: 'user' // Mismatched intentionally
      });

      assert.equal(res.status, 403);
      assert.match(res.body.error, /Account exists as 'admin'/i);
    });

    it('IT-ATH-06: POST /api/auth/register should register a new customer account', async () => {
      const testEmail = `newcustomer_${Date.now()}@example.com`;
      const res = await request('POST', '/api/auth/register', {
        name: 'Integration Tester',
        email: testEmail,
        password: 'password123',
        phone: '+91 9123456789',
        role: 'user'
      });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.equal(res.body.user.email, testEmail);
    });

    it('IT-ATH-07: POST /api/auth/register with duplicate email should return 400 Bad Request', async () => {
      const res = await request('POST', '/api/auth/register', {
        name: 'Duplicate Test',
        email: 'user@demo.com',
        password: 'password123'
      });

      assert.equal(res.status, 400);
      assert.match(res.body.error, /already registered/i);
    });

    it('IT-ATH-08: GET /api/auth/me with Bearer token should verify and return user session', async () => {
      const res = await request('GET', '/api/auth/me', null, userToken);
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.user.userId, currentUserId);
    });

    it('IT-ATH-09: GET /api/users should list all platform accounts for management', async () => {
      const res = await request('GET', '/api/users', null, adminToken);
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.users.length >= 3);
    });

    it('IT-ATH-10: PATCH /api/users/:userId/status should block a user, prevent login, and unblock', async () => {
      // 1. Block demo user 2
      const targetUserId = 'usr_user_2';
      const blockRes = await request('PATCH', `/api/users/${targetUserId}/status`, { status: 'blocked' });
      assert.equal(blockRes.status, 200);
      assert.equal(blockRes.body.user.status, 'blocked');

      // 2. Attempt login as blocked user
      const loginRes = await request('POST', '/api/auth/login', {
        email: 'aanya@example.com',
        password: 'user123'
      });
      assert.equal(loginRes.status, 401);
      assert.match(loginRes.body.error, /Account is blocked/i);

      // 3. Unblock back to active
      const unblockRes = await request('PATCH', `/api/users/${targetUserId}/status`, { status: 'active' });
      assert.equal(unblockRes.status, 200);
      assert.equal(unblockRes.body.user.status, 'active');
    });
  });

  describe('3. Catalog & Discovery Endpoints', () => {
    it('IT-CAT-01: GET /api/movies should return movie catalog with active show counts', async () => {
      const res = await request('GET', '/api/movies');
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.movies.length > 0);
      assert.ok(res.body.movies[0].title);
    });

    it('IT-CAT-02: GET /api/movies?genre=Sci-Fi should filter movies by genre', async () => {
      const res = await request('GET', '/api/movies?genre=Sci-Fi');
      assert.equal(res.status, 200);
      assert.ok(res.body.movies.every(m => m.genre.includes('Sci-Fi')));
    });

    it('IT-CAT-03: GET /api/movies/:id should return movie details and its scheduled shows', async () => {
      const res = await request('GET', '/api/movies/mov_1');
      assert.equal(res.status, 200);
      assert.equal(res.body.movie.movieId, 'mov_1');
      assert.ok(Array.isArray(res.body.shows));
    });

    it('IT-CAT-04: GET /api/theaters should return venues with screen details', async () => {
      const res = await request('GET', '/api/theaters');
      assert.equal(res.status, 200);
      assert.ok(res.body.theaters.length > 0);
    });

    it('IT-CAT-05: GET /api/theaters?city=Mumbai should filter venues by city', async () => {
      const res = await request('GET', '/api/theaters?city=Mumbai');
      assert.equal(res.status, 200);
      assert.ok(res.body.theaters.every(th => th.city === 'Mumbai'));
    });

    it('IT-CAT-06: GET /api/shows should list scheduled screenings', async () => {
      const res = await request('GET', '/api/shows');
      assert.equal(res.status, 200);
      assert.ok(res.body.shows.length > 0);
      activeShowId = res.body.shows[0].showId;
    });

    it('IT-CAT-07: GET /api/shows/:id/seats should return layout matrix with rows, tiers, and availability', async () => {
      const res = await request('GET', `/api/shows/${activeShowId}/seats`);
      assert.equal(res.status, 200);
      assert.equal(res.body.totalSeats, 64);
      assert.ok(res.body.seats.some(s => s.type === 'VIP'));
      assert.ok(res.body.seats.some(s => s.type === 'Gold'));
      assert.ok(res.body.seats.some(s => s.type === 'Silver'));
    });
  });

  describe('4. Complete End-to-End Booking, Payment & Gate Check-in Lifecycle', () => {
    const testSeats = ['F3', 'F4'];

    it('IT-E2E-01: POST /api/bookings/hold should hold seats with 10-min TTL and return pricing breakdown', async () => {
      // Clear any prior test locks on testSeats
      const seatLocks = db.get('seatLocks');
      db.set('seatLocks', seatLocks.filter(l => !(l.showId === activeShowId && testSeats.includes(l.seatNumber))));

      const res = await request('POST', '/api/bookings/hold', {
        userId: currentUserId,
        showId: activeShowId,
        seatNumbers: testSeats
      });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.ok(res.body.booking.bookingId);
      assert.equal(res.body.booking.status, 'PENDING');
      assert.ok(res.body.booking.totalAmount > 0);
      assert.ok(res.body.holdExpiresAt);

      activeBookingId = res.body.booking.bookingId;
    });

    it('IT-E2E-02: POST /api/bookings/hold on conflicting held seat should return 409 Conflict', async () => {
      const res = await request('POST', '/api/bookings/hold', {
        userId: 'usr_other_conflict',
        showId: activeShowId,
        seatNumbers: ['F3'] // already held by currentUserId in IT-E2E-01
      });

      assert.equal(res.status, 409);
      assert.match(res.body.error, /no longer available/i);
    });

    it('IT-E2E-03: POST /api/payments/generate-upi-qr should return dynamic host QR data URL and NPCI deep link', async () => {
      const res = await request('POST', '/api/payments/generate-upi-qr', {
        bookingId: activeBookingId,
        amount: 600,
        hostId: 'usr_host_1'
      });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.paymentGateway.mode, 'HOST_UPI_QR');
      assert.ok(res.body.paymentDetails.qrDataUrl.startsWith('data:image/png;base64,'));
      assert.ok(res.body.paymentDetails.upiUri.includes('upi://pay?'));
    });

    it('IT-E2E-04: POST /api/payments/verify should verify payment simulation / UTR and confirm booking', async () => {
      const utrNumber = `UTR_INTG_${Date.now()}`;
      const res = await request('POST', '/api/payments/verify', {
        bookingId: activeBookingId,
        userId: currentUserId,
        utrNumber,
        paymentMethod: 'HOST_UPI_QR'
      });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.booking.status, 'CONFIRMED');
      assert.ok(res.body.ticket);
      assert.ok(res.body.ticket.ticketId);

      activeTicketId = res.body.ticket.ticketId;
    });

    it('IT-E2E-05: GET /api/tickets/:id should retrieve issued digital E-Ticket with gate QR code', async () => {
      const res = await request('GET', `/api/tickets/${activeTicketId}`);
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.ticket.status, 'VALID');
      assert.ok(res.body.ticket.QRCode.startsWith('data:image/png;base64,'));
      assert.ok(res.body.ticket.seatNo.includes('F3'));
    });

    it('IT-E2E-06: POST /api/tickets/scan should validate ticket and check in customer at theater gate', async () => {
      const res = await request('POST', '/api/tickets/scan', {
        query: activeTicketId
      });

      assert.equal(res.status, 200);
      assert.equal(res.body.valid, true);
      assert.equal(res.body.ticket.status, 'CHECKED_IN');
      assert.ok(res.body.message.includes('Welcome to the screening'));
    });

    it('IT-E2E-07: POST /api/tickets/scan duplicate attempt should reject already used ticket', async () => {
      const res = await request('POST', '/api/tickets/scan', {
        query: activeTicketId
      });

      assert.equal(res.status, 200);
      assert.equal(res.body.valid, false);
      assert.equal(res.body.alreadyUsed, true);
      assert.match(res.body.message, /already used/i);
    });

    it('IT-E2E-08: GET /api/bookings/user/:userId should include the newly confirmed booking in customer history', async () => {
      const res = await request('GET', `/api/bookings/user/${currentUserId}`);
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      const found = res.body.bookings.find(b => b.bookingId === activeBookingId);
      assert.ok(found);
      assert.equal(found.status, 'CONFIRMED');
    });
  });

  describe('5. Host & Admin Management Operations', () => {
    it('IT-MGT-01: POST /api/shows should allow Host/Admin to schedule a new movie screening', async () => {
      const newShowPayload = {
        movieId: 'mov_1',
        theaterId: 'th_1',
        screenId: 'sc_1',
        hostId: 'usr_host_1',
        screenName: 'Audi 1 - IMAX with Laser 3D',
        format: 'IMAX 3D',
        date: '2026-11-15',
        time: '21:30',
        price: 450
      };

      const res = await request('POST', '/api/shows', newShowPayload, hostToken);
      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.ok(res.body.show.showId);
      createdShowId = res.body.show.showId;
    });

    it('IT-MGT-02: PUT /api/shows/:id should update scheduled show timing and pricing', async () => {
      const updatePayload = {
        time: '22:00',
        price: 480
      };

      const res = await request('PUT', `/api/shows/${createdShowId}`, updatePayload, hostToken);
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.show.time, '22:00');
      assert.equal(res.body.show.price, 480);
    });

    it('IT-MGT-03: PUT /api/hosts/:hostId/profile should update Host UPI VPA and recipient name', async () => {
      const newUpi = 'newpvr.boxoffice@icici';
      const res = await request('PUT', '/api/hosts/usr_host_1/profile', {
        upiId: newUpi,
        upiName: 'PVR INOX PREMIUM LTD'
      }, hostToken);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.host.upiId, newUpi);
    });

    it('IT-MGT-04: GET /api/reports/host/:hostId should return revenue and ticket sales analytics for host', async () => {
      const res = await request('GET', '/api/reports/host/usr_host_1', null, hostToken);
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.summary);
      assert.ok(typeof res.body.summary.totalRevenue === 'number');
    });

    it('IT-MGT-05: GET /api/reports/admin should return platform-wide gross financial and occupancy reports', async () => {
      const res = await request('GET', '/api/reports/admin', null, adminToken);
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.summary.totalRevenue >= 0);
      assert.ok(Array.isArray(res.body.movieAnalytics));
      assert.ok(Array.isArray(res.body.theaterAnalytics));
    });

    it('IT-MGT-06: POST /api/bookings/cancel/:bookingId should cancel booking and release seats back to available', async () => {
      const res = await request('POST', `/api/bookings/cancel/${activeBookingId}`, {
        userId: currentUserId,
        role: 'user'
      });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.booking.status, 'CANCELLED');

      // Verify seat matrix reflects seats are now AVAILABLE
      const seatsRes = await request('GET', `/api/shows/${activeShowId}/seats`);
      const seatF3 = seatsRes.body.seats.find(s => s.seatNumber === 'F3');
      const seatF4 = seatsRes.body.seats.find(s => s.seatNumber === 'F4');
      assert.equal(seatF3.status, 'AVAILABLE');
      assert.equal(seatF4.status, 'AVAILABLE');
    });

    it('IT-MGT-07: DELETE /api/shows/:id should remove the temporary scheduled show', async () => {
      const res = await request('DELETE', `/api/shows/${createdShowId}`, null, hostToken);
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);

      // Verify 404 when querying deleted show
      const queryRes = await request('GET', `/api/shows/${createdShowId}`);
      assert.equal(queryRes.status, 404);
    });
  });
});
