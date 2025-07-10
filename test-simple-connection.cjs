const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testConnection() {
  try {
    console.log('🔍 Testando conexão com o backend...');
    
    // Teste simples de conexão
    const response = await axios.get(`${API_BASE}/auth/login`, {
      timeout: 5000
    });
    
    console.log('✅ Backend está respondendo!');
    console.log('Status:', response.status);
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Backend não está rodando na porta 3001');
    } else if (error.code === 'ENOTFOUND') {
      console.log('❌ Não foi possível conectar ao localhost');
    } else {
      console.log('❌ Erro de conexão:', error.message);
    }
  }
}

testConnection(); 