const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function testAppointmentFormData() {
  try {
    console.log('Fazendo login...');
    
    // Login
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'joao@oticavisaoclara.com.br',
      password: '123456'
    });

    const token = loginResponse.data.token;
    console.log('Login realizado com sucesso');

    // Testar endpoint de clientes
    console.log('\nTestando endpoint de clientes...');
    const clientsResponse = await axios.get(`${API_BASE_URL}/clients`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Status da resposta de clientes:', clientsResponse.status);
    console.log('Estrutura da resposta de clientes:', Object.keys(clientsResponse.data));
    console.log('Tipo de clients:', typeof clientsResponse.data.clients);
    console.log('É array?', Array.isArray(clientsResponse.data.clients));
    console.log('Quantidade de clientes:', clientsResponse.data.clients?.length || 0);

    // Testar endpoint de funcionários
    console.log('\nTestando endpoint de funcionários...');
    const employeesResponse = await axios.get(`${API_BASE_URL}/employees/franchise`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Status da resposta de funcionários:', employeesResponse.status);
    console.log('Estrutura da resposta de funcionários:', Object.keys(employeesResponse.data));
    console.log('Tipo de employees:', typeof employeesResponse.data.employees);
    console.log('É array?', Array.isArray(employeesResponse.data.employees));
    console.log('Quantidade de funcionários:', employeesResponse.data.employees?.length || 0);

  } catch (error) {
    console.error('Erro:', error.response?.data || error.message);
  }
}

testAppointmentFormData(); 