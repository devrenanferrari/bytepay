import requests

def update_liquid_file(access_token, domain, theme_id, file_key, file_path):
    # Lendo o conteúdo do arquivo padrão
    try:
        with open(file_path, 'r') as file:
            file_value = file.read()
    except FileNotFoundError:
        print(f"Erro: O arquivo '{file_path}' não foi encontrado.")
        return

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
            "key": file_key,  # Caminho do arquivo Liquid
            "value": file_value
        }
    }

    # Fazendo a requisição PUT para atualizar o arquivo Liquid
    response = requests.put(url, headers=headers, json=asset_data)

    # Verificando a resposta
    print(f"Status code: {response.status_code}")
    print(f"Response: {response.text}")

    if response.status_code == 200:
        print(f"Arquivo '{file_key}' atualizado com sucesso!")
    else:
        print(f"Erro ao atualizar o arquivo '{file_key}'.")

# Exemplo de chamada da função
update_liquid_file(
    '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', 
    '0t9rr0-yq.myshopify.com', 
    '128983302215', 
    'snippets/product-form.liquid', 
    'caminho/para/o/arquivo/padrao.liquid'
)
