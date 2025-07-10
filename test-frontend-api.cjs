const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testFrontendAPI() {
  try {
    console.log('🧪 Testando API como o frontend faria...\n');

    // 1. Simular login do frontend
    console.log('1. Simulando login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'joao@oticavisaoclara.com.br',
      password: 'franquia123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login simulado - Token obtido\n');

    // 2. Simular requisição do calendário (sem token no header, como o interceptor faria)
    console.log('2. Testando requisição sem token no header...');
    try {
      const appointmentsResponse = await axios.get(`${API_BASE}/appointments`);
      console.log('❌ Erro: Requisição sem token foi aceita (não deveria)');
    } catch (error) {
      console.log('✅ Requisição sem token foi rejeitada corretamente');
    }

    // 3. Simular requisição com token (como o interceptor faria)
    console.log('\n3. Testando requisição com token...');
    const appointmentsResponse = await axios.get(`${API_BASE}/appointments`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`✅ Requisição com token funcionou - ${appointmentsResponse.data.length} agendamentos\n`);

    // 4. Verificar estrutura dos dados
    console.log('4. Verificando estrutura dos dados...');
    const appointments = appointmentsResponse.data;
    
    appointments.forEach((appointment, index) => {
      console.log(`\nAgendamento ${index + 1}:`);
      console.log(`  ID: ${appointment.id}`);
      console.log(`  Data: ${appointment.appointment_date}`);
      console.log(`  Hora: ${appointment.appointment_time}`);
      console.log(`  Serviço: ${appointment.service}`);
      console.log(`  Cliente: ${appointment.client_name}`);
      console.log(`  Profissional: ${appointment.employee_name}`);
      console.log(`  Status: ${appointment.status}`);
    });

    // 5. Simular formatação de data como o frontend faria
    console.log('\n5. Simulando formatação de data...');
    appointments.forEach(appointment => {
      const dateKey = new Date(appointment.appointment_date).toISOString().split('T')[0];
      const timeFormatted = appointment.appointment_time.substring(0, 5);
      console.log(`  ${dateKey} ${timeFormatted} - ${appointment.client_name} (${appointment.service})`);
    });

    console.log('\n🎉 Teste da API como frontend concluído!');

  } catch (error) {
    console.error('❌ Erro nos testes:', error.response?.data || error.message);
  }
}

testFrontendAPI(); 