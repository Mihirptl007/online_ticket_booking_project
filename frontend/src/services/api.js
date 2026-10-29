// API Service Layer for frontend communicating with backend
const API_BASE = '/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('eticket_token') || null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('eticket_token', token);
    } else {
      localStorage.removeItem('eticket_token');
    }
  }

  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = { ...this.getHeaders(), ...(options.headers || {}) };

    const config = {
      ...options,
      headers
    };

    try {
      const res = await fetch(url, config);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || `HTTP error! status: ${res.status}`);
      }

      return data;
    } catch (err) {
      console.error(`API Error on [${options.method || 'GET'}] ${endpoint}:`, err);
      throw err;
    }
  }

  // --- Auth ---
  login(email, password, role) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role })
    });
  }

  register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  getMe() {
    return this.request('/auth/me');
  }

  // --- Movies ---
  getMovies(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/movies${query ? `?${query}` : ''}`);
  }

  getMovieById(id) {
    return this.request(`/movies/${id}`);
  }

  createMovie(movieData) {
    return this.request('/movies', {
      method: 'POST',
      body: JSON.stringify(movieData)
    });
  }

  updateMovie(id, movieData) {
    return this.request(`/movies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(movieData)
    });
  }

  deleteMovie(id) {
    return this.request(`/movies/${id}`, {
      method: 'DELETE'
    });
  }

  // --- Theaters ---
  getTheaters(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/theaters${query ? `?${query}` : ''}`);
  }

  getTheaterById(id) {
    return this.request(`/theaters/${id}`);
  }

  createTheater(theaterData) {
    return this.request('/theaters', {
      method: 'POST',
      body: JSON.stringify(theaterData)
    });
  }

  updateTheater(id, theaterData) {
    return this.request(`/theaters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(theaterData)
    });
  }

  deleteTheater(id) {
    return this.request(`/theaters/${id}`, {
      method: 'DELETE'
    });
  }

  // --- Shows ---
  getShows(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/shows${query ? `?${query}` : ''}`);
  }

  getShowById(id) {
    return this.request(`/shows/${id}`);
  }

  getShowSeats(id) {
    return this.request(`/shows/${id}/seats`);
  }

  createShow(showData) {
    return this.request('/shows', {
      method: 'POST',
      body: JSON.stringify(showData)
    });
  }

  updateShow(id, showData) {
    return this.request(`/shows/${id}`, {
      method: 'PUT',
      body: JSON.stringify(showData)
    });
  }

  deleteShow(id) {
    return this.request(`/shows/${id}`, {
      method: 'DELETE'
    });
  }

  // --- Bookings ---
  holdAndCreateBooking(userId, showId, seatNumbers) {
    return this.request('/bookings/hold', {
      method: 'POST',
      body: JSON.stringify({ userId, showId, seatNumbers })
    });
  }

  confirmBooking(bookingId, userId, paymentMethod, utrNumber) {
    return this.request('/bookings/confirm', {
      method: 'POST',
      body: JSON.stringify({ bookingId, userId, paymentMethod, utrNumber })
    });
  }

  cancelBooking(bookingId, userId, role) {
    return this.request(`/bookings/cancel/${bookingId}`, {
      method: 'POST',
      body: JSON.stringify({ userId, role })
    });
  }

  getUserBookings(userId) {
    return this.request(`/bookings/user/${userId}`);
  }

  getHostBookings(hostId) {
    return this.request(`/bookings/host/${hostId}`);
  }

  getAllBookings() {
    return this.request('/bookings/all');
  }

  // --- Payments ---
  generateHostUpiQr(bookingId, amount, hostId) {
    return this.request('/payments/generate-upi-qr', {
      method: 'POST',
      body: JSON.stringify({ bookingId, amount, hostId })
    });
  }

  verifyPayment(bookingId, userId, utrNumber) {
    return this.request('/payments/verify', {
      method: 'POST',
      body: JSON.stringify({ bookingId, userId, utrNumber })
    });
  }

  getGatewayInfo() {
    return this.request('/payments/gateway-info');
  }

  // --- Tickets ---
  getTicket(id) {
    return this.request(`/tickets/${id}`);
  }

  scanTicket(query) {
    return this.request('/tickets/scan', {
      method: 'POST',
      body: JSON.stringify({ query })
    });
  }

  // --- Reports ---
  getAdminReports() {
    return this.request('/reports/admin');
  }

  getHostReports(hostId) {
    return this.request(`/reports/host/${hostId}`);
  }

  // --- Users & Host Management ---
  getUsers() {
    return this.request('/users');
  }

  toggleUserStatus(userId, status) {
    return this.request(`/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  updateHostProfile(hostId, profileData) {
    return this.request(`/hosts/${hostId}/profile`, {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }
}

export const api = new ApiService();
