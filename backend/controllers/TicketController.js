const ticketService = require('../services/TicketService');

class TicketController {
  getTicketById(req, res) {
    try {
      const { id } = req.params;
      const ticket = ticketService.getTicketById(id);
      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }
      return res.json({ success: true, ticket });
    } catch (err) {
      console.error('Error fetching ticket:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  scanTicket(req, res) {
    try {
      const { query } = req.body;
      if (!query) {
        return res.status(400).json({ error: 'Ticket ID or QR code query is required' });
      }

      const result = ticketService.scanAndVerifyTicket(query);
      return res.json(result);
    } catch (err) {
      console.error('Error scanning ticket:', err);
      return res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new TicketController();
