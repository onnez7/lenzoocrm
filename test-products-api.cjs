const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testProductsAPI() {
  try {
    console.log('🔍 Testando API de Produtos...\n');

    // 1. Login para obter token
    console.log('1. Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@matriz.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso\n');

    // Configurar headers com token
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. Listar produtos
    console.log('2. Listando produtos...');
    const productsResponse = await axios.get(`${API_BASE}/products?page=1&limit=10`, { headers });
    console.log(`✅ Produtos encontrados: ${productsResponse.data.products.length}`);
    console.log(`📊 Total: ${productsResponse.data.total}, Ativos: ${productsResponse.data.active}, Inativos: ${productsResponse.data.inactive}`);
    
    if (productsResponse.data.products.length > 0) {
      const firstProduct = productsResponse.data.products[0];
      console.log(`📦 Primeiro produto: ${firstProduct.name} - R$ ${firstProduct.price}`);
    }
    console.log('');

    // 3. Buscar produto específico
    if (productsResponse.data.products.length > 0) {
      const productId = productsResponse.data.products[0].id;
      console.log(`3. Buscando produto ID ${productId}...`);
      const productResponse = await axios.get(`${API_BASE}/products/${productId}`, { headers });
      console.log(`✅ Produto encontrado: ${productResponse.data.name}`);
      console.log(`💰 Preço: R$ ${productResponse.data.price}, Estoque: ${productResponse.data.stock_quantity}`);
      console.log('');
    }

    // 4. Testar busca
    console.log('4. Testando busca por "Ray-Ban"...');
    const searchResponse = await axios.get(`${API_BASE}/products?search=Ray-Ban&page=1&limit=5`, { headers });
    console.log(`✅ Produtos encontrados na busca: ${searchResponse.data.products.length}`);
    searchResponse.data.products.forEach(product => {
      console.log(`   - ${product.name} (${product.brand})`);
    });
    console.log('');

    // 5. Testar paginação
    console.log('5. Testando paginação...');
    const paginationResponse = await axios.get(`${API_BASE}/products?page=2&limit=5`, { headers });
    console.log(`✅ Página 2: ${paginationResponse.data.products.length} produtos`);
    console.log(`📄 Página atual: ${paginationResponse.data.page}, Total de páginas: ${paginationResponse.data.totalPages}`);
    console.log('');

    console.log('🎉 Todos os testes da API de produtos passaram!');

  } catch (error) {
    console.error('❌ Erro nos testes:', error.response?.data || error.message);
  }
}

testProductsAPI(); 