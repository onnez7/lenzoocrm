const axios = require('axios');

async function testFranchiseAdminDebug() {
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
    
    if (cashierResponse.data.session) {
      console.log('Sessão ID:', cashierResponse.data.session.id);
      console.log('Funcionário:', cashierResponse.data.session.employee_name);
      console.log('Valor inicial:', cashierResponse.data.session.initial_amount);
    }
    
    console.log('\n3. Testando criação de ordem com dados detalhados...');
    
    // Primeiro, vamos buscar um cliente
    const clientsResponse = await axios.get('http://localhost:3001/api/clients?page=1&limit=1', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Cliente encontrado:', clientsResponse.data.clients?.[0]?.name);
    
    // Buscar um produto
    const productsResponse = await axios.get('http://localhost:3001/api/franchise/products?page=1&limit=1', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Produto encontrado:', productsResponse.data.products?.[0]?.name);
    
    const orderData = {
      client_id: clientsResponse.data.clients[0].id,
      items: [
        {
          product_id: productsResponse.data.products[0].id,
          product_name: productsResponse.data.products[0].name,
          quantity: 1,
          unit_price: Number(productsResponse.data.products[0].price),
          total_price: Number(productsResponse.data.products[0].price)
        }
      ],
      description: "Teste detalhado FRANCHISE_ADMIN",
      notes: "Teste de debug"
    };
    
    console.log('📋 Dados da ordem:', JSON.stringify(orderData, null, 2));
    
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
    
    // Vamos tentar verificar se o problema é na função generate_order_number
    console.log('\n🔍 Verificando se o problema é na função generate_order_number...');
    
    try {
      const testResponse = await axios.post('http://localhost:3001/api/orders', {
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
        description: "Teste função",
        notes: "Teste"
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Função generate_order_number funciona!');
    } catch (testError) {
      console.error('❌ Função generate_order_number falha:', testError.response?.data);
    }
  }
}

testFranchiseAdminDebug(); 