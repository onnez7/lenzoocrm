const axios = require('axios');

async function testDbStructure() {
  try {
    console.log('1. Fazendo login como admin...');
    
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@matriz.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login bem-sucedido!');
    
    console.log('\n2. Verificando estrutura das tabelas...');
    
    // Vamos fazer uma requisição para verificar se as tabelas existem
    const testResponse = await axios.get('http://localhost:3001/api/orders?page=1&limit=1', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Tabela service_orders existe e é acessível');
    
    console.log('\n3. Testando criação de ordem com dados mínimos...');
    
    const orderData = {
      client_id: 1,
      items: [
        {
          product_id: 1,
          product_name: "Produto Teste",
          quantity: 1,
          unit_price: 10.00,
          total_price: 10.00
        }
      ],
      description: "Teste de estrutura",
      notes: "Teste"
    };
    
    const orderResponse = await axios.post('http://localhost:3001/api/orders', orderData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Ordem criada com sucesso!');
    console.log('Ordem:', orderResponse.data.order_number);
    console.log('ID:', orderResponse.data.id);
    console.log('Total:', orderResponse.data.total_amount);
    
    console.log('\n4. Verificando se os itens foram criados...');
    
    const orderDetailsResponse = await axios.get(`http://localhost:3001/api/orders/${orderResponse.data.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Itens da ordem:', orderDetailsResponse.data.items?.length || 0);
    
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

testDbStructure(); 