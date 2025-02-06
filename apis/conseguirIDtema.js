const { Client } = require('pg');

function fetchThemes(accessToken, domain, userEmail) {
  const url = `https://${domain}/admin/api/2025-01/graphql.json`;
  const query = `{
    themes(first: 5) {
      edges {
        node {
          id
          name
        }
      }
    }
  }`;

  const data = { query: query };

  const headers = {
    'Content-Type': 'application/json',
    'X-Shopify-Access-Token': accessToken,
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  };

  fetch(url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(data)
  })
    .then(async (response) => {
      console.log('Resposta da API:', response.status);
      const responseBody = await response.text();
      console.log('Corpo da resposta:', responseBody);

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }

      return JSON.parse(responseBody);
    })
    .then(responseData => {
      if (!responseData.data || !responseData.data.themes) {
        throw new Error('Resposta inesperada da API');
      }

      const themes = responseData.data.themes.edges;
      themes.forEach(theme => {
        console.log(`ID do tema: ${theme.node.id}, Nome do tema: ${theme.node.name}`);

        if (theme.node.name === 'sabino-nichado') {
          const themeId = theme.node.id.split('/').pop();
          saveThemeDataToDatabase(themeId, accessToken, domain, userEmail);
        }
      });
    })
    .catch(error => {
      console.error('Erro ao acessar a API:', error);
    });
}

async function saveThemeDataToDatabase(themeId, accessToken, domain, userEmail) {
  const connectionString = 'postgresql://postgres:yTIfpgaftZdLNzahJvJlVNpMoAlwInbL@monorail.proxy.rlwy.net:12369/railway';
  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('Conectado ao banco de dados!');

    const query = `
      UPDATE users 
      SET idtheme = $1, shopifytoken = $2, urlshopify = $3 
      WHERE email = $4 
      RETURNING *;
    `;

    const res = await client.query(query, [themeId, accessToken, domain, userEmail]);

    if (res.rowCount > 0) {
      console.log(`Dados do Shopify e ID do tema atualizados para o usuário ${userEmail} com sucesso!`);
    } else {
      console.log(`Nenhum usuário encontrado com o e-mail: ${userEmail}`);
    }
  } catch (err) {
    console.error('Erro ao gravar no banco de dados:', err);
  } finally {
    await client.end();
  }
}

module.exports = { fetchThemes };
