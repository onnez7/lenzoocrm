const axios = require('axios');

async function testOpportunitiesAPI() {
  try {
    console.log('Testando API de oportunidades...');
    
    // Teste 1: Verificar se o servidor está rodando
    const healthCheck = await axios.get('http://localhost:3001/api/health');
    console.log('✅ Servidor está rodando');
    
    // Teste 2: Tentar acessar oportunidades sem token
    try {
      await axios.get('http://localhost:3001/api/opportunities');
      console.log('❌ Erro: API aceitou requisição sem token');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ API corretamente rejeitou requisição sem token');
      } else {
        console.log('❌ Erro inesperado:', error.response?.status);
      }
    }
    
    // Teste 3: Tentar com token inválido
    try {
      await axios.get('http://localhost:3001/api/opportunities', {
        headers: { Authorization: 'Bearer invalid_token' }
      });
      console.log('❌ Erro: API aceitou token inválido');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ API corretamente rejeitou token inválido');
      } else {
        console.log('❌ Erro inesperado:', error.response?.status);
      }
    }
    
    console.log('\nTestes concluídos!');
    
  } catch (error) {
    console.error('Erro no teste:', error.message);
  }
}

testOpportunitiesAPI(); 