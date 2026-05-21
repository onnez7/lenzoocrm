const axios = require('axios');

async function testExactFrontendData() {
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
    
    console.log('\n2. Buscando dados exatos que o frontend usa...');
    
    // Buscar clientes
    const clientsResponse = await axios.get('http://localhost:3001/api/clients?page=1&limit=5', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // Buscar produtos
    const productsResponse = await axios.get('http://localhost:3001/api/franchise/products?page=1&limit=5', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Clientes encontrados:', clientsResponse.data.clients?.length || 0);
    console.log('✅ Produtos encontrados:', productsResponse.data.products?.length || 0);
    
    // Simular exatamente os dados que o frontend envia
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
    
    console.log('\n3. Dados exatos que serão enviados:');
    console.log(JSON.stringify(orderData, null, 2));
    
    console.log('\n4. Verificando se há caixa aberto...');
    
    const cashierResponse = await axios.get('http://localhost:3001/api/cashier/open-session', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Caixa aberto:', cashierResponse.data.session ? 'Sim' : 'Não');
    
    if (cashierResponse.data.session) {
      console.log('Session ID:', cashierResponse.data.session.id);
      console.log('Employee ID:', cashierResponse.data.session.employee_id);
    }
    
    console.log('\n5. Testando criação de ordem...');
    
    const orderResponse = await axios.post('http://localhost:3001/api/orders', orderData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Ordem criada com sucesso!');
    console.log('Ordem:', orderResponse.data.order_number);
    console.log('ID:', orderResponse.data.id);
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
    
    // Vamos tentar verificar se o problema é na validação
    console.log('\n🔍 Verificando se o problema é na validação...');
    
    try {
      // Testar com dados mínimos
      const minimalData = {
        client_id: 1,
        items: [
          {
            product_id: 1,
            product_name: "Teste",
            quantity: 1,
            unit_price: 10.00,
            total_price: 10.00
          }
        ],
        description: "Teste mínimo"
      };
      
      const testResponse = await axios.post('http://localhost:3001/api/orders', minimalData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Dados mínimos funcionam!');
    } catch (testError) {
      console.error('❌ Dados mínimos também falham:', testError.response?.data);
    }
  }
}

testExactFrontendData(); 