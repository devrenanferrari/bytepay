const accessToken = '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';
const domain = '0t9rr0-yq.myshopify.com';

// URL para a API GraphQL
const url = `https://${domain}/admin/api/2025-01/graphql.json`;

// Query GraphQL para obter dados dos temas
const query = `
{
  themes(first: 5) {
    edges {
      node {
        id
        name
      }
    }
  }
}
`;

// Corpo da requisição com a query GraphQL
const data = {
  query: query
};

// Configuração da requisição
const headers = {
  'Content-Type': 'application/json',
  'X-Shopify-Access-Token': accessToken
};

// Realizando a requisição POST com fetch
fetch(url, {
  method: 'POST',
  headers: headers,
  body: JSON.stringify(data)
})
  .then(response => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error('Erro na requisição: ' + response.status);
    }
  })
  .then(responseData => {
    const themes = responseData.data.themes.edges;
    themes.forEach(theme => {
      console.log(`ID do tema: ${theme.node.id}, Nome do tema: ${theme.node.name}`);
    });
  })
  .catch(error => {
    console.error('Erro ao acessar a API:', error);
  });
