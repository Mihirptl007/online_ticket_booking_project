import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Film, Sparkles, Clock, Ticket } from 'lucide-react';
import { api } from '../services/api';

export default function TheatersView({ selectedCity, onSelectShow, onSelectMovie }) {
  const [theaters, setTheaters] = useState([]);
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTheaterData = async () => {
      try {
        setLoading(true);
        const [thRes, shRes, movRes] = await Promise.all([
          api.getTheaters({ city: selectedCity !== 'All Cities' ? selectedCity : '' }),
          api.getShows(),
          api.getMovies()
        ]);
        setTheaters(thRes.theaters || []);
        setShows(shRes.shows || []);
        setMovies(movRes.movies || []);
      } catch (err) {
        console.error('Error fetching theaters view data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTheaterData();
  }, [selectedCity]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Building2 className="w-6 h-6 text-cyan-400" />
          <span>Cinemas & Theaters in {selectedCity}</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Explore world-class luxury auditoriums with IMAX with Laser, 4DX, and Dolby Atmos audio
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500 text-xs">
          Loading theaters...
        </div>
      ) : theaters.length === 0 ? (
        <div className="p-12 text-center rounded-2xl glass-card border border-white/10 text-slate-400 text-xs">
          No theaters found in {selectedCity}. Try selecting "All Cities".
        </div>
      ) : (
        <div className="space-y-6">
          {theaters.map((theater) => {
            const theaterShows = shows.filter(s => s.theaterId === theater.theaterId);

            return (
              <div
                key={theater.theaterId}
                className="p-6 rounded-3xl glass-card border border-white/10 space-y-4"
              >
                {/* Theater Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/5">
                  <div>
                    <h3 className="text-lg font-bold text-white">{theater.name}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{theater.location}, {theater.city}</span>
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {theater.amenities?.map((amenity, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-white/5 text-cyan-300 border border-white/10"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Scheduled Shows */}
                <div>
                  <h4 className="text-xs uppercase font-bold text-slate-400 mb-3 flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5 text-cyan-400" />
                    Now Showing at This Venue
                  </h4>

                  {theaterShows.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No scheduled shows for this theater currently.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {theaterShows.map((show) => {
                        const movie = movies.find(m => m.movieId === show.movieId);

                        return (
                          <div
                            key={show.showId}
                            onClick={() => onSelectShow(show)}
                            className="p-3.5 rounded-2xl bg-white/[0.02] hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/30 transition-all cursor-pointer group flex gap-3"
                          >
                            {movie && (
                              <img
                                src={movie.poster}
                                alt={show.movieTitle}
                                className="w-12 h-16 object-cover rounded-lg bg-slate-900 shrink-0"
                              />
                            )}

                            <div className="flex-1 flex flex-col justify-between">
                              <div>
                                <h5 className="font-bold text-xs text-white group-hover:text-cyan-300 line-clamp-1">
                                  {show.movieTitle}
                                </h5>
                                <p className="text-[10px] text-cyan-400 font-semibold mt-0.5">
                                  {show.format} • {show.screenName}
                                </p>
                              </div>

                              <div className="flex items-center justify-between pt-1">
                                <span className="text-xs font-mono font-bold text-white">
                                  {show.time}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  ₹{show.tierPricing?.silver || show.price} onwards
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
