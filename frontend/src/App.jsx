import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MovieCard from './components/MovieCard';
import MovieDetailsModal from './components/MovieDetailsModal';
import SeatPickerModal from './components/SeatPickerModal';
import BookingReviewModal from './components/BookingReviewModal';
import PaymentPortalModal from './components/PaymentPortalModal';
import TicketModal from './components/TicketModal';
import UserBookingsView from './components/UserBookingsView';
import HostDashboardView from './components/HostDashboardView';
import AdminDashboardView from './components/AdminDashboardView';
import TheatersView from './components/TheatersView';
import AuthModal from './components/AuthModal';
import { api } from './services/api';
import { Film, Sparkles, Star, Play, ChevronRight, ShieldCheck, Ticket as TicketIcon } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeView, setActiveView] = useState('movies');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');

  const [movies, setMovies] = useState([]);
  const [loadingMovies, setLoadingMovies] = useState(true);

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authDefaultRole, setAuthDefaultRole] = useState('user');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedShow, setSelectedShow] = useState(null);
  const [bookingReviewData, setBookingReviewData] = useState(null);
  const [paymentBooking, setPaymentBooking] = useState(null);
  const [ticketModalData, setTicketModalData] = useState(null);

  // Fetch current session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        if (api.token) {
          const res = await api.getMe();
          if (res.user) {
            setCurrentUser(res.user);
          }
        } else {
          // Auto login default demo user for frictionless instant experience
          const res = await api.login('user@demo.com', 'user123', 'user');
          api.setToken(res.token);
          setCurrentUser(res.user);
        }
      } catch (err) {
        console.error('Session init check failed:', err);
      }
    };
    checkSession();
  }, []);

  // Fetch movies
  const fetchMovies = async () => {
    try {
      setLoadingMovies(true);
      const res = await api.getMovies({
        search: searchQuery,
        genre: selectedGenre !== 'All' ? selectedGenre : ''
      });
      setMovies(res.movies || []);
    } catch (err) {
      console.error('Error fetching movies:', err);
    } finally {
      setLoadingMovies(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [searchQuery, selectedGenre]);

  // Role Switcher
  const handleQuickSwitchUser = async (targetRole) => {
    try {
      let email = 'user@demo.com';
      let pass = 'user123';
      if (targetRole === 'host') {
        email = 'host@pvr.com';
        pass = 'host123';
      } else if (targetRole === 'admin') {
        email = 'admin@eticket.com';
        pass = 'admin123';
      }

      const res = await api.login(email, pass, targetRole);
      api.setToken(res.token);
      setCurrentUser(res.user);

      if (targetRole === 'host') {
        setActiveView('host-dashboard');
      } else if (targetRole === 'admin') {
        setActiveView('admin-dashboard');
      } else {
        setActiveView('movies');
      }
    } catch (err) {
      console.error('Quick role switch failed:', err);
    }
  };

  const handleLogout = () => {
    api.setToken(null);
    setCurrentUser(null);
    setActiveView('movies');
  };

  const genres = ['All', 'Sci-Fi', 'Action', 'Drama', 'Animation', 'Adventure'];

  const heroMovie = movies.length > 0 ? movies[0] : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#08090d] text-slate-100 selection:bg-cyan-500 selection:text-black">
      
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        activeView={activeView}
        setActiveView={setActiveView}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenAuth={(role = 'user') => {
          setAuthDefaultRole(role);
          setAuthModalOpen(true);
        }}
        onLogout={handleLogout}
        onQuickSwitchUser={handleQuickSwitchUser}
      />

      {/* Main View Router */}
      <main className="flex-1 pb-16">
        
        {/* VIEW 1: EXPLORE MOVIES */}
        {activeView === 'movies' && (
          <div className="space-y-12">
            
            {/* Cinematic Hero Billboard */}
            {heroMovie && (
              <div className="relative w-full h-[460px] sm:h-[520px] overflow-hidden bg-slate-950 border-b border-white/10">
                <img
                  src={heroMovie.banner || heroMovie.poster}
                  alt={heroMovie.title}
                  className="w-full h-full object-cover object-center filter brightness-[0.6] contrast-[1.1] scale-105 animate-pulse-subtle"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#08090d] via-[#08090d]/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#08090d] via-[#08090d]/40 to-transparent" />

                <div className="absolute bottom-12 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      FEATURED PREMIERE
                    </span>
                    <span className="text-xs text-amber-300 font-bold flex items-center gap-1 bg-black/50 px-2 py-0.5 rounded-md border border-white/10">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {heroMovie.rating}
                    </span>
                    <span className="text-xs text-slate-300">{heroMovie.language} • {heroMovie.duration}</span>
                  </div>

                  <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-none max-w-2xl drop-shadow-lg">
                    {heroMovie.title}
                  </h1>

                  <p className="text-xs sm:text-sm text-slate-300 max-w-xl line-clamp-2 leading-relaxed">
                    {heroMovie.description}
                  </p>

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      onClick={() => setSelectedMovie(heroMovie)}
                      className="px-6 py-3 rounded-2xl text-xs font-bold text-black bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-300 hover:to-blue-300 shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                    >
                      <TicketIcon className="w-4 h-4 fill-black text-black" />
                      <span>Book Screening Tickets</span>
                    </button>

                    <button
                      onClick={() => setSelectedMovie(heroMovie)}
                      className="px-4 py-3 rounded-2xl text-xs font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/15 transition-all flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-white text-white" />
                      <span>More Info</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Movie Catalog Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              
              {/* Filter Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Now Showing in Theaters</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Explore current releases, blockbusters, and special IMAX formats</p>
                </div>

                {/* Genre Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  {genres.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => setSelectedGenre(genre)}
                      className={`px-3.5 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap ${
                        selectedGenre === genre
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                          : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              {/* Movies Grid */}
              {loadingMovies ? (
                <div className="py-20 text-center text-slate-500 text-xs">
                  Loading movies catalog...
                </div>
              ) : movies.length === 0 ? (
                <div className="p-12 text-center rounded-3xl glass-card border border-white/10 text-slate-400 text-xs">
                  No movies found matching your filters.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
                  {movies.map((movie) => (
                    <MovieCard
                      key={movie.movieId}
                      movie={movie}
                      onSelectMovie={(mov) => setSelectedMovie(mov)}
                    />
                  ))}
                </div>
              )}

            </div>

          </div>
        )}

        {/* VIEW 2: THEATERS */}
        {activeView === 'theaters' && (
          <TheatersView
            selectedCity={selectedCity}
            onSelectShow={(show) => setSelectedShow(show)}
            onSelectMovie={(mov) => setSelectedMovie(mov)}
          />
        )}

        {/* VIEW 3: USER BOOKINGS */}
        {activeView === 'my-bookings' && currentUser && (
          <UserBookingsView
            currentUser={currentUser}
            onSelectTicket={(ticketData) => setTicketModalData(ticketData)}
            onBackToMovies={() => setActiveView('movies')}
          />
        )}

        {/* VIEW 4: HOST DASHBOARD */}
        {activeView === 'host-dashboard' && currentUser && (
          <HostDashboardView
            currentUser={currentUser}
            onUpdateCurrentUser={(updated) => setCurrentUser(updated)}
          />
        )}

        {/* VIEW 5: ADMIN DASHBOARD */}
        {activeView === 'admin-dashboard' && currentUser && (
          <AdminDashboardView
            currentUser={currentUser}
            onLogout={handleLogout}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="w-full glass-panel border-t border-white/10 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-300 font-mono">NOVELLA E-TICKET</span>
            <span>•</span>
            <span>Online Cinema & Event Ticketing Management Platform</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Host UPI Gateway: Active</span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Pluggable Partners: Ready for Razorpay & Stripe</span>
          </div>
        </div>
      </footer>

      {/* MODAL 1: AUTH MODAL */}
      <AuthModal
        isOpen={authModalOpen}
        defaultRole={authDefaultRole}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          if (user.role === 'host') setActiveView('host-dashboard');
          else if (user.role === 'admin') setActiveView('admin-dashboard');
          else setActiveView('movies');
        }}
      />

      {/* MODAL 2: MOVIE DETAILS MODAL */}
      {selectedMovie && (
        <MovieDetailsModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          onSelectShow={(show) => {
            setSelectedMovie(null);
            setSelectedShow(show);
          }}
        />
      )}

      {/* MODAL 3: SEAT PICKER MODAL */}
      {selectedShow && (
        <SeatPickerModal
          show={selectedShow}
          currentUser={currentUser}
          onClose={() => setSelectedShow(null)}
          onRequireAuth={() => {
            setAuthDefaultRole('user');
            setAuthModalOpen(true);
          }}
          onProceedToReview={(reviewData) => {
            setSelectedShow(null);
            setBookingReviewData(reviewData);
          }}
        />
      )}

      {/* MODAL 4: BOOKING REVIEW MODAL */}
      {bookingReviewData && (
        <BookingReviewModal
          bookingData={bookingReviewData}
          onClose={() => setBookingReviewData(null)}
          onCancelHold={async () => {
            try {
              if (bookingReviewData.booking?.bookingId) {
                await api.cancelBooking(
                  bookingReviewData.booking.bookingId,
                  currentUser?.userId,
                  currentUser?.role || 'user'
                );
              }
            } catch (err) {
              console.error('Cancel hold error:', err);
            }
            setBookingReviewData(null);
          }}
          onProceedToPayment={(booking) => {
            setBookingReviewData(null);
            setPaymentBooking(booking);
          }}
        />
      )}

      {/* MODAL 5: PAYMENT PORTAL MODAL (Host UPI QR) */}
      {paymentBooking && (
        <PaymentPortalModal
          booking={paymentBooking}
          currentUser={currentUser}
          onClose={() => setPaymentBooking(null)}
          onPaymentSuccess={(result) => {
            setPaymentBooking(null);
            setTicketModalData({
              booking: result.booking,
              ticket: result.ticket
            });
          }}
        />
      )}

      {/* MODAL 6: TICKET CONFIRMATION / VIEW MODAL */}
      {ticketModalData && (
        <TicketModal
          ticketData={ticketModalData}
          onClose={() => setTicketModalData(null)}
          onGoToMyBookings={() => {
            setTicketModalData(null);
            setActiveView('my-bookings');
          }}
        />
      )}

    </div>
  );
}
