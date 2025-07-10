const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testAppointments() {
  try {
    console.log('🧪 Testando sistema de agendamentos...\n');

    // 1. Login
    console.log('1. Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'joao@oticavisaoclara.com.br',
      password: 'franquia123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login realizado\n');

    // 2. Buscar agendamentos
    console.log('2. Buscando agendamentos...');
    const appointmentsResponse = await axios.get(`${API_BASE}/appointments`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`✅ Encontrados ${appointmentsResponse.data.length} agendamentos\n`);

    // 3. Buscar clientes
    console.log('3. Buscando clientes...');
    const clientsResponse = await axios.get(`${API_BASE}/clients`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`✅ Encontrados ${clientsResponse.data.length} clientes\n`);

    // 4. Buscar funcionários
    console.log('4. Buscando funcionários...');
    const employeesResponse = await axios.get(`${API_BASE}/employees/franchise`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`✅ Encontrados ${employeesResponse.data.employees.length} funcionários\n`);

    // 5. Criar novo agendamento
    if (clientsResponse.data.length > 0 && employeesResponse.data.employees.length > 0) {
      console.log('5. Criando novo agendamento...');
      
      const newAppointment = {
        client_id: clientsResponse.data[0].id,
        employee_id: employeesResponse.data.employees[0].id,
        service: 'Consulta Oftalmológica',
        appointment_date: '2024-01-20',
        appointment_time: '14:00',
        observations: 'Teste de criação de agendamento'
      };

      const createResponse = await axios.post(`${API_BASE}/appointments`, newAppointment, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('✅ Agendamento criado com sucesso!');
      console.log(`   ID: ${createResponse.data.id}`);
      console.log(`   Cliente: ${createResponse.data.client_name}`);
      console.log(`   Serviço: ${createResponse.data.service}`);
      console.log(`   Data: ${createResponse.data.appointment_date}`);
      console.log(`   Hora: ${createResponse.data.appointment_time}\n`);

      // 6. Atualizar agendamento
      console.log('6. Atualizando agendamento...');
      const updateData = {
        status: 'confirmado',
        observations: 'Agendamento confirmado - teste de atualização'
      };

      const updateResponse = await axios.put(`${API_BASE}/appointments/${createResponse.data.id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('✅ Agendamento atualizado com sucesso!');
      console.log(`   Status: ${updateResponse.data.status}`);
      console.log(`   Observações: ${updateResponse.data.observations}\n`);

      // 7. Buscar agendamento por data
      console.log('7. Buscando agendamentos por data...');
      const dateResponse = await axios.get(`${API_BASE}/appointments/date/2024-01-20`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log(`✅ Encontrados ${dateResponse.data.length} agendamentos para 20/01/2024\n`);

      // 8. Deletar agendamento de teste
      console.log('8. Deletando agendamento de teste...');
      await axios.delete(`${API_BASE}/appointments/${createResponse.data.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('✅ Agendamento deletado com sucesso!\n');
    } else {
      console.log('❌ Não foi possível criar agendamento: clientes ou funcionários não encontrados\n');
    }

    console.log('🎉 Testes de agendamento concluídos com sucesso!');

  } catch (error) {
    console.error('❌ Erro nos testes:', error.response?.data || error.message);
  }
}

testAppointments(); 