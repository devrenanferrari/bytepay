const axios = require('axios');

const accessToken = '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';
const domain = '3iuvb1-cy.myshopify.com';

const variantId = 46219077648623;  // ID da variante do produto
const inventoryItemId = 48320149946607; // ID do estoque do produto
const locationId = 81141399791; // ID fixo do local onde está o estoque

// Listas de nomes e sobrenomes brasileiros
const firstNames = ["João", "Maria", "Pedro", "Ana", "Carlos", "Fernanda", "Gabriel", "Camila", "Lucas", "Beatriz"];
const lastNames = ["Silva", "Oliveira", "Souza", "Costa", "Pereira", "Lima", "Gomes", "Rodrigues", "Almeida", "Santos"];

// Função para gerar um nome completo
function generateRandomName() {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${firstName} ${lastName}`;
}

// Função para atualizar o estoque do produto
async function updateInventory() {
  try {
    await axios.post(`https://${domain}/admin/api/2024-01/inventory_levels/adjust.json`, {
      location_id: locationId,
      inventory_item_id: inventoryItemId,
      available_adjustment: 10 // Adiciona 10 unidades ao estoque
    }, {
      headers: { 'X-Shopify-Access-Token': accessToken }
    });
    console.log("Estoque atualizado com sucesso!");
  } catch (error) {
    console.error("Erro ao atualizar estoque:", error.response ? error.response.data : error.message);
  }
}

// Função para criar o pedido
async function createOrder() {
  try {
    await updateInventory(); // Atualiza o estoque antes de criar o pedido

    // Gerar nome aleatório
    const fullName = generateRandomName();
    const [firstName, ...lastNameParts] = fullName.split(" ");
    const lastName = lastNameParts.join(" ");
    const email = `${firstName.toLowerCase()}_${lastName.toLowerCase()}@gmail.com`.replace(/\s/g, '');

    const pedido = {
      order: {
        email: email,
        line_items: [
          {
            variant_id: variantId,
            quantity: 1,
            price: "249.90"
          }
        ],
        customer: {
          first_name: firstName,
          last_name: lastName,
          email: email
        },
        financial_status: "paid", // Define o pedido como pago
        fulfillment_status: "fulfilled" // Define o pedido como enviado
      }
    };

    const response = await axios.post(`https://${domain}/admin/api/2024-01/orders.json`, pedido, {
      headers: { 'X-Shopify-Access-Token': accessToken }
    });

    console.log("Pedido criado com sucesso! ID:", response.data.order.id);
  } catch (error) {
    console.error("Erro ao criar pedido:", error.response ? error.response.data : error.message);
  }
}

// Executa a função para criar o pedido
createOrder();
