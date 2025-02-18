// Importando os módulos necessários
const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config(); // Carregar variáveis de ambiente do arquivo .env

// Criação da instância do Express
const app = express();

// Configuração do servidor
app.use(express.static('public')); // Servir arquivos estáticos
const port = 3004;  // Ou qualquer outra porta de sua preferência

// Configuração do PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'monorail.proxy.rlwy.net',
  database: 'railway',
  password: 'yTIfpgaftZdLNzahJvJlVNpMoAlwInbL',
  port: 12369,
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Rota para o cadastro de usuário
app.post('/api/register', async (req, res) => {
  const { username, email, storeName, password } = req.body;

  if (!username || !email || !storeName || !password) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  try {
    // Verifica se o e-mail já existe
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Este e-mail já está registrado.' });
    }

    // Criptografar a senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Inserir o novo usuário no banco
    const result = await pool.query(
      'INSERT INTO users (username, email, store, password) VALUES ($1, $2, $3, $4) RETURNING *',
      [username, email, storeName, hashedPassword]
    );

    res.status(201).json({ message: 'Cadastro realizado com sucesso!', user: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao realizar cadastro. Tente novamente.' });
  }
});

// Rota para o login de usuário
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
  }

  try {
    // Verificar se o usuário existe
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(400).json({ message: 'Usuário não encontrado.' });
    }

    // Comparar a senha criptografada
    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Senha incorreta.' });
    }

    // Gerar um token JWT
    const token = jwt.sign({ userId: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Retorna a resposta com o token JWT
    res.status(200).json({ 
      message: 'Login realizado com sucesso!',
      token: token,
      user: user.rows[0], 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao realizar login. Tente novamente.' });
  }
});

// Middleware para verificar o token JWT
function authenticateToken(req, res, next) {
  const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Acesso negado. Token não encontrado.' });

  // Verificar se o token é válido
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token inválido.' });
    req.user = user;
    next(); // Chama a próxima função caso o token seja válido
  });
}

// Rota do painel, protegida por autenticação
app.get('/api/painel', authenticateToken, (req, res) => {
  res.status(200).json({ message: 'Bem-vindo ao painel de controle!' });
});

// Rota para obter o faturamento total
app.get('/api/faturamento', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT SUM(amount) AS total_faturamento
      FROM payments
      WHERE payment_status = 'concluído'
    `);
    const totalFaturamento = result.rows[0].total_faturamento;
    res.status(200).json({ totalFaturamento });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao obter faturamento.' });
  }
});

// Rota para obter o faturamento mensal
app.get('/api/faturamento-mensal', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        TO_CHAR(payment_date, 'YYYY-MM') AS mes,
        SUM(amount) AS faturamento
      FROM payments
      WHERE payment_status = 'concluído'
      GROUP BY mes
      ORDER BY mes DESC
    `);
    const meses = result.rows.map(row => row.mes);
    const faturamentoMensal = result.rows.map(row => row.faturamento);
    res.status(200).json({ meses, faturamentoMensal });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao obter faturamento mensal.' });
  }
});

// Rota para processar o pagamento
app.post('/api/process-payment', async (req, res) => {
  const { email, telefone, nome, cpf, valor, id, installments, card, utms } = req.body;

  try {
    // Montando o payload corretamente conforme a documentação
    const paymentPayload = {
      "api-key": bytepaytoken,  // Certifique-se de que esta variável contém a chave correta
      "email": email,
      "telefone": telefone,
      "nome": nome,
      "cpf": cpf,
      "valor": parseFloat(valor), // Converte para número com ponto decimal
      "id": id,
      "installments": installments,
      "card": {
        "number": card.number,
        "holderName": card.holderName,
        "expirationMonth": card.expirationMonth,
        "expirationYear": card.expirationYear,
        "cvv": card.cvv
      },
      "utms": {
        "utm_source": utms?.utm_source || '',
        "utm_medium": utms?.utm_medium || '',
        "utm_campaign": utms?.utm_campaign || '',
        "utm_term": utms?.utm_term || '',
        "utm_content": utms?.utm_content || ''
      }
    };

    // Fazendo a requisição para a API correta
    const response = await axios.post('https://api.bytepaycash.com/v1/gateway/card/', paymentPayload);

    // Verifica se o pagamento foi processado com sucesso
    if (response.data.success) {
      return res.status(200).json({ message: 'Pagamento processado com sucesso!', data: response.data });
    } else {
      return res.status(400).json({ message: 'Erro ao processar pagamento.', data: response.data });
    }
  } catch (error) {
    console.error("Erro ao processar pagamento:", error.response?.data || error.message);
    return res.status(500).json({ message: 'Erro ao processar pagamento. Tente novamente.' });
  }
});

