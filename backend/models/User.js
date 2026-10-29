// User Model - Matches Class Diagram
class User {
  constructor({ userId, name, email, phone, password, role = 'user', status = 'active', upiId = '', upiName = '', createdAt }) {
    this.userId = userId;
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.password = password;
    this.role = role; // 'user' | 'host' | 'admin'
    this.status = status; // 'active' | 'blocked'
    this.upiId = upiId; // For Host UPI QR payments
    this.upiName = upiName;
    this.createdAt = createdAt || new Date().toISOString();
  }

  // + login() : boolean
  login(inputPassword) {
    if (this.status === 'blocked') {
      return { success: false, message: 'Account is blocked by administrator' };
    }
    const isValid = this.password === inputPassword;
    return {
      success: isValid,
      message: isValid ? 'Login successful' : 'Invalid email or password'
    };
  }

  // + register() : void
  register() {
    this.status = 'active';
    this.createdAt = new Date().toISOString();
  }

  // + bookTicket(showId, seats) : Booking
  bookTicket(showId, seats, totalAmount) {
    return {
      userId: this.userId,
      showId,
      seats,
      totalAmount,
      status: 'PENDING',
      bookingDate: new Date().toISOString()
    };
  }

  toSafeObject() {
    return {
      userId: this.userId,
      name: this.name,
      email: this.email,
      phone: this.phone,
      role: this.role,
      status: this.status,
      upiId: this.upiId,
      upiName: this.upiName,
      createdAt: this.createdAt
    };
  }
}

module.exports = User;
