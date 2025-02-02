import @shopify/shopify-api

const accessToken = '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'; // Substitua pelo seu token de acesso
const domain = '0t9rr0-yq.myshopify.com'; // Substitua pelo seu domínio da loja Shopify
const themeId = 'gid://shopify/OnlineStoreTheme/128983302215'; // ID do seu tema no formato GID
const fileName = 'snippets/product-form.liquid'; // Nome do arquivo que será editado

// Configura o Shopify
Shopify.Context.initialize({
  API_KEY: '7f8d815057ce025a5e9e8a4cf78508ed', // Substitua pela sua chave da API
  API_SECRET_KEY: '095097fc4a1e5b0b89789291ac774c81', // Substitua pela sua chave secreta da API
  SCOPES: ['read_products', 'write_themes'], // Substitua pelos escopos necessários
  HOST_NAME: '0t9rr0-yq.myshopify.com', // Substitua pelo seu hostname
  API_VERSION: ApiVersion.October22, // Substitua pela versão da API
  IS_EMBEDDED_APP: false,
  SESSION_STORAGE: new Shopify.Session.MemorySessionStorage(),
});

// Crie um cliente GraphQL
const session = await Shopify.Utils.loadOfflineSession(domain);
const client = new Shopify.Clients.Graphql(domain, session.accessToken);

// Função para obter o conteúdo do arquivo atual e atualizar
async function updateThemeFile() {
  try {
    // Etapa 1: Obter o conteúdo atual do arquivo product-form.liquid
    const data = await client.query({
      data: {
        "query": `query themeFile($themeId: ID!, $filename: String!) {
          themeFile(themeId: $themeId, filename: $filename) {
            body
          }
        }`,
        "variables": {
          "themeId": themeId,
          "filename": fileName
        }
      }
    });

    const fileContent = data.body;
    console.log('Conteúdo atual do arquivo:', fileContent);

    // Etapa 2: Editar o conteúdo do arquivo (substituindo o botão de compra)
    const editedContent = fileContent.replace(/<button.*?class="product-form__add-button.*?">.*?<\/button>/, 
      '<a href="https://www.google.com" class="product-form__add-button button button--primary">Clique aqui para o Google</a>');

    console.log('Conteúdo editado:', editedContent);

    // Etapa 3: Salvar o conteúdo editado no arquivo de texto local
    fs.writeFileSync('product-form.liquid', editedContent, 'utf8');
    console.log('Conteúdo salvo no arquivo product-form.liquid');

    // Etapa 4: Fazer o upload do arquivo editado de volta para o Shopify
    const uploadResponse = await client.query({
      data: {
        "query": `mutation themeFilesUpsert($files: [OnlineStoreThemeFilesUpsertFileInput!]!, $themeId: ID!) {
          themeFilesUpsert(files: $files, themeId: $themeId) {
            upsertedThemeFiles {
              filename
            }
            userErrors {
              field
              message
            }
          }
        }`,
        "variables": {
          "files": [
            {
              "filename": fileName,
              "fileContent": editedContent
            }
          ],
          "themeId": themeId
        }
      }
    });

    console.log('Upload de arquivo concluído:', uploadResponse);
  } catch (error) {
    console.error('Erro ao atualizar o arquivo do tema:', error);
  }
}

// Chama a função para atualizar o arquivo
updateThemeFile();
