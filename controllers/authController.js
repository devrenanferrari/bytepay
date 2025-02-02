const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Configuração do PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'bytepay',
  password: 'admin',
  port: 5432,
});

// Função de cadastro
async function register(req, res) {
  const { username, email, storeName, password } = req.body;

  if (!username || !email || !storeName || !password) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  try {
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Este e-mail já está registrado.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await pool.query(
      'INSERT INTO users (username, email, store, password) VALUES ($1, $2, $3, $4) RETURNING *',
      [username, email, storeName, hashedPassword]
    );

    res.status(201).json({ message: 'Cadastro realizado com sucesso!', user: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao realizar cadastro. Tente novamente.' });
  }
}

// Função de login
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
  }

  try {
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(400).json({ message: 'Usuário não encontrado.' });
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Senha incorreta.' });
    }

    const token = jwt.sign({ userId: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ 
      message: 'Login realizado com sucesso!',
      token: token,
      user: user.rows[0], 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao realizar login. Tente novamente.' });
  }
}

module.exports = { register, login };