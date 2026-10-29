# NOVELLA E-TICKET SYSTEM — INTEGRATION TEST RESULTS REPORT

**Project Name:** Novella E-Ticket Management System  
**Test Suite:** End-to-End REST API, Controller Workflows & Persistence Engine  
**Execution Timestamp:** 2026-10-29T13:48:55+05:30  
**Test Framework:** Node.js Native Test Runner (`node:test` + `node:assert/strict`)  
**Network Protocol:** HTTP / Native Fetch against Ephemeral Express Server  
**Runtime:** Node.js v24.16.0 (x64-win32)  
**Target Codebase:** `backend/server.js`, `backend/routes/api.js`, `backend/controllers/*`, `backend/data/db.js`  
**Location:** `c:\Users\mihir\OneDrive\Desktop\eticket-system\tests\integration.test.js`  

---

## 1. Executive Summary Scorecard

| Metric | Result | Status |
| :--- | :--- | :--- |
| **Total Test Suites** | **6 Suites** | <span style="color:green">✔ COMPLETE</span> |
| **Total Test Cases** | **35 Cases** | <span style="color:green">✔ COMPLETE</span> |
| **Passed Tests** | **35** | <span style="color:green">✔ 100% PASS</span> |
| **Failed Tests** | **0** | <span style="color:green">✔ ZERO FAILURES</span> |
| **Skipped / Cancelled** | **0** | <span style="color:green">✔ NONE</span> |
| **Pass Rate** | **100.00%** | <span style="color:green">★ PERFECT SCORE</span> |
| **Total Execution Duration** | **519.7 ms** | <span style="color:green">⚡ HIGH PERFORMANCE</span> |

---

## 2. Scope & Methodology

Integration testing validates the end-to-end communication pathways between HTTP route definitions, Express middlewares, request/response parsers, controllers, service orchestration layers, and file-based JSON persistence.

### Test Environment Safeguards
1. **Database Snapshot & Isolation**: `tests/integration.test.js` creates an in-memory backup of `backend/data/database.json` prior to execution, and restores it on test teardown. Zero production data was mutated or lost.
2. **Ephemeral Port Binding**: The test runner mounts the Express application on dynamic port `0` (`http.createServer(app).listen(0)`), completely preventing `EADDRINUSE` port collision.
3. **Real HTTP Requests**: Uses native Node.js `fetch` to simulate authentic client requests with JSON bodies and Bearer authorization headers.

---

## 3. Comprehensive Test Execution Matrix

