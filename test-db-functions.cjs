const axios = require('axios');

async function testDbFunctions() {
  try {
    console.log('1. Fazendo login como admin...');
    
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@matriz.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login bem-sucedido!');
    
    console.log('\n2. Testando função generate_order_number()...');
    
    // Vamos tentar criar uma ordem simples para ver se a função existe
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
      description: "Teste de função",
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

testDbFunctions(); 