// Theater Model - Matches Class Diagram
class Theater {
  constructor({
    theaterId,
    hostId,
    name,
    location,
    city = 'Mumbai',
    totalScreens = 1,
    screens = [],
    amenities = []
  }) {
    this.theaterId = theaterId;
    this.hostId = hostId;
    this.name = name;
    this.location = location;
    this.city = city;
    this.totalScreens = Number(totalScreens);
    this.screens = screens;
    this.amenities = amenities;
  }

  // + getShows() : List<Show>
  getShows(allShows = []) {
    return allShows.filter(show => show.theaterId === this.theaterId);
  }

  // + getTheaterDetails() : void
  getTheaterDetails() {
    return {
      theaterId: this.theaterId,
      hostId: this.hostId,
      name: this.name,
      location: this.location,
      city: this.city,
      totalScreens: this.totalScreens,
      screens: this.screens,
      amenities: this.amenities
    };
  }
}

module.exports = Theater;