| Test ID | Route / Operation | Description | Expected Status / Output | Actual Result | Duration | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **IT-SYS-01** | `GET /api/health` | System health check & metadata | 200 OK, `status: 'ONLINE'`, version '1.0.0' | 200 OK, matched metadata | 53.59ms | **PASS** |
| **IT-SYS-02** | `GET /` | Built frontend production static serving | 200 OK, HTML template containing `<div id="root">` | 200 OK, served HTML template | 8.64ms | **PASS** |
| **IT-SYS-03** | `GET /theaters` | Client-side SPA routing fallback | 200 OK, serves `index.html` for React routing | 200 OK, HTML fallback served | 5.10ms | **PASS** |
| **IT-ATH-01** | `POST /api/auth/login` | Administrator authentication | 200 OK, role 'admin', valid session token | 200 OK, token issued, role verified | 16.19ms | **PASS** |
| **IT-ATH-02** | `POST /api/auth/login` | Theater Host authentication | 200 OK, role 'host', returns Host UPI ID | 200 OK, token issued, UPI ID returned | 3.60ms | **PASS** |
| **IT-ATH-03** | `POST /api/auth/login` | Customer User authentication | 200 OK, role 'user', valid session token | 200 OK, token issued, role verified | 3.83ms | **PASS** |
| **IT-ATH-04** | `POST /api/auth/login` | Invalid password submission | 401 Unauthorized with descriptive error | 401 Unauthorized, rejected | 2.74ms | **PASS** |
| **IT-ATH-05** | `POST /api/auth/login` | Mismatched portal role selection | 403 Forbidden with portal redirection hint | 403 Forbidden, role notice returned | 2.96ms | **PASS** |
| **IT-ATH-06** | `POST /api/auth/register` | New customer account creation | 201 Created with safe user object | 201 Created, record created | 3.71ms | **PASS** |
| **IT-ATH-07** | `POST /api/auth/register` | Duplicate email rejection | 400 Bad Request: 'already registered' | 400 Bad Request, duplicate blocked | 4.61ms | **PASS** |
| **IT-ATH-08** | `GET /api/auth/me` | Session verification via Bearer token | 200 OK with authenticated user session | 200 OK, authenticated user returned | 2.44ms | **PASS** |
| **IT-ATH-09** | `GET /api/users` | Platform accounts catalog (Admin) | 200 OK with array of all users | 200 OK, user list returned | 2.27ms | **PASS** |
| **IT-ATH-10** | `PATCH /api/users/:id/status` | User block/unblock lifecycle | 200 OK, blocked user cannot login, unblocked | Blocked -> 401 -> Unblocked -> 200 | 8.62ms | **PASS** |
| **IT-CAT-01** | `GET /api/movies` | Fetch movie catalog with show counts | 200 OK with movie list and ratings | 200 OK, movies with counts returned | 3.83ms | **PASS** |
| **IT-CAT-02** | `GET /api/movies?genre=Sci-Fi` | Filter movie catalog by genre | 200 OK, all returned movies match Sci-Fi | 200 OK, filtered correctly | 1.77ms | **PASS** |
| **IT-CAT-03** | `GET /api/movies/:id` | Single movie details and showtimes | 200 OK with movie details and show array | 200 OK, movie with shows returned | 1.56ms | **PASS** |
| **IT-CAT-04** | `GET /api/theaters` | Venues catalog with screen specifications | 200 OK with theater list and screen counts | 200 OK, venues catalog returned | 1.49ms | **PASS** |
| **IT-CAT-05** | `GET /api/theaters?city=Mumbai` | Filter theaters by city | 200 OK, all venues have city 'Mumbai' | 200 OK, filtered by city | 1.27ms | **PASS** |
| **IT-CAT-06** | `GET /api/shows` | Scheduled movie shows list | 200 OK with active scheduled shows | 200 OK, shows list returned | 1.58ms | **PASS** |
| **IT-CAT-07** | `GET /api/shows/:id/seats` | Full 64-seat dynamic matrix layout | 200 OK, 64 seats, tier pricing (VIP/Gold/Silver) | 200 OK, 64 seats with tiers returned | 2.33ms | **PASS** |
| **IT-E2E-01** | `POST /api/bookings/hold` | Hold seats with 10-minute lock TTL | 201 Created, status 'PENDING', total amount | 201 Created, hold timer active | 7.39ms | **PASS** |
| **IT-E2E-02** | `POST /api/bookings/hold` | Conflicting hold by concurrent user | 409 Conflict: 'seats no longer available' | 409 Conflict, conflict rejected | 1.86ms | **PASS** |
| **IT-E2E-03** | `POST /api/payments/generate-upi-qr` | Generate host dynamic UPI QR code | 200 OK, NPCI deep link & QR Data URL | 200 OK, valid deep link & QR URL | 40.30ms | **PASS** |
| **IT-E2E-04** | `POST /api/payments/verify` | UPI UTR verification & confirm booking | 200 OK, booking 'CONFIRMED', issues ticket | 200 OK, confirmed, ticket issued | 18.09ms | **PASS** |
| **IT-E2E-05** | `GET /api/tickets/:id` | Retrieve issued E-Ticket with gate QR | 200 OK, status 'VALID', seat numbers, QR | 200 OK, boarding pass retrieved | 2.77ms | **PASS** |
| **IT-E2E-06** | `POST /api/tickets/scan` | Theater entrance gate ticket check-in | 200 OK, valid: true, status 'CHECKED_IN' | 200 OK, check-in success | 3.01ms | **PASS** |
| **IT-E2E-07** | `POST /api/tickets/scan` | Re-scan already checked-in ticket | 200 OK, valid: false, alreadyUsed: true | 200 OK, duplicate rejected | 19.19ms | **PASS** |
| **IT-E2E-08** | `GET /api/bookings/user/:id` | Verify booking in customer history | 200 OK, contains confirmed booking ID | 200 OK, booking present in history | 2.86ms | **PASS** |
| **IT-MGT-01** | `POST /api/shows` | Host schedules new movie screening | 201 Created with new showId and screen info | 201 Created, show scheduled | 4.64ms | **PASS** |
| **IT-MGT-02** | `PUT /api/shows/:id` | Update show schedule and price | 200 OK with updated show timing and price | 200 OK, show updated | 5.19ms | **PASS** |
| **IT-MGT-03** | `PUT /api/hosts/:id/profile` | Update Host UPI VPA profile | 200 OK with updated UPI ID and recipient name | 200 OK, profile updated | 4.64ms | **PASS** |
| **IT-MGT-04** | `GET /api/reports/host/:id` | Host revenue & occupancy reports | 200 OK with summary revenue and ticket sales | 200 OK, host analytics returned | 2.46ms | **PASS** |
| **IT-MGT-05** | `GET /api/reports/admin` | Gross platform financial analytics | 200 OK with revenue, movie & theater breakdowns | 200 OK, platform metrics returned | 2.92ms | **PASS** |
| **IT-MGT-06** | `POST /api/bookings/cancel/:id` | Cancel booking and release seats | 200 OK, booking 'CANCELLED', seats AVAILABLE | 200 OK, seats released to available | 9.87ms | **PASS** |
| **IT-MGT-07** | `DELETE /api/shows/:id` | Delete scheduled show | 200 OK, subsequent GET returns 404 Not Found | 200 OK, 404 confirmed on query | 4.09ms | **PASS** |

