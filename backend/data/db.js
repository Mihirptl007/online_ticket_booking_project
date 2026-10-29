const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'database.json');

// Helper to get formatted dates relative to today
const getRelativeDate = (dayOffset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  return d.toISOString().split('T')[0];
};

const initialData = {
  users: [
    {
      userId: 'usr_admin_1',
      name: 'System Administrator',
      email: 'admin@eticket.com',
      password: 'admin123',
      phone: '+91 9876543210',
      role: 'admin',
      status: 'active',
      createdAt: '2026-01-10T10:00:00.000Z'
    },
    {
      userId: 'usr_host_1',
      name: 'PVR INOX Entertainments',
      email: 'host@pvr.com',
      password: 'host123',
      phone: '+91 9811122233',
      role: 'host',
      upiId: 'pvr.cinemas@icici',
      upiName: 'PVR CINEMAS ENTERTAINMENT LTD',
      status: 'active',
      createdAt: '2026-01-12T10:00:00.000Z'
    },
    {
      userId: 'usr_host_2',
      name: 'Cinépolis Luxury Cinemas',
      email: 'host@cinepolis.com',
      password: 'host123',
      phone: '+91 9822233344',
      role: 'host',
      upiId: 'cinepolis.india@okhdfcbank',
      upiName: 'CINEPOLIS INDIA PVT LTD',
      status: 'active',
      createdAt: '2026-01-15T10:00:00.000Z'
    },
    {
      userId: 'usr_user_1',
      name: 'Mihir Sharma',
      email: 'user@demo.com',
      password: 'user123',
      phone: '+91 9899988877',
      role: 'user',
      status: 'active',
      createdAt: '2026-02-01T10:00:00.000Z'
    },
    {
      userId: 'usr_user_2',
      name: 'Aanya Patel',
      email: 'aanya@example.com',
      password: 'user123',
      phone: '+91 9877766655',
      role: 'user',
      status: 'active',
      createdAt: '2026-02-10T10:00:00.000Z'
    }
  ],
  theaters: [
    {
      theaterId: 'th_1',
      hostId: 'usr_host_1',
      name: "PVR Director's Cut, Palladium",
      location: 'High Street Phoenix, Lower Parel',
      city: 'Mumbai',
      totalScreens: 2,
      screens: [
        { screenId: 'sc_1', name: 'Audi 1 - IMAX with Laser 3D', capacity: 64, rows: 8, cols: 8 },
        { screenId: 'sc_2', name: 'Audi 2 - Dolby Atmos 4K', capacity: 64, rows: 8, cols: 8 }
      ],
      amenities: ['IMAX', 'Laser 4K', 'Dolby Atmos', 'Gourmet Dining', 'Recliner Lounges']
    },
    {
      theaterId: 'th_2',
      hostId: 'usr_host_1',
      name: 'PVR Superplex, Mall of India',
      location: 'Sector 18',
      city: 'Delhi NCR',
      totalScreens: 2,
      screens: [
        { screenId: 'sc_3', name: 'Audi 1 - 4DX Dynamic Experience', capacity: 64, rows: 8, cols: 8 },
        { screenId: 'sc_4', name: 'Audi 2 - P[XL] Giant Screen', capacity: 64, rows: 8, cols: 8 }
      ],
      amenities: ['4DX', 'P[XL]', 'Dolby 7.1', 'Valet Parking', 'Cafe']
    },
    {
      theaterId: 'th_3',
      hostId: 'usr_host_2',
      name: 'Cinépolis VIP, Forum South',
      location: 'Kanakapura Road, Konanakunte',
      city: 'Bengaluru',
      totalScreens: 1,
      screens: [
        { screenId: 'sc_5', name: 'VIP Screen 1 - Recliner Suite', capacity: 64, rows: 8, cols: 8 }
      ],
      amenities: ['VIP Recliner', 'In-Seat Butler Service', 'Dolby Atmos', 'Free Popcorn Refill']
    }
  ],
  movies: [
    {
      movieId: 'mov_1',
      title: 'Dune: Part Two',
      genre: 'Sci-Fi / Adventure / Drama',
      duration: 166,
      language: 'English',
      rating: '8.6',
      certification: 'UA 16+',
      releaseDate: '2024-03-01',
      poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
      banner: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80',
      description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future.',
      director: 'Denis Villeneuve',
      cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Javier Bardem', 'Austin Butler'],
      formats: ['IMAX 2D', '4DX', 'Dolby Atmos']
    },
    {
      movieId: 'mov_2',
      title: 'Interstellar: Special IMAX Re-Release',
      genre: 'Sci-Fi / Drama / Adventure',
      duration: 169,
      language: 'English',
      rating: '8.9',
      certification: 'UA',
      releaseDate: '2014-11-07',
      poster: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
      banner: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1600&q=80',
      description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
      director: 'Christopher Nolan',
      cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
      formats: ['IMAX 70mm', 'Dolby Atmos 4K']
    },
    {
      movieId: 'mov_3',
      title: 'Oppenheimer',
      genre: 'Biography / Drama / History',
      duration: 180,
      language: 'English',
      rating: '8.9',
      certification: 'A',
      releaseDate: '2023-07-21',
      poster: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80',
      banner: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80',
      description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during the Manhattan Project.',
      director: 'Christopher Nolan',
      cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.', 'Florence Pugh'],
      formats: ['IMAX Laser', 'Standard 2D']
    },
    {
      movieId: 'mov_4',
      title: 'Spider-Man: Across the Spider-Verse',
      genre: 'Animation / Action / Adventure',
      duration: 140,
      language: 'English / Hindi',
      rating: '8.7',
      certification: 'U',
      releaseDate: '2023-06-02',
      poster: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=800&q=80',
      banner: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1600&q=80',
      description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. When the heroes clash on how to handle a new threat, Miles must redefine what it means to be a hero.',
      director: 'Joaquim Dos Santos, Kemp Powers',
      cast: ['Shameik Moore', 'Hailee Steinfeld', 'Oscar Isaac', 'Daniel Kaluuya'],
      formats: ['3D', 'IMAX 3D', '4DX']
    },
    {
      movieId: 'mov_5',
      title: 'Inception',
      genre: 'Sci-Fi / Action / Thriller',
      duration: 148,
      language: 'English',
      rating: '8.8',
      certification: 'UA',
      releaseDate: '2010-07-16',
      poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
      banner: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
      description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project and his team to disaster.',
      director: 'Christopher Nolan',
      cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page', 'Tom Hardy'],
      formats: ['IMAX 2D', 'Dolby Cinema']
    },
    {
      movieId: 'mov_6',
      title: 'Avengers: Endgame',
      genre: 'Action / Sci-Fi / Adventure',
      duration: 181,
      language: 'English / Hindi',
      rating: '8.4',
      certification: 'UA',
      releaseDate: '2019-04-26',
      poster: 'https://images.unsplash.com/photo-1568832359672-e36cf5d74f54?auto=format&fit=crop&w=800&q=80',
      banner: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1600&q=80',
      description: 'After the devastating events of Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos actions and restore balance to the universe.',
      director: 'Anthony & Joe Russo',
      cast: ['Robert Downey Jr.', 'Chris Evans', 'Mark Ruffalo', 'Chris Hemsworth', 'Scarlett Johansson'],
      formats: ['IMAX 3D', '4DX', 'Dolby Atmos']
    }
  ],
  shows: [
    {
      showId: 'sh_101',
      movieId: 'mov_1',
      theaterId: 'th_1',
      screenId: 'sc_1',
      hostId: 'usr_host_1',
      screenName: 'Audi 1 - IMAX with Laser 3D',
      format: 'IMAX 3D',
      date: getRelativeDate(0), // Today
      time: '14:30',
      price: 450,
      tierPricing: { silver: 280, gold: 450, vip: 750 }
    },
    {
      showId: 'sh_102',
      movieId: 'mov_1',
      theaterId: 'th_1',
      screenId: 'sc_1',
      hostId: 'usr_host_1',
      screenName: 'Audi 1 - IMAX with Laser 3D',
      format: 'IMAX 3D',
      date: getRelativeDate(0), // Today
      time: '18:45',
      price: 520,
      tierPricing: { silver: 320, gold: 520, vip: 850 }
    },
    {
      showId: 'sh_103',
      movieId: 'mov_1',
      theaterId: 'th_1',
      screenId: 'sc_1',
      hostId: 'usr_host_1',
      screenName: 'Audi 1 - IMAX with Laser 3D',
      format: 'IMAX 3D',
      date: getRelativeDate(1), // Tomorrow
      time: '15:00',
      price: 450,
      tierPricing: { silver: 280, gold: 450, vip: 750 }
    },
    {
      showId: 'sh_104',
      movieId: 'mov_2',
      theaterId: 'th_1',
      screenId: 'sc_2',
      hostId: 'usr_host_1',
      screenName: 'Audi 2 - Dolby Atmos 4K',
      format: 'Dolby Atmos',
      date: getRelativeDate(0), // Today
      time: '20:15',
      price: 480,
      tierPricing: { silver: 290, gold: 480, vip: 790 }
    },
    {
      showId: 'sh_105',
      movieId: 'mov_2',
      theaterId: 'th_2',
      screenId: 'sc_4',
      hostId: 'usr_host_1',
      screenName: 'Audi 2 - P[XL] Giant Screen',
      format: 'P[XL] 2D',
      date: getRelativeDate(0),
      time: '17:30',
      price: 390,
      tierPricing: { silver: 250, gold: 390, vip: 650 }
    },
    {
      showId: 'sh_106',
      movieId: 'mov_3',
      theaterId: 'th_2',
      screenId: 'sc_3',
      hostId: 'usr_host_1',
      screenName: 'Audi 1 - 4DX Dynamic Experience',
      format: '4DX 2D',
      date: getRelativeDate(0),
      time: '19:00',
      price: 550,
      tierPricing: { silver: 350, gold: 550, vip: 890 }
    },
    {
      showId: 'sh_107',
      movieId: 'mov_4',
      theaterId: 'th_3',
      screenId: 'sc_5',
      hostId: 'usr_host_2',
      screenName: 'VIP Screen 1 - Recliner Suite',
      format: 'VIP 3D',
      date: getRelativeDate(0),
      time: '16:00',
      price: 600,
      tierPricing: { silver: 380, gold: 600, vip: 990 }
    },
    {
      showId: 'sh_108',
      movieId: 'mov_5',
      theaterId: 'th_3',
      screenId: 'sc_5',
      hostId: 'usr_host_2',
      screenName: 'VIP Screen 1 - Recliner Suite',
      format: 'VIP 2D',
      date: getRelativeDate(1), // Tomorrow
      time: '20:00',
      price: 650,
      tierPricing: { silver: 400, gold: 650, vip: 1050 }
    }
  ],
  // Seats that are booked or currently held
  seatLocks: [
    {
      showId: 'sh_101',
      seatNumber: 'B4',
      status: 'BOOKED',
      userId: 'usr_user_2',
      bookingId: 'bk_demo_101'
    },
    {
      showId: 'sh_101',
      seatNumber: 'B5',
      status: 'BOOKED',
      userId: 'usr_user_2',
      bookingId: 'bk_demo_101'
    },
    {
      showId: 'sh_102',
      seatNumber: 'D4',
      status: 'BOOKED',
      userId: 'usr_user_1',
      bookingId: 'bk_demo_102'
    }
  ],
  bookings: [
    {
      bookingId: 'bk_demo_101',
      userId: 'usr_user_2',
      showId: 'sh_101',
      movieId: 'mov_1',
      movieTitle: 'Dune: Part Two',
      theaterId: 'th_1',
      theaterName: "PVR Director's Cut, Palladium",
      screenName: 'Audi 1 - IMAX with Laser 3D',
      hostId: 'usr_host_1',
      showDate: getRelativeDate(0),
      showTime: '14:30',
      seats: [
        { seatNumber: 'B4', row: 'B', type: 'VIP', price: 750 },
        { seatNumber: 'B5', row: 'B', type: 'VIP', price: 750 }
      ],
      ticketCount: 2,
      subtotal: 1500,
      convenienceFee: 75,
      tax: 270,
      totalAmount: 1845,
      status: 'CONFIRMED',
      paymentId: 'pay_demo_101',
      bookingDate: '2026-10-07T11:20:00.000Z'
    },
    {
      bookingId: 'bk_demo_102',
      userId: 'usr_user_1',
      showId: 'sh_102',
      movieId: 'mov_1',
      movieTitle: 'Dune: Part Two',
      theaterId: 'th_1',
      theaterName: "PVR Director's Cut, Palladium",
      screenName: 'Audi 1 - IMAX with Laser 3D',
      hostId: 'usr_host_1',
      showDate: getRelativeDate(0),
      showTime: '18:45',
      seats: [
        { seatNumber: 'D4', row: 'D', type: 'Gold', price: 520 }
      ],
      ticketCount: 1,
      subtotal: 520,
      convenienceFee: 40,
      tax: 93.6,
      totalAmount: 653.6,
      status: 'CONFIRMED',
      paymentId: 'pay_demo_102',
      bookingDate: '2026-10-07T15:10:00.000Z'
    }
  ],
  payments: [
    {
      paymentId: 'pay_demo_101',
      bookingId: 'bk_demo_101',
      amount: 1845,
      method: 'HOST_UPI_QR',
      hostUpiId: 'pvr.cinemas@icici',
      hostName: 'PVR CINEMAS ENTERTAINMENT LTD',
      utrNumber: 'UPI429019284102',
      status: 'SUCCESS',
      paymentDate: '2026-10-07T11:22:15.000Z'
    },
    {
      paymentId: 'pay_demo_102',
      bookingId: 'bk_demo_102',
      amount: 653.6,
      method: 'HOST_UPI_QR',
      hostUpiId: 'pvr.cinemas@icici',
      hostName: 'PVR CINEMAS ENTERTAINMENT LTD',
      utrNumber: 'UPI429019284199',
      status: 'SUCCESS',
      paymentDate: '2026-10-07T15:11:30.000Z'
    }
  ],
  tickets: [
    {
      ticketId: 'tkt_demo_101',
      bookingId: 'bk_demo_101',
      showId: 'sh_101',
      userId: 'usr_user_2',
      movieTitle: 'Dune: Part Two',
      theaterName: "PVR Director's Cut, Palladium",
      screenName: 'Audi 1 - IMAX with Laser 3D',
      showDate: getRelativeDate(0),
      showTime: '14:30',
      seatNumbers: ['B4', 'B5'],
      totalAmount: 1845,
      QRCode: 'ETKT-bk_demo_101-sh_101-B4-B5-VERIFIED',
      status: 'VALID',
      generatedAt: '2026-10-07T11:22:16.000Z'
    },
    {
      ticketId: 'tkt_demo_102',
      bookingId: 'bk_demo_102',
      showId: 'sh_102',
      userId: 'usr_user_1',
      movieTitle: 'Dune: Part Two',
      theaterName: "PVR Director's Cut, Palladium",
      screenName: 'Audi 1 - IMAX with Laser 3D',
      showDate: getRelativeDate(0),
      showTime: '18:45',
      seatNumbers: ['D4'],
      totalAmount: 653.6,
      QRCode: 'ETKT-bk_demo_102-sh_102-D4-VERIFIED',
      status: 'VALID',
      generatedAt: '2026-10-07T15:11:31.000Z'
    }
  ]
};

