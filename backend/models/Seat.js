// Seat Model - Matches Class Diagram
class Seat {
  constructor({
    seatId,
    showId,
    seatNumber,
    row,
    col,
    type = 'Gold', // 'Silver' | 'Gold' | 'VIP'
    price = 350,
    isAvailable = true,
    heldUntil = null,
    heldByUserId = null
  }) {
    this.seatId = seatId || `${showId}_${seatNumber}`;
    this.showId = showId;
    this.seatNumber = seatNumber;
    this.row = row || seatNumber.charAt(0);
    this.col = col || parseInt(seatNumber.slice(1), 10);
    this.type = type;
    this.price = Number(price);
    this.isAvailable = isAvailable;
    this.heldUntil = heldUntil;
    this.heldByUserId = heldByUserId;
  }

  // + reserveSeat() : boolean
  reserveSeat(userId, holdMinutes = 10) {
    if (!this.isAvailable && (!this.heldUntil || new Date(this.heldUntil) > new Date())) {
      return false;
    }
    this.isAvailable = false;
    this.heldByUserId = userId;
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + holdMinutes);
    this.heldUntil = expires.toISOString();
    return true;
  }

  // + releaseSeat() : void
  releaseSeat() {
    this.isAvailable = true;
    this.heldUntil = null;
    this.heldByUserId = null;
  }

  isHeldExpired() {
    if (!this.heldUntil) return false;
    return new Date(this.heldUntil) <= new Date();
  }
}

module.exports = Seat;