---

## 4. Raw Console Output

```text
◇ injected env (5) from .env
[GET] /api/health - 200 (3ms)
▶ --- [INTEGRATION TEST SUITE: COMPLETE REST API LIFECYCLE] ---
  ▶ 1. System & Static Serving Endpoints
    ✔ IT-SYS-01: GET /api/health should return 200 with ONLINE status and system metadata (53.5929ms)
[GET] / - 200 (4ms)
    ✔ IT-SYS-02: GET / should serve the built website HTML entry template (8.6428ms)
[GET] /theaters - 200 (3ms)
    ✔ IT-SYS-03: GET /theaters (client-side route) should fall back to index.html with 200 OK (5.1021ms)
  ✔ 1. System & Static Serving Endpoints (68.0462ms)
[POST] /api/auth/login - 200 (1ms)
  ▶ 2. Authentication & User Management Flow
    ✔ IT-ATH-01: POST /api/auth/login as Administrator should return 200, token, and admin permissions (16.1882ms)
[POST] /api/auth/login - 200 (0ms)
    ✔ IT-ATH-02: POST /api/auth/login as Theater Host should return 200, token, and host UPI profile (3.603ms)
[POST] /api/auth/login - 200 (0ms)
    ✔ IT-ATH-03: POST /api/auth/login as Customer User should return 200 and user token (3.8339ms)
[POST] /api/auth/login - 401 (0ms)
    ✔ IT-ATH-04: POST /api/auth/login with invalid password should return 401 Unauthorized (2.7384ms)
[POST] /api/auth/login - 403 (0ms)
    ✔ IT-ATH-05: POST /api/auth/login with mismatched role should return 403 Forbidden (2.9643ms)
[POST] /api/auth/register - 201 (1ms)
    ✔ IT-ATH-06: POST /api/auth/register should register a new customer account (3.705ms)
[POST] /api/auth/register - 400 (0ms)
    ✔ IT-ATH-07: POST /api/auth/register with duplicate email should return 400 Bad Request (4.6143ms)
[GET] /api/auth/me - 200 (1ms)
    ✔ IT-ATH-08: GET /api/auth/me with Bearer token should verify and return user session (2.4449ms)
[GET] /api/users - 200 (1ms)
    ✔ IT-ATH-09: GET /api/users should list all platform accounts for management (2.2734ms)
[PATCH] /api/users/usr_user_2/status - 200 (2ms)
[POST] /api/auth/login - 401 (1ms)
[PATCH] /api/users/usr_user_2/status - 200 (1ms)
    ✔ IT-ATH-10: PATCH /api/users/:userId/status should block a user, prevent login, and unblock (8.6187ms)
  ✔ 2. Authentication & User Management Flow (51.9231ms)
[GET] /api/movies - 200 (1ms)
  ▶ 3. Catalog & Discovery Endpoints
    ✔ IT-CAT-01: GET /api/movies should return movie catalog with active show counts (3.828ms)
[GET] /api/movies?genre=Sci-Fi - 200 (1ms)
    ✔ IT-CAT-02: GET /api/movies?genre=Sci-Fi should filter movies by genre (1.7723ms)
[GET] /api/movies/mov_1 - 200 (0ms)
    ✔ IT-CAT-03: GET /api/movies/:id should return movie details and its scheduled shows (1.5638ms)
[GET] /api/theaters - 200 (0ms)
    ✔ IT-CAT-04: GET /api/theaters should return venues with screen details (1.4941ms)
[GET] /api/theaters?city=Mumbai - 200 (0ms)
    ✔ IT-CAT-05: GET /api/theaters?city=Mumbai should filter venues by city (1.2683ms)
[GET] /api/shows - 200 (1ms)
    ✔ IT-CAT-06: GET /api/shows should list scheduled screenings (1.5837ms)
[GET] /api/shows/sh_101/seats - 200 (1ms)
    ✔ IT-CAT-07: GET /api/shows/:id/seats should return layout matrix with rows, tiers, and availability (2.327ms)
  ✔ 3. Catalog & Discovery Endpoints (14.2995ms)
[POST] /api/bookings/hold - 201 (3ms)
  ▶ 4. Complete End-to-End Booking, Payment & Gate Check-in Lifecycle
    ✔ IT-E2E-01: POST /api/bookings/hold should hold seats with 10-min TTL and return pricing breakdown (7.394ms)
[POST] /api/bookings/hold - 409 (0ms)
    ✔ IT-E2E-02: POST /api/bookings/hold on conflicting held seat should return 409 Conflict (1.8559ms)
[POST] /api/payments/generate-upi-qr - 200 (39ms)
    ✔ IT-E2E-03: POST /api/payments/generate-upi-qr should return dynamic host QR data URL and NPCI deep link (40.2969ms)
[POST] /api/payments/verify - 200 (16ms)
    ✔ IT-E2E-04: POST /api/payments/verify should verify payment simulation / UTR and confirm booking (18.0868ms)
[GET] /api/tickets/tkt_1793261935329_923 - 200 (1ms)
    ✔ IT-E2E-05: GET /api/tickets/:id should retrieve issued digital E-Ticket with gate QR code (2.7677ms)
[POST] /api/tickets/scan - 200 (1ms)
    ✔ IT-E2E-06: POST /api/tickets/scan should validate ticket and check in customer at theater gate (3.0078ms)
[POST] /api/tickets/scan - 200 (17ms)
    ✔ IT-E2E-07: POST /api/tickets/scan duplicate attempt should reject already used ticket (19.193ms)
[GET] /api/bookings/user/usr_user_1 - 200 (1ms)
    ✔ IT-E2E-08: GET /api/bookings/user/:userId should include the newly confirmed booking in customer history (2.8564ms)
  ✔ 4. Complete End-to-End Booking, Payment & Gate Check-in Lifecycle (96.0713ms)
[POST] /api/shows - 201 (2ms)
  ▶ 5. Host & Admin Management Operations
    ✔ IT-MGT-01: POST /api/shows should allow Host/Admin to schedule a new movie screening (4.6448ms)
[PUT] /api/shows/sh_1793261935375 - 200 (2ms)
    ✔ IT-MGT-02: PUT /api/shows/:id should update scheduled show timing and pricing (5.1924ms)
[PUT] /api/hosts/usr_host_1/profile - 200 (2ms)
    ✔ IT-MGT-03: PUT /api/hosts/:hostId/profile should update Host UPI VPA and recipient name (4.6408ms)
[GET] /api/reports/host/usr_host_1 - 200 (1ms)
    ✔ IT-MGT-04: GET /api/reports/host/:hostId should return revenue and ticket sales analytics for host (2.4636ms)
[GET] /api/reports/admin - 200 (1ms)
    ✔ IT-MGT-05: GET /api/reports/admin should return platform-wide gross financial and occupancy reports (2.9218ms)
[POST] /api/bookings/cancel/bk_1793261935282_540 - 200 (5ms)
[GET] /api/shows/sh_101/seats - 200 (0ms)
    ✔ IT-MGT-06: POST /api/bookings/cancel/:bookingId should cancel booking and release seats back to available (9.8661ms)
[DELETE] /api/shows/sh_1793261935375 - 200 (1ms)
[GET] /api/shows/sh_1793261935375 - 404 (1ms)
    ✔ IT-MGT-07: DELETE /api/shows/:id should remove the temporary scheduled show (4.0919ms)
  ✔ 5. Host & Admin Management Operations (34.3361ms)
✔ --- [INTEGRATION TEST SUITE: COMPLETE REST API LIFECYCLE] --- (272.7789ms)
ℹ tests 35
ℹ suites 6
ℹ pass 35
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 519.6634
```

---

## 5. Conclusion & Verification Sign-Off

All **35 Integration Tests** passed with **100% success rate (0 failures, 0 errors)**. Authentication, catalog discovery, temporary seat holds, Host dynamic UPI QR code payments, verified E-Ticket issuance, entrance gate check-ins, multi-role analytics, and cancellations function with complete end-to-end reliability.
