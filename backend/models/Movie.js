// Movie Model - Matches Class Diagram
class Movie {
  constructor({
    movieId,
    title,
    genre,
    duration,
    language,
    rating,
    certification = 'UA',
    poster = '',
    banner = '',
    description = '',
    director = '',
    cast = [],
    formats = ['2D']
  }) {
    this.movieId = movieId;
    this.title = title;
    this.genre = genre;
    this.duration = Number(duration);
    this.language = language;
    this.rating = rating;
    this.certification = certification;
    this.poster = poster;
    this.banner = banner;
    this.description = description;
    this.director = director;
    this.cast = Array.isArray(cast) ? cast : [cast];
    this.formats = Array.isArray(formats) ? formats : [formats];
  }

  // + getDetails() : void
  getDetails() {
    return {
      movieId: this.movieId,
      title: this.title,
      genre: this.genre,
      duration: `${Math.floor(this.duration / 60)}h ${this.duration % 60}m`,
      durationMinutes: this.duration,
      language: this.language,
      rating: this.rating,
      certification: this.certification,
      poster: this.poster,
      banner: this.banner,
      description: this.description,
      director: this.director,
      cast: this.cast,
      formats: this.formats
    };
  }

  // + getShows() : List<Show>
  getShows(allShows = []) {
    return allShows.filter(show => show.movieId === this.movieId);
  }
}

module.exports = Movie;
