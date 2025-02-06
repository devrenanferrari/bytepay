const { Client } = require('pg');

async function atualizarTokenBytepay(bytepayToken, email) {
  const connectionString = 'postgresql://postgres:yTIfpgaftZdLNzahJvJlVNpMoAlwInbL@monorail.proxy.rlwy.net:12369/railway';
  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('Conectado ao banco de dados!');

    const query = `
      UPDATE users 
      SET bytepaytoken = $1 
      WHERE email = $2 
      RETURNING *;
    `;

    const res = await client.query(query, [bytepayToken, userEmail]);

    if (res.rowCount > 0) {
      console.log(`Token atualizado para o usuário ${userEmail} com sucesso!`);
      return { success: true, message: 'Integração com Adquirente realizada com sucesso!' };
    } else {
      console.log(`Nenhum usuário encontrado com o e-mail: ${userEmail}`);
      return { success: false, message: 'Usuário não encontrado' };
    }
  } catch (err) {
    console.error('Erro ao gravar no banco de dados:', err);
    return { success: false, message: 'Erro ao integrar com o Adquirente' };
  } finally {
    await client.end();
  }
}

module.exports = { atualizarTokenBytepay };
