import React from 'react';
import { Star, Clock, Ticket } from 'lucide-react';

export default function MovieCard({ movie, onSelectMovie }) {
  return (
    <div
      onClick={() => onSelectMovie(movie)}
      className="group relative flex flex-col rounded-2xl overflow-hidden glass-card cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-500/10 border border-white/10"
    >
      {/* Poster Image */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-900">
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c14] via-transparent to-black/30" />

        {/* Rating Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-amber-300 text-xs font-bold shadow-md">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{movie.rating}</span>
        </div>

        {/* Certification Badge */}
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-white/10 backdrop-blur-md text-slate-300 border border-white/10">
          {movie.certification || 'UA'}
        </div>

        {/* Formats Tags */}
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1">
          {movie.formats && movie.formats.slice(0, 3).map((fmt, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-black/70 backdrop-blur-md text-cyan-300 border border-cyan-500/30"
            >
              {fmt}
            </span>
          ))}
        </div>
      </div>

      {/* Info Section */}
      <div className="p-4 flex flex-col flex-1 justify-between bg-gradient-to-b from-[#0e111a] to-[#0a0c14]">
        <div>
          <h3 className="font-bold text-base text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
            {movie.title}
          </h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-1">{movie.genre}</p>
        </div>

        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{movie.duration}</span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectMovie(movie);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyan-500/10 hover:bg-cyan-500 text-cyan-300 hover:text-black border border-cyan-500/30 hover:border-cyan-500 transition-all shadow-sm"
          >
            <Ticket className="w-3 h-3" />
            <span>Book</span>
          </button>
        </div>
      </div>
    </div>
  );
}