class Database {
  constructor() {
    this.data = null;
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(raw);
        // Ensure all collections exist
        for (const key of Object.keys(initialData)) {
          if (!this.data[key]) {
            this.data[key] = initialData[key];
          }
        }
      } else {
        this.data = JSON.parse(JSON.stringify(initialData));
        this.save();
      }
    } catch (err) {
      console.error('Error loading database, resetting to initial seed:', err);
      this.data = JSON.parse(JSON.stringify(initialData));
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('Error persisting database:', err);
    }
  }

  get(collection) {
    return this.data[collection] || [];
  }

  set(collection, items) {
    this.data[collection] = items;
    this.save();
  }

  insert(collection, item) {
    if (!this.data[collection]) {
      this.data[collection] = [];
    }
    this.data[collection].push(item);
    this.save();
    return item;
  }

  update(collection, predicate, updater) {
    if (!this.data[collection]) return null;
    const index = this.data[collection].findIndex(predicate);
    if (index !== -1) {
      if (typeof updater === 'function') {
        this.data[collection][index] = updater(this.data[collection][index]);
      } else {
        this.data[collection][index] = { ...this.data[collection][index], ...updater };
      }
      this.save();
      return this.data[collection][index];
    }
    return null;
  }

  delete(collection, predicate) {
    if (!this.data[collection]) return false;
    const initialLength = this.data[collection].length;
    this.data[collection] = this.data[collection].filter(item => !predicate(item));
    if (this.data[collection].length !== initialLength) {
      this.save();
      return true;
    }
    return false;
  }
}

const db = new Database();

module.exports = db;
