const express = require('express');
const router = express.Router();
const { processPayment } = require('../controllers/paymentController');

// Rota para processar o pagamento
router.post('/process-payment', processPayment);

module.exports = router;
