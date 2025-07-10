const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function testCalendarAppointments() {
  try {
    console.log('Fazendo login...');
    
    // Login
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'joao@oticavisaoclara.com.br',
      password: '123456'
    });

    const token = loginResponse.data.token;
    console.log('Login realizado com sucesso');

    // Buscar agendamentos
    console.log('\nBuscando agendamentos para o calendário...');
    const appointmentsResponse = await axios.get(`${API_BASE_URL}/appointments`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Total de agendamentos:', appointmentsResponse.data.length);
    
    if (appointmentsResponse.data.length === 0) {
      console.log('Nenhum agendamento encontrado. Criando alguns para teste...');
      
      // Buscar clientes e funcionários
      const clientsResponse = await axios.get(`${API_BASE_URL}/clients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const employeesResponse = await axios.get(`${API_BASE_URL}/employees/franchise`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const clientId = clientsResponse.data.clients[0].id;
      const employeeId = employeesResponse.data.employees[0].id;

      // Criar agendamentos para diferentes datas
      const testDates = [
        { date: "2025-07-10", time: "09:00", service: "Consulta Oftalmológica" },
        { date: "2025-07-10", time: "14:00", service: "Exame de Vista" },
        { date: "2025-07-12", time: "10:00", service: "Adaptação de Lentes" },
        { date: "2025-07-15", time: "16:00", service: "Manutenção de Óculos" },
        { date: "2025-07-20", time: "11:00", service: "Teste de Lentes de Contato" }
      ];

      for (const testAppointment of testDates) {
        try {
          const createResponse = await axios.post(`${API_BASE_URL}/appointments`, {
            client_id: clientId,
            employee_id: employeeId,
            service: testAppointment.service,
            appointment_date: testAppointment.date,
            appointment_time: testAppointment.time,
            observations: "Agendamento de teste para o calendário"
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          console.log(`✅ Agendamento criado: ${testAppointment.date} ${testAppointment.time} - ${testAppointment.service}`);
        } catch (error) {
          console.log(`❌ Erro ao criar agendamento: ${error.response?.data?.message || error.message}`);
        }
      }

      // Buscar agendamentos novamente
      console.log('\nBuscando agendamentos novamente...');
      const updatedAppointmentsResponse = await axios.get(`${API_BASE_URL}/appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Total de agendamentos após criação:', updatedAppointmentsResponse.data.length);
    }

    // Mostrar detalhes dos agendamentos
    console.log('\nDetalhes dos agendamentos:');
    appointmentsResponse.data.forEach((appointment, index) => {
      console.log(`${index + 1}. ID: ${appointment.id}`);
      console.log(`   Data: ${appointment.appointment_date}`);
      console.log(`   Hora: ${appointment.appointment_time}`);
      console.log(`   Serviço: ${appointment.service}`);
      console.log(`   Cliente: ${appointment.client_name}`);
      console.log(`   Profissional: ${appointment.employee_name}`);
      console.log(`   Status: ${appointment.status}`);
      console.log('');
    });

    // Testar busca por data específica
    console.log('\nTestando busca por data específica...');
    const testDate = "2025-07-10";
    const dateResponse = await axios.get(`${API_BASE_URL}/appointments/date/${testDate}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`Agendamentos para ${testDate}:`, dateResponse.data.length);

  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  }
}

testCalendarAppointments(); 