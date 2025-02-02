const axios = require('axios');

async function processPayment(req, res) {
  const paymentData = req.body;

  try {
    const paymentPayload = {
      "api-key": process.env.BYTEPAY_API_KEY,
      "email": paymentData.email,
      "telefone": paymentData.telefone,
      "nome": paymentData.nome,
      "cpf": paymentData.cpf,
      "valor": paymentData.valor,
      "id": paymentData.id,
      "installments": paymentData.installments,
      "card": paymentData.card,
      "utms": paymentData.utms,
    };

    const response = await axios.post('https://api.bytepaycash.com/v1/gateway/', paymentPayload);

    if (response.data.status === 'success') {
      res.status(200).json({ message: 'Pagamento processado com sucesso!', data: response.data });
    } else {
      res.status(400).json({ message: 'Erro ao processar pagamento.', data: response.data });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao processar pagamento. Tente novamente.' });
  }
}

module.exports = { processPayment };
