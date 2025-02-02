from flask import Flask, request, render_template, jsonify
import requests
import json

app = Flask(__name__)

API_URL_CARD = "https://api.bytepaycash.com/v1/gateway/card/"
API_KEY = "ee368abc92c28717664083e3"

@app.route('/processar', methods=['GET'])
def processar_checkout():
    try:
        # Capturar parâmetros da URL
        produtos = json.loads(request.args.get('produtos', '[]'))
        total = int(request.args.get('total', 0))
        moeda = request.args.get('moeda', 'BRL')

        # Renderizar página de checkout
        return render_template('indexantigocerto.html', produtos=produtos, total=total, moeda=moeda)
    except Exception as e:
        return f"Erro ao processar o checkout: {str(e)}", 500

@app.route('/confirmacao', methods=['GET'])
def confirmacao():
    return render_template('confirmacao.html')

@app.route('/pagamento', methods=['POST'])
def processar_pagamento():
    try:
        data = request.json
        return processar_pagamento_cartao(data)
    except Exception as e:
        return jsonify({"erro": f"Erro interno: {str(e)}"}), 500

def processar_pagamento_cartao(data):
    try:
        payload = {
            "api-key": API_KEY,
            "email": data["email"],
            "telefone": data["telefone"],
            "nome": data["nome"],
            "cpf": data["cpf"],
            "valor": float(data["valor"]),
            "id": data["id"],
            "installments": data["installments"],
            "card": {
                "number": data["card"]["number"],
                "holderName": data["card"]["holderName"],
                "expirationMonth": data["card"]["expirationMonth"],
                "expirationYear": data["card"]["expirationYear"],
                "cvv": data["card"]["cvv"],
            },
            "utms": {
                "utm_source": data.get("utm", {}).get("source", ""),
                "utm_medium": data.get("utm", {}).get("medium", ""),
                "utm_campaign": data.get("utm", {}).get("campaign", ""),
                "utm_term": data.get("utm", {}).get("term", ""),
                "utm_content": data.get("utm", {}).get("content", ""),
            },
        }

        response = requests.post(API_URL_CARD, json=payload)

        if response.status_code == 200:
            return jsonify(response.json()), 200
        else:
            return jsonify({"erro": "Erro ao processar pagamento", "detalhes": response.json()}), response.status_code

    except Exception as e:
        return jsonify({"erro": f"Erro interno no processamento do cartão: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True)