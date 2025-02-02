const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'bytepay',
  password: 'admin',
  port: 5432,
});

// Função para obter o faturamento total
async function getFaturamentoTotal(req, res) {
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
}

// Função para obter o faturamento mensal
async function getFaturamentoMensal(req, res) {
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
}

module.exports = { getFaturamentoTotal, getFaturamentoMensal };
