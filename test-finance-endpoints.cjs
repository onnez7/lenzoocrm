const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testFinanceEndpoints() {
  try {
    // Primeiro fazer login para obter token válido
    console.log('🔐 Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Testar endpoint de estatísticas
    console.log('\n📊 Testando endpoint de estatísticas...');
    try {
      const statsResponse = await axios.get(`${API_BASE}/finance/stats`, { headers });
      console.log('✅ Estatísticas:', JSON.stringify(statsResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Erro nas estatísticas:', error.response?.data || error.message);
    }

    // Testar endpoint de dados mensais
    console.log('\n📈 Testando endpoint de dados mensais...');
    try {
      const monthlyResponse = await axios.get(`${API_BASE}/finance/monthly`, { headers });
      console.log('✅ Dados mensais:', JSON.stringify(monthlyResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Erro nos dados mensais:', error.response?.data || error.message);
    }

    // Testar endpoint de categorias
    console.log('\n🏷️ Testando endpoint de categorias...');
    try {
      const categoriesResponse = await axios.get(`${API_BASE}/finance/categories`, { headers });
      console.log('✅ Categorias:', JSON.stringify(categoriesResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Erro nas categorias:', error.response?.data || error.message);
    }

    // Testar endpoint de métodos de pagamento
    console.log('\n💳 Testando endpoint de métodos de pagamento...');
    try {
      const methodsResponse = await axios.get(`${API_BASE}/finance/payment-methods`, { headers });
      console.log('✅ Métodos de pagamento:', JSON.stringify(methodsResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Erro nos métodos de pagamento:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.response?.data || error.message);
  }
}

testFinanceEndpoints(); 