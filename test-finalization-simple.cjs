const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testFinalization() {
  try {
    console.log('🧪 Testando finalização de ordem...');
    
    // 1. Login com credenciais corretas
    console.log('1. Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'joao@oticavisaoclara.com.br',
      password: '123456'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso\n');

    // 2. Verificar se há caixa aberto
    console.log('2. Verificando caixa...');
    const cashierResponse = await axios.get(`${API_BASE}/cashier/check-open-session`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!cashierResponse.data.session) {
      console.log('❌ Não há caixa aberto');
      return;
    }

    console.log('✅ Caixa está aberto\n');

    // 3. Buscar ordens pendentes
    console.log('3. Buscando ordens...');
    const ordersResponse = await axios.get(`${API_BASE}/orders`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const pendingOrders = ordersResponse.data.filter(order => order.status === 'pending');
    console.log(`✅ Encontradas ${pendingOrders.length} ordens pendentes\n`);

    if (pendingOrders.length === 0) {
      console.log('❌ Não há ordens pendentes para testar');
      return;
    }

    // 4. Testar finalização
    console.log('4. Testando finalização...');
    const orderToFinalize = pendingOrders[0];
    
    const finalizationData = {
      paymentMethod: 'cash',
      totalPaid: Number(orderToFinalize.total_amount),
      productDelivered: true,
      status: 'completed',
      observations: 'Teste de finalização'
    };

    const finalizeResponse = await axios.post(
      `${API_BASE}/orders/${orderToFinalize.id}/finalize`, 
      finalizationData,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log('✅ Finalização realizada com sucesso!');
    console.log('Resposta:', finalizeResponse.data);

  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  }
}

testFinalization(); 