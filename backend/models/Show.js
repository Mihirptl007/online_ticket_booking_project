// Show Model - Matches Class Diagram
class Show {
  constructor({
    showId,
    movieId,
    theaterId,
    screenId,
    hostId,
    screenName = 'Screen 1',
    format = '2D',
    date,
    time,
    price = 300,
    tierPricing = { silver: 250, gold: 350, vip: 550 }
  }) {
    this.showId = showId;
    this.movieId = movieId;
    this.theaterId = theaterId;
    this.screenId = screenId;
    this.hostId = hostId;
    this.screenName = screenName;
    this.format = format;
    this.date = date; // 'YYYY-MM-DD'
    this.time = time; // 'HH:mm'
    this.price = Number(price);
    this.tierPricing = tierPricing || {
      silver: Math.round(Number(price) * 0.75),
      gold: Number(price),
      vip: Math.round(Number(price) * 1.5)
    };
  }

  // + getSeats() : List<Seat>
  getSeats(allSeats = []) {
    return allSeats.filter(seat => seat.showId === this.showId);
  }

  // + isSeatAvailable(seatId) : boolean
  isSeatAvailable(seatNumber, bookedOrHeldSeats = []) {
    return !bookedOrHeldSeats.some(s => s.showId === this.showId && s.seatNumber === seatNumber);
  }

  // + getShowDetails() : void
  getShowDetails() {
    return {
      showId: this.showId,
      movieId: this.movieId,
      theaterId: this.theaterId,
      screenId: this.screenId,
      hostId: this.hostId,
      screenName: this.screenName,
      format: this.format,
      date: this.date,
      time: this.time,
      price: this.price,
      tierPricing: this.tierPricing
    };
  }
}

module.exports = Show;
