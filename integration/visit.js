const puppeteer = require('puppeteer');

const SHOPIFY_STORE = "https://0t9rr0-yq.myshopify.com"; // Substitua pelo domínio da sua loja

async function simulateVisit(i) {
  const browser = await puppeteer.launch({ headless: true }); // Modo invisível
  const page = await browser.newPage();
  await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64)");

  const visitorId = Math.floor(Math.random() * 1000000);
  const url = `${SHOPIFY_STORE}/?utm_source=fake_visitor_${visitorId}`;

  await page.goto(url, { waitUntil: "networkidle2" });
  console.log(`✅ Visitante ${i + 1} acessou: ${url}`);
  
  await page.close();
  await browser.close();
}

async function simulateVisits() {
  let visitCount = 0;
  while (true) { // Loop infinito
    await simulateVisit(visitCount);
    visitCount++;
    await new Promise(resolve => setTimeout(resolve, 1000)); // Espera 20 segundos
  }
}

// Inicia a simulação de visitas
simulateVisits().catch(console.error);
