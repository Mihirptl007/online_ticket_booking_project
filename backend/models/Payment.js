// Payment Model - Matches Class Diagram
class Payment {
  constructor({
    paymentId,
    bookingId,
    amount,
    method = 'HOST_UPI_QR', // 'HOST_UPI_QR' | 'GATEWAY'
    status = 'PENDING', // 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED'
    paymentDate = new Date().toISOString(),
    hostUpiId = '',
    hostName = '',
    utrNumber = '',
    gatewayRef = ''
  }) {
    this.paymentId = paymentId;
    this.bookingId = bookingId;
    this.amount = Number(amount);
    this.method = method;
    this.status = status;
    this.paymentDate = paymentDate;
    this.hostUpiId = hostUpiId;
    this.hostName = hostName;
    this.utrNumber = utrNumber;
    this.gatewayRef = gatewayRef;
  }

  // + pay() : boolean
  pay(details = {}) {
    if (this.status === 'SUCCESS') return true;
    this.status = 'SUCCESS';
    this.utrNumber = details.utrNumber || `UPI${Date.now()}`;
    this.paymentDate = new Date().toISOString();
    return true;
  }

  // + refund() : void
  refund() {
    this.status = 'REFUNDED';
  }

  // + getPaymentDetails() : void
  getPaymentDetails() {
    return {
      paymentId: this.paymentId,
      bookingId: this.bookingId,
      amount: this.amount,
      method: this.method,
      status: this.status,
      paymentDate: this.paymentDate,
      hostUpiId: this.hostUpiId,
      hostName: this.hostName,
      utrNumber: this.utrNumber,
      gatewayRef: this.gatewayRef
    };
  }
}

module.exports = Payment;
