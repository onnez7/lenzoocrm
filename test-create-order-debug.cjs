const axios = require('axios');

async function testCreateOrderDebug() {
  try {
    console.log('1. Fazendo login como FRANCHISE_ADMIN...');
    
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'joao@oticavisaoclara.com.br',
      password: 'franquia123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login bem-sucedido!');
    console.log('Usuário:', loginResponse.data.name);
    console.log('Role:', loginResponse.data.role);
    console.log('Franchise ID:', loginResponse.data.franchiseId);
    
    console.log('\n2. Verificando se há caixa aberto...');
    
    const cashierResponse = await axios.get('http://localhost:3001/api/cashier/open-session', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Caixa aberto:', cashierResponse.data.session ? 'Sim' : 'Não');
    
    if (!cashierResponse.data.session) {
      console.log('❌ Não é possível criar ordem sem caixa aberto');
      return;
    }
    
    console.log('\n3. Buscando produtos da franquia...');
    
    const productsResponse = await axios.get('http://localhost:3001/api/franchise/products?page=1&limit=5', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Produtos encontrados:', productsResponse.data.products?.length || 0);
    
    if (productsResponse.data.products?.length === 0) {
      console.log('❌ Nenhum produto encontrado para criar ordem');
      return;
    }
    
    console.log('\n4. Buscando clientes...');
    
    const clientsResponse = await axios.get('http://localhost:3001/api/clients?page=1&limit=5', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Clientes encontrados:', clientsResponse.data.clients?.length || 0);
    
    if (clientsResponse.data.clients?.length === 0) {
      console.log('❌ Nenhum cliente encontrado para criar ordem');
      return;
    }
    
    console.log('\n5. Testando criação de ordem...');
    
    const orderData = {
      client_id: clientsResponse.data.clients[0].id,
      items: [
        {
          product_id: productsResponse.data.products[0].id,
          product_name: productsResponse.data.products[0].name,
          quantity: 2,
          unit_price: Number(productsResponse.data.products[0].price),
          total_price: 2 * Number(productsResponse.data.products[0].price)
        }
      ],
      description: "Ordem de teste via script",
      notes: "Teste de criação de ordem"
    };
    
    console.log('📋 Dados da ordem:', JSON.stringify(orderData, null, 2));
    
    const orderResponse = await axios.post('http://localhost:3001/api/orders', orderData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Ordem criada com sucesso!');
    console.log('Ordem:', orderResponse.data.order_number);
    console.log('Total:', orderResponse.data.total_amount);
    
  } catch (error) {
    console.error('❌ Erro:');
    console.error('Status:', error.response?.status);
    console.error('URL:', error.config?.url);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
    
    if (error.response?.data?.stack) {
      console.error('Stack trace:', error.response.data.stack);
    }
  }
}

testCreateOrderDebug(); 