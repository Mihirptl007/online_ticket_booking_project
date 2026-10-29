const db = require('../data/db');
const Movie = require('../models/Movie');

class MovieController {
  getAllMovies(req, res) {
    try {
      const { search, genre, language } = req.query;
      let movies = db.get('movies');

      if (search) {
        const query = search.toLowerCase();
        movies = movies.filter(m =>
          m.title.toLowerCase().includes(query) ||
          m.genre.toLowerCase().includes(query) ||
          (m.director && m.director.toLowerCase().includes(query)) ||
          (m.cast && m.cast.some(actor => actor.toLowerCase().includes(query)))
        );
      }

      if (genre && genre !== 'All') {
        movies = movies.filter(m => m.genre.toLowerCase().includes(genre.toLowerCase()));
      }

      if (language && language !== 'All') {
        movies = movies.filter(m => m.language.toLowerCase().includes(language.toLowerCase()));
      }

      const allShows = db.get('shows');
      const enrichedMovies = movies.map(m => {
        const movieObj = new Movie(m);
        const shows = movieObj.getShows(allShows);
        return {
          ...movieObj.getDetails(),
          showCount: shows.length
        };
      });

      return res.json({ success: true, count: enrichedMovies.length, movies: enrichedMovies });
    } catch (err) {
      console.error('Error fetching movies:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  getMovieById(req, res) {
    try {
      const { id } = req.params;
      const movie = db.get('movies').find(m => m.movieId === id);
      if (!movie) {
        return res.status(404).json({ error: 'Movie not found' });
      }

      const allShows = db.get('shows');
      const movieObj = new Movie(movie);
      const shows = movieObj.getShows(allShows);

      return res.json({
        success: true,
        movie: movieObj.getDetails(),
        shows
      });
    } catch (err) {
      console.error('Error fetching movie:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  createMovie(req, res) {
    try {
      const {
        title,
        genre,
        duration,
        language,
        rating,
        certification,
        poster,
        banner,
        description,
        director,
        cast,
        formats
      } = req.body;

      if (!title || !genre || !duration) {
        return res.status(400).json({ error: 'Title, genre, and duration are required' });
      }

      const movieId = `mov_${Date.now()}`;
      const newMovie = new Movie({
        movieId,
        title,
        genre,
        duration,
        language: language || 'English',
        rating: rating || '8.0',
        certification: certification || 'UA',
        poster: poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
        banner: banner || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
        description: description || '',
        director: director || '',
        cast: cast || ['Lead Actor'],
        formats: formats || ['2D', 'IMAX 2D']
      });

      db.insert('movies', {
        ...newMovie,
        releaseDate: new Date().toISOString().split('T')[0]
      });

      return res.status(201).json({
        success: true,
        message: 'Movie added successfully',
        movie: newMovie.getDetails()
      });
    } catch (err) {
      console.error('Error creating movie:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  updateMovie(req, res) {
    try {
      const { id } = req.params;
      const updated = db.update('movies', m => m.movieId === id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Movie not found' });
      }
      return res.json({
        success: true,
        message: 'Movie updated successfully',
        movie: new Movie(updated).getDetails()
      });
    } catch (err) {
      console.error('Error updating movie:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  deleteMovie(req, res) {
    try {
      const { id } = req.params;
      const deleted = db.delete('movies', m => m.movieId === id);
      if (!deleted) {
        return res.status(404).json({ error: 'Movie not found' });
      }
      // Also delete associated shows
      db.delete('shows', s => s.movieId === id);

      return res.json({ success: true, message: 'Movie deleted successfully' });
    } catch (err) {
      console.error('Error deleting movie:', err);
      return res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new MovieController();
