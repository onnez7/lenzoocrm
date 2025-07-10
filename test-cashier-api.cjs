const axios = require('axios');

async function testCashierApi() {
  try {
    console.log('1. Fazendo login como FRANCHISE_ADMIN...');
    
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'joao@oticavisaoclara.com.br',
      password: 'franquia123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login bem-sucedido!');
    console.log('Usuário:', loginResponse.data.name);
    
    console.log('\n2. Testando API de caixa aberto...');
    
    const cashierResponse = await axios.get('http://localhost:3001/api/cashier/open-session', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (cashierResponse.data.session) {
      const session = cashierResponse.data.session;
      console.log('✅ Caixa aberto encontrado:');
      console.log('  Session Code:', session.session_code);
      console.log('  Employee Name:', session.employee_name);
      console.log('  Initial Amount:', session.initial_amount);
      console.log('  Total Sales:', session.total_sales);
      console.log('  Open Time:', session.open_time);
    } else {
      console.log('❌ Nenhum caixa aberto encontrado');
    }
    
    console.log('\n3. Testando API de histórico...');
    
    const historyResponse = await axios.get('http://localhost:3001/api/cashier/history', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Histórico carregado:');
    console.log('Total de sessões:', historyResponse.data.length);
    
    historyResponse.data.slice(0, 3).forEach((session, index) => {
      console.log(`\nSessão ${index + 1}:`);
      console.log('  Code:', session.session_code);
      console.log('  Employee:', session.employee_name);
      console.log('  Total Sales:', session.total_sales);
      console.log('  Status:', session.status);
      console.log('  Open Time:', session.open_time);
    });
    
    console.log('\n4. Verificando se há problemas de formatação...');
    
    // Verificar se há valores NaN ou muito grandes
    const problematicSessions = historyResponse.data.filter(session => {
      const total = parseFloat(session.total_sales);
      return isNaN(total) || total > 1000000;
    });
    
    if (problematicSessions.length > 0) {
      console.log('⚠️ Sessões com problemas encontradas:');
      problematicSessions.forEach(session => {
        console.log(`  ${session.session_code}: ${session.total_sales}`);
      });
    } else {
      console.log('✅ Nenhum problema de formatação encontrado');
    }
    
  } catch (error) {
    console.error('❌ Erro:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
  }
}

testCashierApi(); 