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

    // Buscar clientes para obter um ID válido
    console.log('\nBuscando clientes...');
    const clientsResponse = await axios.get(`${API_BASE_URL}/clients`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const clientId = clientsResponse.data.clients[0].id;
    console.log('Cliente selecionado:', clientId);

    // Buscar funcionários para obter um ID válido
    console.log('\nBuscando funcionários...');
    const employeesResponse = await axios.get(`${API_BASE_URL}/employees/franchise`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const employeeId = employeesResponse.data.employees[0].id;
    console.log('Funcionário selecionado:', employeeId);

    // Testar criação de agendamento com funcionário
    console.log('\nTestando criação de agendamento com funcionário...');
    const appointmentWithEmployee = {
      client_id: clientId,
      employee_id: employeeId,
      service: "Consulta Oftalmológica",
      appointment_date: "2025-07-10",
      appointment_time: "14:00",
      observations: "Teste de criação de agendamento"
    };

    const createResponse1 = await axios.post(`${API_BASE_URL}/appointments`, appointmentWithEmployee, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Agendamento com funcionário criado com sucesso!');
    console.log('ID do agendamento:', createResponse1.data.id);

    // Testar criação de agendamento sem funcionário
    console.log('\nTestando criação de agendamento sem funcionário...');
    const appointmentWithoutEmployee = {
      client_id: clientId,
      service: "Exame de Vista",
      appointment_date: "2025-07-11",
      appointment_time: "15:00",
      observations: "Teste sem funcionário"
    };

    const createResponse2 = await axios.post(`${API_BASE_URL}/appointments`, appointmentWithoutEmployee, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Agendamento sem funcionário criado com sucesso!');
    console.log('ID do agendamento:', createResponse2.data.id);

  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
    if (error.response?.status === 400) {
      console.error('Detalhes do erro 400:', error.response.data);
    }
  }
}

testCreateAppointment(); 