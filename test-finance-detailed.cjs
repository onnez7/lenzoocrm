const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function testFinanceDetailed() {
  try {
    console.log('🧪 Testando relatórios financeiros (detalhado)...\n');

    // 1. Login
    console.log('1. Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@matriz.com',
      password: 'admin123'
    });

    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    console.log('✅ Login realizado com sucesso');
    console.log('Token:', token.substring(0, 20) + '...');
    console.log('User:', loginResponse.data.user);
    console.log('');

    // 2. Testar estatísticas financeiras com mais detalhes
    console.log('2. Testando estatísticas financeiras...');
    try {
      const statsResponse = await axios.get(`${API_BASE_URL}/finance/stats`, { headers });
      console.log('📊 Estatísticas financeiras:');
      console.log(JSON.stringify(statsResponse.data, null, 2));
      console.log('✅ Estatísticas carregadas com sucesso\n');
    } catch (error) {
      console.error('❌ Erro nas estatísticas:', error.response?.data || error.message);
      console.error('Status:', error.response?.status);
      console.error('Headers:', error.response?.headers);
      console.log('');
    }

    // 3. Testar dados mensais
    console.log('3. Testando dados mensais...');
    try {
      const monthlyResponse = await axios.get(`${API_BASE_URL}/finance/monthly?months=6`, { headers });
      console.log('📈 Dados mensais:');
      console.log(JSON.stringify(monthlyResponse.data, null, 2));
      console.log('✅ Dados mensais carregados com sucesso\n');
    } catch (error) {
      console.error('❌ Erro nos dados mensais:', error.response?.data || error.message);
      console.log('');
    }

    // 4. Testar dados por categoria
    console.log('4. Testando dados por categoria...');
    try {
      const categoriesResponse = await axios.get(`${API_BASE_URL}/finance/categories`, { headers });
      console.log('🏷️ Dados por categoria:');
      console.log(JSON.stringify(categoriesResponse.data, null, 2));
      console.log('✅ Dados por categoria carregados com sucesso\n');
    } catch (error) {
      console.error('❌ Erro nos dados por categoria:', error.response?.data || error.message);
      console.log('');
    }

    // 5. Testar métodos de pagamento
    console.log('5. Testando métodos de pagamento...');
    try {
      const paymentMethodsResponse = await axios.get(`${API_BASE_URL}/finance/payment-methods`, { headers });
      console.log('💳 Métodos de pagamento:');
      console.log(JSON.stringify(paymentMethodsResponse.data, null, 2));
      console.log('✅ Métodos de pagamento carregados com sucesso\n');
    } catch (error) {
      console.error('❌ Erro nos métodos de pagamento:', error.response?.data || error.message);
      console.log('');
    }

    console.log('🎉 Teste detalhado concluído!');

  } catch (error) {
    console.error('❌ Erro geral nos testes:', error.response?.data || error.message);
  }
}

testFinanceDetailed(); 