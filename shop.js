const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

app.post('/update-button', async (req, res) => {
    const { token, domain, newButtonLink } = req.body;

    if (!token || !domain || !newButtonLink) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
        // Obter o tema ativo da loja
        const themesResponse = await axios.get(`https://${domain}/admin/api/2023-01/themes.json`, {
            headers: {
                'X-Shopify-Access-Token': token,
            },
        });

        const activeTheme = themesResponse.data.themes.find(theme => theme.role === 'main');

        if (!activeTheme) {
            return res.status(404).json({ error: 'Active theme not found' });
        }

        // Nome do arquivo que queremos alterar
        const filePath = 'sections/main-cart.liquid';

        // Obter o conteúdo atual do arquivo
        const fileResponse = await axios.get(`https://${domain}/admin/api/2023-01/themes/${activeTheme.id}/assets.json`, {
            params: {
                asset: { key: filePath },
            },
            headers: {
                'X-Shopify-Access-Token': token,
            },
        });

        let fileContent = fileResponse.data.asset.value;

        // Alterar o botão de compra para um link
        const updatedContent = fileContent.replace(
            /<button[^>]*class="cart__checkout-button checkout-button button button--primary button--full"[^>]*>(.*?)<\/button>/g,
            `<a href="${newButtonLink}" class="cart__checkout-button checkout-button button button--primary button--full" style="border-radius: var(--borda-bot-qnt) !important;">
                <span class="checkout-button__lock">{%- render 'icon' with 'lock' -%}</span>
                Finalizar Compra
            </a>`
        );

        // Atualizar o arquivo no tema
        await axios.put(`https://${domain}/admin/api/2023-01/themes/${activeTheme.id}/assets.json`, {
            asset: {
                key: filePath,
                value: updatedContent,
            },
        }, {
            headers: {
                'X-Shopify-Access-Token': token,
            },
        });

        res.status(200).json({ message: 'Button updated successfully' });
    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to update button' });
    }
});

const PORT = 3005;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
