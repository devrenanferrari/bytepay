const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// Rota para o cadastro de usuário
router.post('/register', register);

// Rota para o login de usuário
router.post('/login', login);

module.exports = router;
