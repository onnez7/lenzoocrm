const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testFinancialSystem() {
  try {
    console.log('🧪 Testando sistema financeiro...\n');

    // 1. Login
    console.log('1. Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'joao@oticavisaoclara.com.br',
      password: 'franquia123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login realizado\n');

    // 2. Testar contas bancárias
    console.log('2. Testando contas bancárias...');
    try {
      const bankAccountsResponse = await axios.get(`${API_BASE}/bank-accounts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✅ Contas bancárias: ${bankAccountsResponse.data.length} encontradas`);
    } catch (error) {
      console.log('❌ Erro ao buscar contas bancárias:', error.response?.data?.message || error.message);
    }

    // 3. Testar cartões de crédito
    console.log('\n3. Testando cartões de crédito...');
    try {
      const creditCardsResponse = await axios.get(`${API_BASE}/credit-cards`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✅ Cartões de crédito: ${creditCardsResponse.data.length} encontrados`);
    } catch (error) {
      console.log('❌ Erro ao buscar cartões de crédito:', error.response?.data?.message || error.message);
    }

    // 4. Testar notas fiscais
    console.log('\n4. Testando notas fiscais...');
    try {
      const invoicesResponse = await axios.get(`${API_BASE}/invoices`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✅ Notas fiscais: ${invoicesResponse.data.length} encontradas`);
    } catch (error) {
      console.log('❌ Erro ao buscar notas fiscais:', error.response?.data?.message || error.message);
    }

    // 5. Testar contas a pagar
    console.log('\n5. Testando contas a pagar...');
    try {
      const payablesResponse = await axios.get(`${API_BASE}/payables`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✅ Contas a pagar: ${payablesResponse.data.length} encontradas`);
    } catch (error) {
      console.log('❌ Erro ao buscar contas a pagar:', error.response?.data?.message || error.message);
    }

    // 6. Testar contas a receber
    console.log('\n6. Testando contas a receber...');
    try {
      const receivablesResponse = await axios.get(`${API_BASE}/receivables`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✅ Contas a receber: ${receivablesResponse.data.length} encontradas`);
    } catch (error) {
      console.log('❌ Erro ao buscar contas a receber:', error.response?.data?.message || error.message);
    }

    // 7. Testar estatísticas
    console.log('\n7. Testando estatísticas...');
    try {
      const statsResponse = await axios.get(`${API_BASE}/invoices/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Estatísticas de notas fiscais:', statsResponse.data);
    } catch (error) {
      console.log('❌ Erro ao buscar estatísticas:', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 Teste do sistema financeiro concluído!');

  } catch (error) {
    console.error('❌ Erro nos testes:', error.response?.data || error.message);
  }
}

testFinancialSystem(); 