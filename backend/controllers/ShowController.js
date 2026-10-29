const db = require('../data/db');
const Show = require('../models/Show');
const showAndSeatService = require('../services/ShowAndSeatService');

class ShowController {
  getAllShows(req, res) {
    try {
      const { movieId, theaterId, date, hostId } = req.query;
      let shows = db.get('shows');

      if (movieId) {
        shows = shows.filter(s => s.movieId === movieId);
      }
      if (theaterId) {
        shows = shows.filter(s => s.theaterId === theaterId);
      }
      if (date) {
        shows = shows.filter(s => s.date === date);
      }
      if (hostId) {
        shows = shows.filter(s => s.hostId === hostId);
      }

      // Enrich with Movie & Theater names
      const movies = db.get('movies');
      const theaters = db.get('theaters');

      const enriched = shows.map(s => {
        const m = movies.find(mov => mov.movieId === s.movieId);
        const t = theaters.find(th => th.theaterId === s.theaterId);
        return {
          ...s,
          movieTitle: m ? m.title : 'Unknown',
          moviePoster: m ? m.poster : '',
          movieDuration: m ? m.duration : 120,
          theaterName: t ? t.name : 'Unknown',
          theaterLocation: t ? t.location : '',
          theaterCity: t ? t.city : ''
        };
      });

      return res.json({ success: true, count: enriched.length, shows: enriched });
    } catch (err) {
      console.error('Error fetching shows:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  getShowById(req, res) {
    try {
      const { id } = req.params;
      const show = db.get('shows').find(s => s.showId === id);
      if (!show) {
        return res.status(404).json({ error: 'Show not found' });
      }

      const movie = db.get('movies').find(m => m.movieId === show.movieId);
      const theater = db.get('theaters').find(t => t.theaterId === show.theaterId);

      return res.json({
        success: true,
        show: {
          ...show,
          movie,
          theater
        }
      });
    } catch (err) {
      console.error('Error fetching show:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  getShowSeats(req, res) {
    try {
      const { id } = req.params;
      const result = showAndSeatService.getSeatsForShow(id);

      const movie = db.get('movies').find(m => m.movieId === result.show.movieId);
      const theater = db.get('theaters').find(t => t.theaterId === result.show.theaterId);

      return res.json({
        success: true,
        ...result,
        movie,
        theater
      });
    } catch (err) {
      console.error('Error fetching seats for show:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  createShow(req, res) {
    try {
      const {
        movieId,
        theaterId,
        screenId,
        screenName,
        format,
        date,
        time,
        price,
        tierPricing,
        hostId
      } = req.body;

      if (!movieId || !theaterId || !date || !time || !price) {
        return res.status(400).json({ error: 'movieId, theaterId, date, time, and price are required' });
      }

      const theaters = db.get('theaters');
      const theater = theaters.find(t => t.theaterId === theaterId);
      const finalHostId = hostId || (theater ? theater.hostId : 'usr_host_1');

      const showId = `sh_${Date.now()}`;
      const basePrice = Number(price);

      const newShow = new Show({
        showId,
        movieId,
        theaterId,
        screenId: screenId || (theater && theater.screens[0] ? theater.screens[0].screenId : 'sc_1'),
        screenName: screenName || (theater && theater.screens[0] ? theater.screens[0].name : 'Audi 1'),
        format: format || 'IMAX 2D',
        date,
        time,
        price: basePrice,
        tierPricing: tierPricing || {
          silver: Math.round(basePrice * 0.75),
          gold: basePrice,
          vip: Math.round(basePrice * 1.5)
        },
        hostId: finalHostId
      });

      db.insert('shows', newShow.getShowDetails());

      return res.status(201).json({
        success: true,
        message: 'Show created successfully',
        show: newShow.getShowDetails()
      });
    } catch (err) {
      console.error('Error creating show:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  updateShow(req, res) {
    try {
      const { id } = req.params;
      const updated = db.update('shows', s => s.showId === id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Show not found' });
      }
      return res.json({
        success: true,
        message: 'Show updated successfully',
        show: new Show(updated).getShowDetails()
      });
    } catch (err) {
      console.error('Error updating show:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  deleteShow(req, res) {
    try {
      const { id } = req.params;
      const deleted = db.delete('shows', s => s.showId === id);
      if (!deleted) {
        return res.status(404).json({ error: 'Show not found' });
      }
      // Also cleanup seat locks
      db.delete('seatLocks', l => l.showId === id);

      return res.json({ success: true, message: 'Show deleted successfully' });
    } catch (err) {
      console.error('Error deleting show:', err);
      return res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new ShowController();
