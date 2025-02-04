import requests

# Substitua com os seus dados
access_token = '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'
domain = '0t9rr0-yq.myshopify.com'
theme_id = '128983302215'

# URL do endpoint para listar os arquivos do tema
url = f'https://{domain}/admin/api/2025-01/themes/{theme_id}/assets.json'

# Cabeçalhos de autorização
headers = {
    'Content-Type': 'application/json',
    'X-Shopify-Access-Token': access_token,
    'Accept': 'application/json'
}

# Dados do arquivo Liquid que você deseja alterar
asset_data = {
    "asset": {
        "key": "snippets/product-form.liquid",  # Caminho do arquivo Liquid
        "value": "{% if product.available %} Disponível {% else %} Indisponível {% endif %}"
    }
}

# Cabeçalhos de autorização e conteúdo
headers = {
    'Content-Type': 'application/json',
    'X-Shopify-Access-Token': access_token,
    'Accept': 'application/json',  # Certificando-se que o tipo de resposta é JSON
}

# Fazendo a requisição PUT para atualizar o arquivo Liquid
response = requests.put(url, headers=headers, json=asset_data)

# Verificando a resposta
print(f"Status code: {response.status_code}")
print(f"Response: {response.text}")

if response.status_code == 200:
    print("Arquivo 'product-form.liquid' atualizado com sucesso!")
else:
    print("Erro ao atualizar o arquivo 'product-form.liquid'.")