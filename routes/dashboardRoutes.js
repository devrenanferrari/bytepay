const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { getFaturamentoTotal, getFaturamentoMensal } = require('../controllers/dashboardController');

// Rota do painel, protegida por autenticação
router.get('/painel', authenticateToken, (req, res) => {
  res.status(200).json({ message: 'Bem-vindo ao painel de controle!' });
});

// Rota para obter o faturamento total
router.get('/faturamento', getFaturamentoTotal);

// Rota para obter o faturamento mensal
router.get('/faturamento-mensal', getFaturamentoMensal);

module.exports = router;
