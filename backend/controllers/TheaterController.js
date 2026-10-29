const db = require('../data/db');
const Theater = require('../models/Theater');

class TheaterController {
  getAllTheaters(req, res) {
    try {
      const { city, hostId } = req.query;
      let theaters = db.get('theaters');

      if (city && city !== 'All') {
        theaters = theaters.filter(t => t.city.toLowerCase() === city.toLowerCase());
      }

      if (hostId) {
        theaters = theaters.filter(t => t.hostId === hostId);
      }

      const allShows = db.get('shows');
      const enrichedTheaters = theaters.map(t => {
        const theaterObj = new Theater(t);
        const shows = theaterObj.getShows(allShows);
        return {
          ...theaterObj.getTheaterDetails(),
          activeShowsCount: shows.length
        };
      });

      return res.json({ success: true, count: enrichedTheaters.length, theaters: enrichedTheaters });
    } catch (err) {
      console.error('Error fetching theaters:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  getTheaterById(req, res) {
    try {
      const { id } = req.params;
      const theater = db.get('theaters').find(t => t.theaterId === id);
      if (!theater) {
        return res.status(404).json({ error: 'Theater not found' });
      }

      const allShows = db.get('shows');
      const theaterObj = new Theater(theater);
      const shows = theaterObj.getShows(allShows);

      return res.json({
        success: true,
        theater: theaterObj.getTheaterDetails(),
        shows
      });
    } catch (err) {
      console.error('Error fetching theater:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  createTheater(req, res) {
    try {
      const { name, location, city, totalScreens, screens, hostId, amenities } = req.body;

      if (!name || !location) {
        return res.status(400).json({ error: 'Name and location are required' });
      }

      const theaterId = `th_${Date.now()}`;
      const defaultScreens = screens && screens.length ? screens : [
        { screenId: `sc_${Date.now()}_1`, name: 'Audi 1 - Laser 4K Dolby Atmos', capacity: 64, rows: 8, cols: 8 }
      ];

      const newTheater = new Theater({
        theaterId,
        hostId: hostId || 'usr_host_1',
        name,
        location,
        city: city || 'Mumbai',
        totalScreens: totalScreens || defaultScreens.length,
        screens: defaultScreens,
        amenities: amenities || ['Dolby Atmos', '4K Projection', 'Recliner Seating']
      });

      db.insert('theaters', newTheater.getTheaterDetails());

      return res.status(201).json({
        success: true,
        message: 'Theater created successfully',
        theater: newTheater.getTheaterDetails()
      });
    } catch (err) {
      console.error('Error creating theater:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  updateTheater(req, res) {
    try {
      const { id } = req.params;
      const updated = db.update('theaters', t => t.theaterId === id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Theater not found' });
      }
      return res.json({
        success: true,
        message: 'Theater updated successfully',
        theater: new Theater(updated).getTheaterDetails()
      });
    } catch (err) {
      console.error('Error updating theater:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  deleteTheater(req, res) {
    try {
      const { id } = req.params;
      const deleted = db.delete('theaters', t => t.theaterId === id);
      if (!deleted) {
        return res.status(404).json({ error: 'Theater not found' });
      }
      // Also delete associated shows
      db.delete('shows', s => s.theaterId === id);

      return res.json({ success: true, message: 'Theater deleted successfully' });
    } catch (err) {
      console.error('Error deleting theater:', err);
      return res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new TheaterController();
