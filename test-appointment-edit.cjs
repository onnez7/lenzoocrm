const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function testAppointmentEdit() {
  try {
    console.log('Fazendo login...');
    
    // Login
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'joao@oticavisaoclara.com.br',
      password: '123456'
    });

    const token = loginResponse.data.token;
    console.log('Login realizado com sucesso');

    // Buscar agendamentos existentes
    console.log('\nBuscando agendamentos...');
    const appointmentsResponse = await axios.get(`${API_BASE_URL}/appointments`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (appointmentsResponse.data.length === 0) {
      console.log('Nenhum agendamento encontrado. Criando um primeiro...');
      
      // Buscar clientes e funcionários para criar um agendamento
      const clientsResponse = await axios.get(`${API_BASE_URL}/clients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const employeesResponse = await axios.get(`${API_BASE_URL}/employees/franchise`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const clientId = clientsResponse.data.clients[0].id;
      const employeeId = employeesResponse.data.employees[0].id;

      // Criar agendamento
      const createResponse = await axios.post(`${API_BASE_URL}/appointments`, {
        client_id: clientId,
        employee_id: employeeId,
        service: "Consulta Oftalmológica",
        appointment_date: "2025-07-10",
        appointment_time: "14:00",
        observations: "Teste de criação"
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('✅ Agendamento criado:', createResponse.data.id);
      return;
    }

    const appointmentId = appointmentsResponse.data[0].id;
    console.log('Agendamento encontrado:', appointmentId);

    // Buscar detalhes do agendamento
    console.log('\nBuscando detalhes do agendamento...');
    const appointmentResponse = await axios.get(`${API_BASE_URL}/appointments/${appointmentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Dados do agendamento:', {
      id: appointmentResponse.data.id,
      client_id: appointmentResponse.data.client_id,
      employee_id: appointmentResponse.data.employee_id,
      service: appointmentResponse.data.service,
      appointment_date: appointmentResponse.data.appointment_date,
      appointment_time: appointmentResponse.data.appointment_time,
      status: appointmentResponse.data.status
    });

    // Testar atualização
    console.log('\nTestando atualização...');
    const updateData = {
      client_id: appointmentResponse.data.client_id,
      employee_id: appointmentResponse.data.employee_id,
      service: "Exame de Vista",
      appointment_date: "2025-07-11",
      appointment_time: "15:00",
      status: "confirmado",
      observations: "Atualizado via teste"
    };

    const updateResponse = await axios.put(`${API_BASE_URL}/appointments/${appointmentId}`, updateData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Agendamento atualizado com sucesso!');
    console.log('Novos dados:', {
      service: updateResponse.data.service,
      appointment_date: updateResponse.data.appointment_date,
      appointment_time: updateResponse.data.appointment_time,
      status: updateResponse.data.status
    });

  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
    if (error.response?.status === 400) {
      console.error('Detalhes do erro 400:', error.response.data);
    }
  }
}

testAppointmentEdit(); 