const db = require('../data/db');

class ReportController {
  getAdminReports(req, res) {
    try {
      const bookings = db.get('bookings');
      const movies = db.get('movies');
      const theaters = db.get('theaters');
      const shows = db.get('shows');
      const users = db.get('users');

      const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED');
      const cancelledBookings = bookings.filter(b => b.status === 'CANCELLED');

      const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
      const totalTicketsSold = confirmedBookings.reduce((sum, b) => sum + (b.ticketCount || 0), 0);

      // Revenue and tickets by movie
      const movieAnalytics = movies.map(movie => {
        const movieBookings = confirmedBookings.filter(b => b.movieId === movie.movieId);
        const revenue = movieBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        const tickets = movieBookings.reduce((sum, b) => sum + (b.ticketCount || 0), 0);
        return {
          movieId: movie.movieId,
          title: movie.title,
          poster: movie.poster,
          rating: movie.rating,
          revenue,
          ticketsSold: tickets,
          bookingsCount: movieBookings.length
        };
      }).sort((a, b) => b.revenue - a.revenue);

      // Revenue and occupancy by theater
      const theaterAnalytics = theaters.map(th => {
        const thBookings = confirmedBookings.filter(b => b.theaterId === th.theaterId);
        const revenue = thBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        const tickets = thBookings.reduce((sum, b) => sum + (b.ticketCount || 0), 0);
        const totalScreens = th.totalScreens || 1;
        return {
          theaterId: th.theaterId,
          name: th.name,
          city: th.city,
          totalScreens,
          revenue,
          ticketsSold: tickets,
          bookingsCount: thBookings.length
        };
      }).sort((a, b) => b.revenue - a.revenue);

      // User stats
      const userCount = users.filter(u => u.role === 'user').length;
      const hostCount = users.filter(u => u.role === 'host').length;
      const adminCount = users.filter(u => u.role === 'admin').length;

      return res.json({
        success: true,
        summary: {
          totalRevenue,
          totalBookings: bookings.length,
          confirmedBookingsCount: confirmedBookings.length,
          cancelledBookingsCount: cancelledBookings.length,
          totalTicketsSold,
          totalMovies: movies.length,
          totalTheaters: theaters.length,
          totalShows: shows.length,
          totalUsers: userCount,
          totalHosts: hostCount,
          totalAdmins: adminCount
        },
        movieAnalytics,
        theaterAnalytics,
        recentBookings: bookings.slice(-5).reverse()
      });
    } catch (err) {
      console.error('Error compiling admin reports:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  getHostReports(req, res) {
    try {
      const { hostId } = req.params;
      const allBookings = db.get('bookings');
      const allTheaters = db.get('theaters');
      const allShows = db.get('shows');

      const hostTheaters = allTheaters.filter(t => t.hostId === hostId);
      const hostShows = allShows.filter(s => s.hostId === hostId);
      const hostBookings = allBookings.filter(b => b.hostId === hostId);

      const confirmedBookings = hostBookings.filter(b => b.status === 'CONFIRMED');
      const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
      const totalTicketsSold = confirmedBookings.reduce((sum, b) => sum + (b.ticketCount || 0), 0);

      return res.json({
        success: true,
        hostId,
        summary: {
          totalRevenue,
          totalBookings: hostBookings.length,
          confirmedCount: confirmedBookings.length,
          totalTicketsSold,
          theatersCount: hostTheaters.length,
          showsCount: hostShows.length
        },
        theaters: hostTheaters,
        activeShows: hostShows,
        recentBookings: hostBookings.slice(-10).reverse()
      });
    } catch (err) {
      console.error('Error compiling host reports:', err);
      return res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new ReportController();