// Rota para gerar um pagamento via PIX
app.post('/api/process-pix', async (req, res) => {
    const { bytepaytoken, nome, cpf, telefone, email, valor, utms } = req.body;

    try {
        const pixPayload = {
            "api-key": bytepaytoken,
            "amount": parseFloat(valor), // Converter para número
            "client": {
                "name": nome,
                "document": cpf.replace(/\D/g, ''),
                "telefone": telefone,
                "email": email
            },
            "utms": utms || {}
        };

        const response = await axios.post('https://api.bytepaycash.com/v1/gateway/', pixPayload);

        console.log("Resposta da BytePay:", response.data); // Debug

        if (response.data?.status === 'success' && response.data.paymentCode) {
            return res.status(200).json({
                status: 'success',  // 🔹 Garante que o frontend trate como sucesso
                message: 'Pix gerado com sucesso!',
                paymentCode: response.data.paymentCode,
                idTransaction: response.data.idTransaction,
                paymentCodeBase64: response.data.paymentCodeBase64
            });
        } else {
            console.error("Erro na API BytePay:", response.data);
            return res.status(400).json({ message: 'Erro ao gerar Pix', details: response.data });
        }
    } catch (error) {
        console.error("Erro ao chamar a API BytePay:", error.response?.data || error.message);
        return res.status(500).json({ message: 'Erro ao processar Pix.', error: error.response?.data || error.message });
    }
});




// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

// Rota para cadastrar um produto
app.post('/api/products', authenticateToken, async (req, res) => {
  const { name, description, price, category, stock } = req.body;

  if (!name || !description || !price || !category || !stock) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO products (name, description, price, category, stock) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, description, price, category, stock]
    );
    res.status(201).json({ message: 'Produto cadastrado com sucesso!', product: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao cadastrar produto.' });
  }
});

// Rota para listar todos os produtos
app.get('/api/products', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao listar produtos.' });
  }
});

// Rota para atualizar um produto
app.put('/api/products/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, description, price, category, stock } = req.body;

  if (!name || !description || !price || !category || !stock) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  try {
    const result = await pool.query(
      'UPDATE products SET name = $1, description = $2, price = $3, category = $4, stock = $5 WHERE id = $6 RETURNING *',
      [name, description, price, category, stock, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }

    res.status(200).json({ message: 'Produto atualizado com sucesso!', product: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao atualizar produto.' });
  }
});

// Rota para excluir um produto
app.delete('/api/products/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }

    res.status(200).json({ message: 'Produto excluído com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao excluir produto.' });
  }
});

// Endpoint para integrar com Shopify
app.post('/api/integrar-shopify', (req, res) => {
  const { domain, token } = req.body;

  // Aqui você pode salvar os dados no banco de dados
  // Exemplo fictício:
  // db.saveShopifyIntegration(domain, token);

  res.status(200).json({ message: 'Integração com Shopify realizada com sucesso' });
});

