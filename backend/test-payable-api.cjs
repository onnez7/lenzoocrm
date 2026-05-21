const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

// Simular token de autenticação (você precisa de um token válido)
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Nywicm9sZSI6IkZSQU5DSElTRV9BRE1JTiIsImZyYW5jaGlzZUlkIjoxLCJpYXQiOjE3MzQ5NzI5NzQsImV4cCI6MTczNTA1OTM3NH0.example';

async function testPayableAPI() {
  try {
    console.log('🧪 Testando API de contas a pagar...');
    
    const headers = {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    };

    // Teste 1: Listar contas a pagar
    console.log('\n1. Testando GET /payables');
    try {
      const response = await axios.get(`${API_BASE}/payables`, { headers });
      console.log('✅ Listagem funcionando:', response.data.length, 'contas encontradas');
    } catch (error) {
      console.log('❌ Erro na listagem:', error.response?.data || error.message);
    }

    // Teste 2: Criar conta a pagar
    console.log('\n2. Testando POST /payables');
    const testData = {
      description: 'Teste API - Conta de energia',
      amount: 150.75,
      due_date: '2024-12-31',
      supplier: 'Enel',
      category: 'utilities',
      payment_method: 'bank_transfer',
      notes: 'Teste via script'
    };

    try {
      const response = await axios.post(`${API_BASE}/payables`, testData, { headers });
      console.log('✅ Criação funcionando:', response.data);
      
      const payableId = response.data.id;
      
      // Teste 3: Marcar como paga
      console.log('\n3. Testando PUT /payables/:id/paid');
      try {
        const paidResponse = await axios.put(`${API_BASE}/payables/${payableId}/paid`, {
          payment_date: new Date().toISOString().split('T')[0],
          payment_method: 'bank_transfer'
        }, { headers });
        console.log('✅ Marcar como paga funcionando:', paidResponse.data);
      } catch (error) {
        console.log('❌ Erro ao marcar como paga:', error.response?.data || error.message);
      }
      
    } catch (error) {
      console.log('❌ Erro na criação:', error.response?.data || error.message);
      console.log('Payload enviado:', testData);
    }

    // Teste 4: Estatísticas
    console.log('\n4. Testando GET /payables/stats');
    try {
      const response = await axios.get(`${API_BASE}/payables/stats`, { headers });
      console.log('✅ Estatísticas funcionando:', response.data);
    } catch (error) {
      console.log('❌ Erro nas estatísticas:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testPayableAPI(); 