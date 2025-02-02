import fetch from 'node-fetch';

// Substitua com os seus dados
const accessToken = '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';
const domain = '3iuvb1-cy.myshopify.com';

// URL do endpoint para listar os produtos
const url = `https://${domain}/admin/api/2025-01/products.json`;

// Cabeçalhos de autorização
const headers = {
  'Content-Type': 'application/json',
  'X-Shopify-Access-Token': accessToken,
  'Accept': 'application/json',
};

// Função para buscar os produtos
const fetchProducts = async () => {
  try {
    const response = await fetch(url, { method: 'GET', headers: headers });

    if (!response.ok) {
      console.log('Erro ao listar os produtos:', response.statusText);
      return;
    }

    const data = await response.json();
    console.log(`Produtos encontrados: ${data.products.length}`);
    
    // Exibindo informações dos produtos com imagens
    data.products.forEach(product => {
      console.log(`Nome: ${product.title}, Preço: ${product.variants[0].price}`);
      
      // Verificando se o produto tem imagens
      if (product.images && product.images.length > 0) {
        console.log('Imagens:');
        product.images.forEach(image => {
          console.log(`- ${image.src}`);
        });
      } else {
        console.log('Nenhuma imagem disponível para este produto.');
      }
    });
  } catch (error) {
    console.error('Erro ao fazer a requisição:', error);
  }
};

// Chamar a função para buscar os produtos
fetchProducts();
