const { Client } = require('pg');

function fetchThemes(accessToken, domain) {
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
    .then(response => {
      console.log('Resposta da API:', response);
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

        if (theme.node.name === 'sabino-nichado') {
          const themeId = theme.node.id.split('/').pop();
          saveThemeIdToDatabase(themeId);
        }
      });
    })
    .catch(error => {
      console.error('Erro ao acessar a API:', error);
    });
}

function saveThemeIdToDatabase(themeId) {
  const connectionString = 'postgresql://postgres:yTIfpgaftZdLNzahJvJlVNpMoAlwInbL@monorail.proxy.rlwy.net:12369/railway';
  const client = new Client({ connectionString: connectionString });

  client.connect((err) => {
    if (err) {
      console.error('Erro ao conectar ao banco de dados:', err);
      return;
    }
    console.log('Conectado ao banco de dados!');
  });

  const query = `UPDATE users SET idtheme = $1 WHERE id = $2`;
  const userId = 1; // Alterar conforme necessário

  client.query(query, [themeId, userId], (err, results) => {
    if (err) {
      console.error('Erro ao gravar no banco de dados:', err);
    } else {
      console.log('Resultado da query:', results);
      console.log('ID do tema gravado na tabela "users" com sucesso!');
    }
  });

  client.end();
}

module.exports = { fetchThemes };
