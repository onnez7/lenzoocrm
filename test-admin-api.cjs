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
        try {
          const jsonData = JSON.parse(data);
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            json: () => Promise.resolve(jsonData)
          });
        } catch (e) {
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            json: () => Promise.resolve({ message: data })
          });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

const API_BASE = 'http://localhost:3001';

async function testAdminAPI() {
  try {
    console.log('🧪 Testando APIs do Admin Dashboard...\n');

    // Primeiro, fazer login como SUPER_ADMIN
    console.log('1. Fazendo login como SUPER_ADMIN...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@matriz.com',
        password: 'admin123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login falhou: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;

    console.log('✅ Login realizado com sucesso\n');

    // Testar estatísticas gerais
    console.log('2. Testando /admin/stats...');
    const statsResponse = await fetch(`${API_BASE}/admin/stats`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (statsResponse.ok) {
      const stats = await statsResponse.json();
      console.log('✅ Estatísticas carregadas:');
      console.log(`   - Franquias: ${stats.totalFranchises} (${stats.activeFranchises} ativas)`);
      console.log(`   - Usuários: ${stats.totalUsers}`);
      console.log(`   - Produtos: ${stats.totalProducts}`);
      console.log(`   - Vendas: ${stats.totalSales}`);
      console.log(`   - Receita Total: R$ ${stats.totalRevenue.toFixed(2)}`);
      console.log(`   - Receita Mensal: R$ ${stats.monthlyRevenue.toFixed(2)}`);
      console.log(`   - Contas Pendentes: R$ ${(stats.pendingReceivables + stats.pendingPayables).toFixed(2)}\n`);
    } else {
      console.log(`❌ Erro ao buscar estatísticas: ${statsResponse.status}`);
    }

    // Testar dados de receita
    console.log('3. Testando /admin/revenue...');
    const revenueResponse = await fetch(`${API_BASE}/admin/revenue`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (revenueResponse.ok) {
      const revenue = await revenueResponse.json();
      console.log('✅ Dados de receita carregados:');
      console.log(`   - ${revenue.length} meses de dados`);
      revenue.forEach(item => {
        console.log(`   - ${item.month}: R$ ${item.revenue.toFixed(2)} (${item.franchises} franquias)`);
      });
      console.log('');
    } else {
      console.log(`❌ Erro ao buscar dados de receita: ${revenueResponse.status}`);
    }

    // Testar atividade recente
    console.log('4. Testando /admin/activity...');
    const activityResponse = await fetch(`${API_BASE}/admin/activity`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (activityResponse.ok) {
      const activity = await activityResponse.json();
      console.log('✅ Atividade recente carregada:');
      console.log(`   - ${activity.length} atividades encontradas`);
      activity.slice(0, 3).forEach(item => {
        console.log(`   - ${item.title}: ${item.description}`);
      });
      console.log('');
    } else {
      console.log(`❌ Erro ao buscar atividade: ${activityResponse.status}`);
    }

    // Testar top performers
    console.log('5. Testando /admin/top-performers...');
    const performersResponse = await fetch(`${API_BASE}/admin/top-performers`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (performersResponse.ok) {
      const performers = await performersResponse.json();
      console.log('✅ Top performers carregados:');
      console.log(`   - ${performers.length} franquias encontradas`);
      performers.forEach((performer, index) => {
        console.log(`   ${index + 1}. ${performer.name}: R$ ${performer.revenue.toFixed(2)} (${performer.sales} vendas)`);
      });
      console.log('');
    } else {
      console.log(`❌ Erro ao buscar top performers: ${performersResponse.status}`);
    }

    // Testar alertas
    console.log('6. Testando /admin/alerts...');
    const alertsResponse = await fetch(`${API_BASE}/admin/alerts`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (alertsResponse.ok) {
      const alerts = await alertsResponse.json();
      console.log('✅ Alertas carregados:');
      console.log(`   - ${alerts.length} alertas encontrados`);
      alerts.forEach(alert => {
        console.log(`   - ${alert.title}: ${alert.description}`);
      });
      console.log('');
    } else {
      console.log(`❌ Erro ao buscar alertas: ${alertsResponse.status}`);
    }

    console.log('🎉 Todos os testes concluídos!');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
  }
}

testAdminAPI(); 