const express = require('express');
const router = express.Router();

const authController = require('../controllers/AuthController');
const movieController = require('../controllers/MovieController');
const theaterController = require('../controllers/TheaterController');
const showController = require('../controllers/ShowController');
const bookingController = require('../controllers/BookingController');
const paymentController = require('../controllers/PaymentController');
const ticketController = require('../controllers/TicketController');
const reportController = require('../controllers/ReportController');
const userController = require('../controllers/UserController');

// --- Auth Routes ---
router.post('/auth/login', (req, res) => authController.login(req, res));
router.post('/auth/register', (req, res) => authController.register(req, res));
router.get('/auth/me', (req, res) => authController.getMe(req, res));

// --- Movies Routes ---
router.get('/movies', (req, res) => movieController.getAllMovies(req, res));
router.get('/movies/:id', (req, res) => movieController.getMovieById(req, res));
router.post('/movies', (req, res) => movieController.createMovie(req, res));
router.put('/movies/:id', (req, res) => movieController.updateMovie(req, res));
router.delete('/movies/:id', (req, res) => movieController.deleteMovie(req, res));

// --- Theaters Routes ---
router.get('/theaters', (req, res) => theaterController.getAllTheaters(req, res));
router.get('/theaters/:id', (req, res) => theaterController.getTheaterById(req, res));
router.post('/theaters', (req, res) => theaterController.createTheater(req, res));
router.put('/theaters/:id', (req, res) => theaterController.updateTheater(req, res));
router.delete('/theaters/:id', (req, res) => theaterController.deleteTheater(req, res));

// --- Shows Routes ---
router.get('/shows', (req, res) => showController.getAllShows(req, res));
router.get('/shows/:id', (req, res) => showController.getShowById(req, res));
router.get('/shows/:id/seats', (req, res) => showController.getShowSeats(req, res));
router.post('/shows', (req, res) => showController.createShow(req, res));
router.put('/shows/:id', (req, res) => showController.updateShow(req, res));
router.delete('/shows/:id', (req, res) => showController.deleteShow(req, res));

// --- Bookings Routes ---
router.post('/bookings/hold', (req, res) => bookingController.holdAndCreateBooking(req, res));
router.post('/bookings/confirm', (req, res) => bookingController.confirmBooking(req, res));
router.post('/bookings/cancel/:bookingId', (req, res) => bookingController.cancelBooking(req, res));
router.get('/bookings/user/:userId', (req, res) => bookingController.getUserBookings(req, res));
router.get('/bookings/host/:hostId', (req, res) => bookingController.getHostBookings(req, res));
router.get('/bookings/all', (req, res) => bookingController.getAllBookings(req, res));

// --- Payments Routes ---
router.post('/payments/generate-upi-qr', (req, res) => paymentController.generateHostUpiQr(req, res));
router.post('/payments/verify', (req, res) => paymentController.verifyAndConfirm(req, res));
router.get('/payments/gateway-info', (req, res) => paymentController.getGatewayInfo(req, res));

// --- Tickets Routes ---
router.get('/tickets/:id', (req, res) => ticketController.getTicketById(req, res));
router.post('/tickets/scan', (req, res) => ticketController.scanTicket(req, res));

// --- Reports Routes ---
router.get('/reports/admin', (req, res) => reportController.getAdminReports(req, res));
router.get('/reports/host/:hostId', (req, res) => reportController.getHostReports(req, res));

// --- Users & Host Management Routes ---
router.get('/users', (req, res) => userController.getAllUsers(req, res));
router.patch('/users/:userId/status', (req, res) => userController.toggleUserStatus(req, res));
router.put('/hosts/:hostId/profile', (req, res) => userController.updateHostUpiProfile(req, res));

module.exports = router;
