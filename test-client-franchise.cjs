const axios = require('axios');

async function testClientFranchise() {
  try {
    console.log('1. Fazendo login como FRANCHISE_ADMIN...');
    
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'joao@oticavisaoclara.com.br',
      password: 'franquia123'
    });
    
    const token = loginResponse.data.token;
    const franchiseId = loginResponse.data.franchiseId;
    console.log('✅ Login bem-sucedido!');
    console.log('Franchise ID:', franchiseId);
    
    console.log('\n2. Buscando clientes da franquia...');
    
    const clientsResponse = await axios.get('http://localhost:3001/api/clients?page=1&limit=5', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Clientes encontrados:', clientsResponse.data.clients?.length || 0);
    
    if (clientsResponse.data.clients?.length > 0) {
      console.log('Primeiro cliente:', {
        id: clientsResponse.data.clients[0].id,
        name: clientsResponse.data.clients[0].name,
        franchise_id: clientsResponse.data.clients[0].franchise_id
      });
    }
    
    console.log('\n3. Verificando se o cliente pertence à franquia correta...');
    
    // Vamos verificar se o cliente tem franchise_id correto
    const client = clientsResponse.data.clients[0];
    if (client && client.franchise_id !== franchiseId) {
      console.log('❌ Cliente não pertence à franquia correta!');
      console.log('Cliente franchise_id:', client.franchise_id);
      console.log('Usuário franchise_id:', franchiseId);
    } else {
      console.log('✅ Cliente pertence à franquia correta');
    }
    
    console.log('\n4. Testando criação de ordem com cliente correto...');
    
    const orderData = {
      client_id: client.id,
      items: [
        {
          product_id: 1,
          product_name: "Produto Teste",
          quantity: 1,
          unit_price: 10.00,
          total_price: 10.00
        }
      ],
      description: "Teste cliente franquia",
      notes: "Teste"
    };
    
    const orderResponse = await axios.post('http://localhost:3001/api/orders', orderData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Ordem criada com sucesso!');
    console.log('Ordem:', orderResponse.data.order_number);
    
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

testClientFranchise(); 