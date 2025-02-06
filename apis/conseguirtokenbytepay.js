const { Client } = require('pg');

// Função para atualizar o bytepayToken no banco de dados
async function atualizarTokenBytepay(bytepayToken, userEmail) {
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
            console.log(`BytePayToken atualizado com sucesso para o usuário ${userEmail}`);
            return { success: true, message: 'Token atualizado com sucesso!' };
        } else {
            console.log(`Nenhum usuário encontrado com o e-mail: ${userEmail}`);
            return { success: false, message: 'Usuário não encontrado' };
        }
    } catch (err) {
        console.error('Erro ao atualizar o bytepaytoken:', err);
        return { success: false, message: 'Erro ao atualizar o token no banco de dados' };
    } finally {
        await client.end();
    }
}

module.exports = { atualizarTokenBytepay };
