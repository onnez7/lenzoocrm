const axios = require('axios');

async function testLogin() {
  try {
    console.log('Testando login...');
    
    const response = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@matriz.com',
      password: 'admin123'
    });
    
    console.log('✅ Login bem-sucedido!');
    console.log('Token:', response.data.token);
    console.log('User:', response.data.user);
    
    return response.data.token;
  } catch (error) {
    console.error('❌ Erro no login:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
    return null;
  }
}

testLogin(); 