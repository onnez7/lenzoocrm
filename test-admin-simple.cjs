const https = require('https');
const http = require('http');

// Função fetch simples para Node.js
async function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const req = client.request(url, {
      method: options.method || 'GET',
      headers: options.headers || {},
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          text: () => Promise.resolve(data),
          json: () => Promise.resolve(JSON.parse(data))
        });
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testAdminRoutes() {
  try {
    console.log('🧪 Testando rotas do Admin...\n');

    // 1. Testar se o servidor está rodando
    console.log('1. Testando healthcheck...');
    const healthResponse = await fetch('http://localhost:3001/api/healthcheck');
    console.log(`   Status: ${healthResponse.status}`);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log(`   Resposta: ${healthData.message}\n`);
    }

    // 2. Testar login
    console.log('2. Fazendo login...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@matriz.com',
        password: 'admin123'
      })
    });

    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.log(`   ❌ Login falhou: ${loginResponse.status}`);
      console.log(`   Erro: ${errorText}\n`);
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log(`   ✅ Login realizado: ${loginData.name} (${loginData.role})\n`);

    // 3. Testar rota de estatísticas
    console.log('3. Testando /admin/stats...');
    const statsResponse = await fetch('http://localhost:3001/api/admin/stats', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`   Status: ${statsResponse.status}`);
    if (statsResponse.ok) {
      const stats = await statsResponse.json();
      console.log(`   ✅ Estatísticas carregadas:`);
      console.log(`      - Franquias: ${stats.totalFranchises}`);
      console.log(`      - Usuários: ${stats.totalUsers}`);
      console.log(`      - Produtos: ${stats.totalProducts}`);
      console.log(`      - Vendas: ${stats.totalSales}\n`);
    } else {
      const errorText = await statsResponse.text();
      console.log(`   ❌ Erro: ${errorText}\n`);
    }

    // 4. Testar rota de receita
    console.log('4. Testando /admin/revenue...');
    const revenueResponse = await fetch('http://localhost:3001/api/admin/revenue', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`   Status: ${revenueResponse.status}`);
    if (revenueResponse.ok) {
      const revenue = await revenueResponse.json();
      console.log(`   ✅ Dados de receita carregados: ${revenue.length} meses\n`);
    } else {
      const errorText = await revenueResponse.text();
      console.log(`   ❌ Erro: ${errorText}\n`);
    }

    console.log('🎉 Teste concluído!');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
  }
}

testAdminRoutes(); 