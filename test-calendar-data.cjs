const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testCalendarData() {
  try {
    console.log('🧪 Testando dados do calendário...\n');

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

    const appointments = appointmentsResponse.data;
    console.log(`✅ Encontrados ${appointments.length} agendamentos\n`);

    // 3. Verificar estrutura dos dados
    console.log('3. Verificando estrutura dos dados...');
    appointments.forEach((appointment, index) => {
      console.log(`\nAgendamento ${index + 1}:`);
      console.log(`  ID: ${appointment.id}`);
      console.log(`  Data: ${appointment.appointment_date} (tipo: ${typeof appointment.appointment_date})`);
      console.log(`  Hora: ${appointment.appointment_time} (tipo: ${typeof appointment.appointment_time})`);
      console.log(`  Serviço: ${appointment.service}`);
      console.log(`  Cliente: ${appointment.client_name}`);
      console.log(`  Profissional: ${appointment.employee_name}`);
      console.log(`  Status: ${appointment.status}`);
      
      // Verificar se a data está no formato correto para o calendário
      const dateKey = new Date(appointment.appointment_date).toISOString().split('T')[0];
      console.log(`  Chave do calendário: ${dateKey}`);
    });

    // 4. Simular agrupamento por data (como o calendário faz)
    console.log('\n4. Simulando agrupamento por data...');
    const eventsByDate = {};
    
    appointments.forEach(appointment => {
      const dateKey = new Date(appointment.appointment_date).toISOString().split('T')[0];
      if (!eventsByDate[dateKey]) {
        eventsByDate[dateKey] = [];
      }
      
      eventsByDate[dateKey].push({
        id: appointment.id,
        title: appointment.service,
        client: appointment.client_name || 'Cliente não informado',
        time: appointment.appointment_time,
        status: appointment.status,
        employee: appointment.employee_name || 'Profissional não informado'
      });
    });

    console.log('Eventos agrupados por data:');
    Object.keys(eventsByDate).forEach(date => {
      console.log(`  ${date}: ${eventsByDate[date].length} agendamento(s)`);
      eventsByDate[date].forEach(event => {
        console.log(`    - ${event.time} - ${event.client} (${event.title})`);
      });
    });

    console.log('\n🎉 Teste de dados do calendário concluído!');

  } catch (error) {
    console.error('❌ Erro nos testes:', error.response?.data || error.message);
  }
}

testCalendarData(); 