const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function testCreateAppointment() {
  try {
    console.log('Fazendo login...');
    
    // Login
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'joao@oticavisaoclara.com.br',
      password: '123456'
    });

    const token = loginResponse.data.token;
    console.log('Login realizado com sucesso');
    console.log('Usuário:', loginResponse.data.name, 'Role:', loginResponse.data.role);

    // Buscar clientes
    console.log('\nBuscando clientes...');
    const clientsResponse = await axios.get(`${API_BASE_URL}/clients`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const clientId = clientsResponse.data.clients[0].id;
    console.log('Cliente selecionado:', clientId, '-', clientsResponse.data.clients[0].name);

    // Buscar funcionários
    console.log('\nBuscando funcionários...');
    const employeesResponse = await axios.get(`${API_BASE_URL}/employees/franchise`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const employeeId = employeesResponse.data.employees[0].id;
    console.log('Funcionário selecionado:', employeeId, '-', employeesResponse.data.employees[0].name);

    // Testar criação de agendamento
    console.log('\nTestando criação de agendamento...');
    const appointmentData = {
      client_id: clientId,
      employee_id: employeeId,
      service: "Consulta Oftalmológica",
      appointment_date: "2025-07-10",
      appointment_time: "14:00",
      observations: "Teste de criação"
    };

    console.log('Dados do agendamento:', appointmentData);

    const createResponse = await axios.post(`${API_BASE_URL}/appointments`, appointmentData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Agendamento criado com sucesso!');
    console.log('ID do agendamento:', createResponse.data.id);
    console.log('Resposta completa:', createResponse.data);

  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
    if (error.response?.status === 400) {
      console.error('Detalhes do erro 400:', error.response.data);
    }
  }
}

testCreateAppointment(); 