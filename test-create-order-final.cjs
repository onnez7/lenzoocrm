const axios = require('axios');

async function testCreateOrderFinal() {
  try {
    console.log('1. Fazendo login como FRANCHISE_ADMIN...');
    
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'joao@oticavisaoclara.com.br',
      password: 'franquia123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login bem-sucedido!');
    console.log('Usuário:', loginResponse.data.name);
    console.log('User ID:', loginResponse.data.id);
    console.log('Role:', loginResponse.data.role);
    console.log('Franchise ID:', loginResponse.data.franchiseId);
    
    console.log('\n2. Verificando se há caixa aberto...');
    
    const cashierResponse = await axios.get('http://localhost:3001/api/cashier/open-session', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Caixa aberto:', cashierResponse.data.session ? 'Sim' : 'Não');
    
    if (cashierResponse.data.session) {
      console.log('Session ID:', cashierResponse.data.session.id);
      console.log('Employee ID:', cashierResponse.data.session.employee_id);
    }
    
    console.log('\n3. Buscando dados para criar ordem...');
    
    // Buscar clientes
    const clientsResponse = await axios.get('http://localhost:3001/api/clients?page=1&limit=1', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // Buscar produtos
    const productsResponse = await axios.get('http://localhost:3001/api/franchise/products?page=1&limit=1', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Cliente encontrado:', clientsResponse.data.clients?.[0]?.name);
    console.log('✅ Produto encontrado:', productsResponse.data.products?.[0]?.name);
    
    console.log('\n4. Criando ordem de serviço...');
    
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
      description: "Ordem de teste após correção",
      notes: "Teste final"
    };
    
    const orderResponse = await axios.post('http://localhost:3001/api/orders', orderData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Ordem criada com sucesso!');
    console.log('Order Number:', orderResponse.data.order_number);
    console.log('Order ID:', orderResponse.data.id);
    console.log('Total:', orderResponse.data.total_amount);
    console.log('Status:', orderResponse.data.status);
    console.log('Employee ID:', orderResponse.data.employee_id);
    
    console.log('\n5. Verificando detalhes da ordem...');
    
    const orderDetailsResponse = await axios.get(`http://localhost:3001/api/orders/${orderResponse.data.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Detalhes da ordem carregados');
    console.log('Itens:', orderDetailsResponse.data.items?.length || 0);
    
    if (orderDetailsResponse.data.items?.length > 0) {
      console.log('Primeiro item:', orderDetailsResponse.data.items[0].product_name);
    }
    
    console.log('\n🎉 Teste concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
    
    if (error.response?.data?.stack) {
      console.error('Stack trace:', error.response.data.stack);
    }
  }
}

testCreateOrderFinal(); 