// Endpoint para buscar produtos
app.post('/get-products', async (req, res) => {
  const { accessToken, domain } = req.body;

  if (!accessToken || !domain) {
    return res.status(400).json({ error: 'Access Token e Domain são obrigatórios' });
  }

  const url = `https://${domain}/admin/api/2025-01/products.json`;

  // Cabeçalhos de autorização
  const headers = {
    'Content-Type': 'application/json',
    'X-Shopify-Access-Token': accessToken,
    'Accept': 'application/json',
  };

  try {
    // Realizando a requisição para obter os produtos
    const response = await fetch(url, { method: 'GET', headers });

    if (!response.ok) {
      return res.status(response.status).json({ error: response.statusText });
    }

    const data = await response.json();
    
    // Preparando a resposta com os produtos e suas imagens
    const products = data.products.map(product => {
      return {
        name: product.title,
        price: product.variants[0].price,
        images: product.images.length > 0 ? product.images.map(image => image.src) : 'Nenhuma imagem disponível'
      };
    });

    return res.json({ products });
  } catch (error) {
    console.error('Erro ao fazer a requisição:', error);
    return res.status(500).json({ error: 'Erro interno ao buscar os produtos' });
  }
});

// Importando a função fetchThemes do arquivo apis/conseguirIDtema.js
const { fetchThemes } = require('./apis/conseguirIDtema');

app.get('/getThemes', (req, res) => {
    const accessToken = req.query.accessToken;  // Obtendo o accessToken da URL
    const domain = req.query.domain;  // Obtendo o domain da URL
    const userEmail = req.query.userEmail;  // Obtendo o userEmail da URL

    if (!accessToken || !domain || !userEmail) {
        return res.status(400).json({ error: 'AccessToken, domain e userEmail são necessários!' });
    }

    // Chamando a função com os parâmetros recebidos
    fetchThemes(accessToken, domain, userEmail);

    res.json({ message: 'Função chamada com sucesso! Verifique o console.' });
});

// Rota para integração do BytePay
// Importando a função atualizarTokenBytepay do arquivo apis/conseguirtokenbytepay.js
const { atualizarTokenBytepay } = require('./apis/conseguirtokenbytepay');

app.post('/api/integrations', async (req, res) => {
    const { bytepayToken, email } = req.body;  // Obtendo o bytepayToken e o userEmail do corpo da requisição

    try {
        // Chamando a função com os parâmetros recebidos
        await atualizarTokenBytepay(bytepayToken, email);

        res.json({ message: 'Integração com Adquirente realizada com sucesso!' });
    } catch (error) {
        console.error('Erro ao integrar com o Adquirente:', error);
        res.status(500).json({ error: 'Erro ao integrar com o Adquirente' });
    }
});

// Rota para buscar o bytepaytoken
app.get('/buscar-bytepaytoken', async (req, res) => {
  const { email } = req.query; // Captura o email enviado como parâmetro da requisição

  try {
    // Consulta no banco de dados para pegar o bytepaytoken
    const result = await pool.query('SELECT bytepaytoken FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const bytepaytoken = result.rows[0].bytepaytoken;

    // Retorna o token encontrado
    return res.json({ bytepaytoken });

  } catch (error) {
    console.error('Erro ao buscar o bytepaytoken:', error);
    return res.status(500).json({ error: 'Erro ao buscar o token.' });
  }
});

// Rota de pagamento que usa o bytepaytoken
app.post('/processar-pagamento', async (req, res) => {
  const { email, valor } = req.body; // Pega o email e valor do corpo da requisição
  
  try {
    // Chama a rota para pegar o bytepaytoken
    const response = await fetch(`http://localhost:3000/buscar-bytepaytoken?email=${email}`);
    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: data.error });
    }

    const bytepaytoken = data.bytepaytoken;

    // Montando o payload para a requisição POST para a API da BytePayCash
    const paymentPayload = {
      "api-key": bytepaytoken, 
      "email": email,
      "valor": valor,
    };

    // Realiza a requisição para a BytePayCash
    const paymentResponse = await axios.post('https://api.bytepaycash.com/v1/gateway/', paymentPayload);

    // Verifica a resposta da BytePayCash
    if (paymentResponse.data.status === 'success') {
      res.status(200).json({ message: 'Pagamento processado com sucesso!', data: paymentResponse.data });
    } else {
      res.status(400).json({ message: 'Erro ao processar pagamento.', data: paymentResponse.data });
    }
  } catch (error) {
    console.error('Erro ao processar pagamento:', error);
    res.status(500).json({ message: 'Erro ao processar pagamento. Tente novamente.' });
  }
});



