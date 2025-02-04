const { Client } = require('pg'); // Importando o cliente do PostgreSQL

function fetchThemes(accessToken, domain) {
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

        // Verificando se o nome do tema é "sabino-nichado"
        if (theme.node.name === 'sabino-nichado') {
          // Extraindo o número do ID
          const themeId = theme.node.id.split('/').pop();

          // Gravar o ID do tema na tabela 'users' do banco de dados
          saveThemeIdToDatabase(themeId);
        }
      });
    })
    .catch(error => {
      console.error('Erro ao acessar a API:', error);
    });
}

// Função para gravar o ID do tema na tabela 'users'
function saveThemeIdToDatabase(themeId) {
  // Configuração de conexão com o banco de dados PostgreSQL
  const connectionString = 'postgresql://postgres:yTIfpgaftZdLNzahJvJlVNpMoAlwInbL@monorail.proxy.rlwy.net:12369/railway';
  const client = new Client({
    connectionString: connectionString
  });

  // Conectar ao banco de dados
  client.connect((err) => {
    if (err) {
      console.error('Erro ao conectar ao banco de dados:', err);
      return;
    }
    console.log('Conectado ao banco de dados!');
  });

  // Atualizar a tabela 'users' com o ID do tema
  const query = `UPDATE users SET idtheme = $1 WHERE id = $2`; // Usando parâmetro $1 para evitar SQL injection
  const userId = 1; // Você pode substituir isso com o ID real do usuário, se necessário

  client.query(query, [themeId, userId], (err, results) => {
    if (err) {
      console.error('Erro ao gravar no banco de dados:', err);
    } else {
      console.log('ID do tema gravado na tabela "users" com sucesso!');
    }
  });

  // Fechar a conexão com o banco de dados
  client.end();
}

// Exemplo de chamada da função
// fetchThemes('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', '0t9rr0-yq.myshopify.com');
