import axios from 'axios';

const accessToken = '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';
const domain = '3iuvb1-cy.myshopify.com';

// Função para buscar o Location ID
async function getLocationId() {
  try {
    const response = await axios.get(`https://${domain}/admin/api/2024-01/locations.json`, {
      headers: { 'X-Shopify-Access-Token': accessToken }
    });
    console.log("Location ID:", response.data.locations.map(loc => ({ id: loc.id, name: loc.name })));
  } catch (error) {
    console.error("Erro ao obter Location ID:", error.response?.data || error.message);
  }
}

// Função para obter os produtos e suas variantes
async function getProducts() {
  try {
    const response = await axios.get(`https://${domain}/admin/api/2024-01/products.json`, {
      headers: { 'X-Shopify-Access-Token': accessToken }
    });

    response.data.products.forEach(product => {
      console.log(`Produto: ${product.title}`);
      product.variants.forEach(variant => {
        console.log(`  - Variant ID: ${variant.id}, Inventory Item ID: ${variant.inventory_item_id}, Preço: ${variant.price}`);
      });
    });
  } catch (error) {
    console.error("Erro ao obter produtos:", error.response?.data || error.message);
  }
}

// Executa as funções para buscar os IDs necessários
getLocationId();
getProducts();
