import React, { useState, useEffect } from 'react';
import { X, Star, Clock, Calendar, MapPin, Sparkles, Film, Play, ChevronRight, Info } from 'lucide-react';
import { api } from '../services/api';

export default function MovieDetailsModal({ movie, onClose, onSelectShow }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [shows, setShows] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);

  // Generate date pills (Today, Tomorrow, +2 days)
  const generateDates = () => {
    const dates = [];
    for (let i = 0; i < 4; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      dates.push({ iso, label: dayName, sub: dayNum });
    }
    return dates;
  };

  const dateOptions = generateDates();

  useEffect(() => {
    if (dateOptions.length > 0 && !selectedDate) {
      setSelectedDate(dateOptions[0].iso);
    }
  }, []);

  useEffect(() => {
    if (!movie) return;
    const fetchShowsAndTheaters = async () => {
      setLoading(true);
      try {
        const [showsRes, theatersRes] = await Promise.all([
          api.getShows({ movieId: movie.movieId, date: selectedDate }),
          api.getTheaters()
        ]);
        setShows(showsRes.shows || []);
        setTheaters(theatersRes.theaters || []);
      } catch (err) {
        console.error('Error fetching shows for movie:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchShowsAndTheaters();
  }, [movie, selectedDate]);

  if (!movie) return null;

  // Group shows by theater
  const showsByTheater = {};
  shows.forEach((show) => {
    if (!showsByTheater[show.theaterId]) {
      const th = theaters.find(t => t.theaterId === show.theaterId) || {
        name: show.theaterName || 'Cinema Screen',
        location: show.theaterLocation || 'City Center',
        city: show.theaterCity || ''
      };
      showsByTheater[show.theaterId] = {
        theater: th,
        showsList: []
      };
    }
    showsByTheater[show.theaterId].showsList.push(show);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-4xl my-auto glass-panel rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 hover:bg-white/20 text-white/80 hover:text-white transition-all backdrop-blur-md border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Backdrop Banner */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-950">
          <img
            src={movie.banner || movie.poster}
            alt={movie.title}
            className="w-full h-full object-cover object-center filter brightness-[0.7]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090a0f] via-[#090a0f]/60 to-transparent" />

          {/* Floating Movie Specs on Banner */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="hidden sm:block w-28 h-40 rounded-xl overflow-hidden shadow-2xl border border-white/20 shrink-0">
              <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-400 text-black flex items-center gap-1 shadow">
                  <Star className="w-3.5 h-3.5 fill-black text-black" />
                  {movie.rating}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-white/10 text-white border border-white/20">
                  {movie.certification || 'UA'}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {movie.language}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                {movie.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 flex items-center gap-3">
                <span>{movie.genre}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  {movie.duration}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          
          {/* Synopsis & Cast */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
            <div className="md:col-span-2 space-y-2">
              <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                Synopsis
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {movie.description || 'Experience this cinematic masterpiece in high-definition immersive audio and giant screen formats.'}
              </p>
            </div>

            <div className="space-y-3 border-t md:border-t-0 md:border-l border-white/10 md:pl-6 pt-3 md:pt-0">
              <div>
                <p className="text-[11px] uppercase font-bold tracking-wider text-slate-500">Director</p>
                <p className="text-xs font-semibold text-slate-200 mt-0.5">{movie.director || 'Visionary Filmmaker'}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase font-bold tracking-wider text-slate-500">Starring</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {movie.cast && movie.cast.map((actor, idx) => (
                    <span key={idx} className="text-[11px] px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
                      {actor}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Date Selector Bar */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-cyan-400" />
                Select Screening Date
              </h4>
              <span className="text-[11px] text-slate-500">Prices starting ₹280</span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {dateOptions.map((dateObj) => (
                <button
                  key={dateObj.iso}
                  onClick={() => setSelectedDate(dateObj.iso)}
                  className={`flex flex-col items-center min-w-[90px] py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                    selectedDate === dateObj.iso
                      ? 'border-cyan-400 bg-cyan-500/20 text-white shadow-lg shadow-cyan-500/20'
                      : 'border-white/10 bg-white/5 text-slate-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  <span className="font-bold text-xs">{dateObj.label}</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">{dateObj.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Theaters & Showtimes */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
              <Film className="w-4 h-4 text-cyan-400" />
              Available Theaters & Shows
            </h4>

            {loading ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                Loading theater schedules...
              </div>
            ) : Object.keys(showsByTheater).length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-white/5 border border-white/10">
                <Film className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold text-slate-300">No shows scheduled for this date</p>
                <p className="text-xs text-slate-500 mt-1">Please pick another date from the carousel above.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.values(showsByTheater).map(({ theater, showsList }) => (
                  <div
                    key={theater.theaterId}
                    className="p-4 rounded-2xl glass-card border border-white/10 space-y-3"
                  >
                    {/* Theater Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-white/5">
                      <div>
                        <h5 className="font-bold text-sm text-white flex items-center gap-2">
                          {theater.name}
                        </h5>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-cyan-400" />
                          <span>{theater.location}, {theater.city}</span>
                        </p>
                      </div>

                      {theater.amenities && (
                        <div className="flex flex-wrap gap-1 mt-1 sm:mt-0">
                          {theater.amenities.slice(0, 3).map((amenity, idx) => (
                            <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/5">
                              {amenity}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Showtimes Pills */}
                    <div className="flex flex-wrap gap-2.5 pt-1">
                      {showsList.map((show) => (
                        <button
                          key={show.showId}
                          onClick={() => {
                            onClose();
                            onSelectShow(show);
                          }}
                          className="group relative flex flex-col items-center py-2 px-3.5 rounded-xl bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400/60 transition-all text-left"
                        >
                          <span className="text-xs font-extrabold text-white group-hover:text-cyan-300">
                            {show.time}
                          </span>
                          <span className="text-[10px] font-semibold text-cyan-400/90 mt-0.5">
                            {show.format || 'IMAX 2D'}
                          </span>
                          <span className="text-[9px] text-slate-400 mt-0.5">
                            ₹{show.tierPricing?.silver || show.price} onwards
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
