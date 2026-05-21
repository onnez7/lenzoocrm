const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

// Função para fazer login e obter token
async function login() {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@matriz.com',
      password: 'admin123'
    });
    
    console.log('✅ Login realizado com sucesso');
    return response.data.token;
  } catch (error) {
    console.error('❌ Erro no login:', error.response?.data || error.message);
    return null;
  }
}

// Função para verificar se há caixa aberto
async function checkOpenSession(token) {
  try {
    const response = await axios.get(`${API_BASE}/cashier/open-session`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Verificação de caixa aberto:');
    console.log('   Resposta:', response.data);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('ℹ️  Nenhuma sessão de caixa aberta encontrada');
      return { session: null };
    }
    console.error('❌ Erro ao verificar caixa:', error.response?.data || error.message);
    return null;
  }
}

// Função para abrir caixa
async function openCashier(token, employeeId = 1) {
  try {
    const response = await axios.post(`${API_BASE}/cashier/open`, {
      employee_id: employeeId,
      initial_amount: 100.00,
      notes: 'Abertura de teste'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Caixa aberto com sucesso:');
    console.log('   Sessão:', response.data.session_code);
    console.log('   Funcionário:', response.data.employee_name);
    console.log('   Valor inicial:', response.data.initial_amount);
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao abrir caixa:', error.response?.data || error.message);
    return null;
  }
}

// Função para fechar caixa
async function closeCashier(token) {
  try {
    const response = await axios.post(`${API_BASE}/cashier/close`, {
      cash_amount: 150.00,
      card_amount: 500.00,
      pix_amount: 250.00,
      notes: 'Fechamento de teste'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Caixa fechado com sucesso:');
    console.log('   Diferença:', response.data.difference);
    console.log('   Status:', response.data.status);
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao fechar caixa:', error.response?.data || error.message);
    return null;
  }
}

// Função para buscar histórico
async function getHistory(token) {
  try {
    const response = await axios.get(`${API_BASE}/cashier/history`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Histórico carregado:');
    console.log('   Total de sessões:', response.data.length);
    response.data.forEach((session, index) => {
      console.log(`   ${index + 1}. ${session.session_code} - ${session.employee_name} - ${session.status}`);
    });
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao buscar histórico:', error.response?.data || error.message);
    return null;
  }
}

// Função principal para testar todas as funcionalidades
async function testCashier() {
  console.log('🚀 Iniciando testes do sistema de caixa...\n');
  
  // 1. Login
  const token = await login();
  if (!token) {
    console.log('❌ Falha no login. Abortando testes.');
    return;
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // 2. Verificar se há caixa aberto
  console.log('📋 Verificando status do caixa...');
  const openSession = await checkOpenSession(token);
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // 3. Se não há caixa aberto, abrir um
  if (!openSession.session) {
    console.log('🔓 Abrindo caixa...');
    await openCashier(token);
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Verificar novamente
    console.log('📋 Verificando status após abertura...');
    await checkOpenSession(token);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // 4. Buscar histórico
  console.log('📊 Buscando histórico...');
  await getHistory(token);
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // 5. Fechar caixa (opcional - comentar se quiser manter aberto)
  console.log('🔒 Fechando caixa...');
  await closeCashier(token);
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // 6. Verificar status final
  console.log('📋 Verificando status final...');
  await checkOpenSession(token);
  
  console.log('\n✅ Testes concluídos!');
}

// Executar testes
testCashier().catch(console.error); 