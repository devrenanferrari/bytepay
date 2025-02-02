import requests
import json

# Defina as variáveis com o token de acesso e o domínio da loja
access_token = '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'
domain = '0t9rr0-yq.myshopify.com'

# URL para a API GraphQL
url = f'https://{domain}/admin/api/2025-01/graphql.json'

# Headers necessários para a requisição
headers = {
    'Content-Type': 'application/json',
    'X-Shopify-Access-Token': access_token
}

# Query GraphQL para obter dados dos temas
query = """
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
"""

# Corpo da requisição com a query GraphQL
data = {
    "query": query
}

# Realizando a requisição POST
response = requests.post(url, headers=headers, json=data)

# Verificando a resposta
if response.status_code == 200:
    print("Requisição bem-sucedida!")
    response_data = response.json()
    themes = response_data['data']['themes']['edges']
    for theme in themes:
        print(f'ID do tema: {theme["node"]["id"]}, Nome do tema: {theme["node"]["name"]}')
else:
    print(f'Erro ao acessar a API: {response.status_code}, {response.text}')
