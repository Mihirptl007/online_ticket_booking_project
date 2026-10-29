const db = require('../data/db');

class ShowAndSeatService {
  constructor() {
    this.DEFAULT_ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    this.DEFAULT_COLS = 8;
  }

  // Generate full seat layout matrix with current status for a given show
  getSeatsForShow(showId) {
    this.cleanupExpiredHolds();

    const show = db.get('shows').find(s => s.showId === showId);
    if (!show) {
      throw new Error(`Show not found: ${showId}`);
    }

    const locks = db.get('seatLocks').filter(l => l.showId === showId);
    const lockMap = new Map();
    for (const lock of locks) {
      lockMap.set(lock.seatNumber, lock);
    }

    const tierPricing = show.tierPricing || {
      silver: Math.round(show.price * 0.75),
      gold: show.price,
      vip: Math.round(show.price * 1.5)
    };

    const seats = [];

    for (const row of this.DEFAULT_ROWS) {
      // Row tiers
      let type = 'Silver';
      let price = tierPricing.silver;
      if (['A', 'B'].includes(row)) {
        type = 'VIP';
        price = tierPricing.vip;
      } else if (['C', 'D', 'E'].includes(row)) {
        type = 'Gold';
        price = tierPricing.gold;
      }

      for (let col = 1; col <= this.DEFAULT_COLS; col++) {
        const seatNumber = `${row}${col}`;
        const lock = lockMap.get(seatNumber);

        let status = 'AVAILABLE'; // 'AVAILABLE' | 'HELD' | 'BOOKED'
        let heldBy = null;
        let heldUntil = null;

        if (lock) {
          if (lock.status === 'BOOKED') {
            status = 'BOOKED';
          } else if (lock.status === 'HELD') {
            if (new Date(lock.expiresAt) > new Date()) {
              status = 'HELD';
              heldBy = lock.userId;
              heldUntil = lock.expiresAt;
            }
          }
        }

        seats.push({
          seatId: `${showId}_${seatNumber}`,
          showId,
          seatNumber,
          row,
          col,
          type,
          price,
          status,
          heldBy,
          heldUntil
        });
      }
    }

    return {
      showId,
      show,
      totalSeats: seats.length,
      availableCount: seats.filter(s => s.status === 'AVAILABLE').length,
      seats
    };
  }

  // Check seat availability
  checkSeatAvailability(showId, seatNumbers) {
    this.cleanupExpiredHolds();
    const locks = db.get('seatLocks').filter(l => l.showId === showId);
    const unavailableSeats = [];

    for (const seatNo of seatNumbers) {
      const lock = locks.find(l => l.seatNumber === seatNo);
      if (lock) {
        if (lock.status === 'BOOKED') {
          unavailableSeats.push({ seatNumber: seatNo, reason: 'Already booked' });
        } else if (lock.status === 'HELD' && new Date(lock.expiresAt) > new Date()) {
          unavailableSeats.push({ seatNumber: seatNo, reason: 'Currently held by another user' });
        }
      }
    }

    return {
      isAvailable: unavailableSeats.length === 0,
      unavailableSeats
    };
  }

  // Hold / Reserve selected seats temporarily (10-minute hold TTL)
  holdSeats(showId, seatNumbers, userId, holdMinutes = 10) {
    this.cleanupExpiredHolds();

    const availability = this.checkSeatAvailability(showId, seatNumbers);
    if (!availability.isAvailable) {
      return {
        success: false,
        message: 'Some of the selected seats are no longer available',
        unavailableSeats: availability.unavailableSeats
      };
    }

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + holdMinutes);
    const expiresAtIso = expiresAt.toISOString();

    const seatLocks = db.get('seatLocks');

    // Remove any prior active holds for this user on this show to refresh
    const filteredLocks = seatLocks.filter(
      l => !(l.showId === showId && l.userId === userId && l.status === 'HELD')
    );

    // Add new hold locks
    for (const seatNo of seatNumbers) {
      filteredLocks.push({
        showId,
        seatNumber: seatNo,
        status: 'HELD',
        userId,
        expiresAt: expiresAtIso
      });
    }

    db.set('seatLocks', filteredLocks);

    return {
      success: true,
      message: `Seats held for ${holdMinutes} minutes`,
      heldSeats: seatNumbers,
      expiresAt: expiresAtIso,
      expiresInSeconds: holdMinutes * 60
    };
  }

  // Release held seats
  releaseSeats(showId, seatNumbers, userId) {
    const seatLocks = db.get('seatLocks');
    const updated = seatLocks.filter(
      l => !(l.showId === showId && seatNumbers.includes(l.seatNumber) && l.userId === userId && l.status === 'HELD')
    );
    db.set('seatLocks', updated);
    return { success: true };
  }

  // Permanently mark seats as booked
  confirmSeatBooking(showId, seatNumbers, userId, bookingId) {
    const seatLocks = db.get('seatLocks');
    // Remove temporary holds
    const updated = seatLocks.filter(
      l => !(l.showId === showId && seatNumbers.includes(l.seatNumber))
    );
    // Add permanent booked entries
    for (const seatNo of seatNumbers) {
      updated.push({
        showId,
        seatNumber: seatNo,
        status: 'BOOKED',
        userId,
        bookingId,
        bookedAt: new Date().toISOString()
      });
    }
    db.set('seatLocks', updated);
    return { success: true };
  }

  // Cleanup expired holds
  cleanupExpiredHolds() {
    const now = new Date();
    const seatLocks = db.get('seatLocks');
    const validLocks = seatLocks.filter(l => {
      if (l.status === 'HELD') {
        return new Date(l.expiresAt) > now;
      }
      return true; // Keep booked
    });

    if (validLocks.length !== seatLocks.length) {
      db.set('seatLocks', validLocks);
    }
  }
}

module.exports = new ShowAndSeatService();
