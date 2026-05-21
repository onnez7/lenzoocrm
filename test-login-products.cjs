const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testLoginAndProducts() {
  try {
    console.log('🔍 Testando Login e Produtos...\n');

    // 1. Login para obter token
    console.log('1. Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@matriz.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');
    console.log('👤 Usuário:', loginResponse.data.name);
    console.log('🔑 Role:', loginResponse.data.role);
    console.log('🏢 Franquia ID:', loginResponse.data.franchiseId);
    console.log('');

    // Configurar headers com token
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. Testar endpoint de produtos
    console.log('2. Testando endpoint de produtos...');
    try {
      const productsResponse = await axios.get(`${API_BASE}/products?page=1&limit=5`, { headers });
      console.log('✅ Produtos encontrados:', productsResponse.data.products.length);
      console.log('📊 Total:', productsResponse.data.total);
      console.log('📦 Primeiro produto:', productsResponse.data.products[0]?.name || 'Nenhum');
    } catch (error) {
      console.log('❌ Erro ao buscar produtos:', error.response?.status, error.response?.data?.message);
    }
    console.log('');

    // 3. Testar endpoint de produtos da franquia
    console.log('3. Testando endpoint de produtos da franquia...');
    try {
      const franchiseProductsResponse = await axios.get(`${API_BASE}/franchise/products?page=1&limit=5`, { headers });
      console.log('✅ Produtos da franquia encontrados:', franchiseProductsResponse.data.products.length);
      console.log('📊 Total:', franchiseProductsResponse.data.total);
    } catch (error) {
      console.log('❌ Erro ao buscar produtos da franquia:', error.response?.status, error.response?.data?.message);
    }
    console.log('');

    // 4. Verificar se o token está sendo enviado corretamente
    console.log('4. Verificando headers da requisição...');
    console.log('🔑 Token (primeiros 20 chars):', token.substring(0, 20) + '...');
    console.log('📋 Headers:', JSON.stringify(headers, null, 2));

  } catch (error) {
    console.error('❌ Erro geral:', error.response?.data || error.message);
  }
}

testLoginAndProducts(); 