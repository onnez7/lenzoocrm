const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function testFinanceReports() {
  try {
    console.log('🧪 Testando relatórios financeiros...\n');

    // 1. Login
    console.log('1. Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@matriz.com',
      password: 'admin123'
    });

    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    console.log('✅ Login realizado com sucesso\n');

    // 2. Testar estatísticas financeiras
    console.log('2. Testando estatísticas financeiras...');
    const statsResponse = await axios.get(`${API_BASE_URL}/finance/stats`, { headers });
    console.log('📊 Estatísticas financeiras:');
    console.log(JSON.stringify(statsResponse.data, null, 2));
    console.log('✅ Estatísticas carregadas com sucesso\n');

    // 3. Testar dados mensais
    console.log('3. Testando dados mensais...');
    const monthlyResponse = await axios.get(`${API_BASE_URL}/finance/monthly?months=6`, { headers });
    console.log('📈 Dados mensais:');
    console.log(JSON.stringify(monthlyResponse.data, null, 2));
    console.log('✅ Dados mensais carregados com sucesso\n');

    // 4. Testar dados por categoria
    console.log('4. Testando dados por categoria...');
    const categoriesResponse = await axios.get(`${API_BASE_URL}/finance/categories`, { headers });
    console.log('🏷️ Dados por categoria:');
    console.log(JSON.stringify(categoriesResponse.data, null, 2));
    console.log('✅ Dados por categoria carregados com sucesso\n');

    // 5. Testar métodos de pagamento
    console.log('5. Testando métodos de pagamento...');
    const paymentMethodsResponse = await axios.get(`${API_BASE_URL}/finance/payment-methods`, { headers });
    console.log('💳 Métodos de pagamento:');
    console.log(JSON.stringify(paymentMethodsResponse.data, null, 2));
    console.log('✅ Métodos de pagamento carregados com sucesso\n');

    // 6. Testar estatísticas de vendas
    console.log('6. Testando estatísticas de vendas...');
    const salesResponse = await axios.get(`${API_BASE_URL}/orders/stats`, { headers });
    console.log('🛒 Estatísticas de vendas:');
    console.log(JSON.stringify(salesResponse.data, null, 2));
    console.log('✅ Estatísticas de vendas carregadas com sucesso\n');

    // 7. Testar sangrias
    console.log('7. Testando sangrias...');
    const sangriasResponse = await axios.get(`${API_BASE_URL}/cashier/sangrias`, { headers });
    console.log('💰 Sangrias:');
    console.log(JSON.stringify(sangriasResponse.data, null, 2));
    console.log('✅ Sangrias carregadas com sucesso\n');

    console.log('🎉 Todos os testes passaram com sucesso!');

  } catch (error) {
    console.error('❌ Erro nos testes:', error.response?.data || error.message);
  }
}

testFinanceReports(); 