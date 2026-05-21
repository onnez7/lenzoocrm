const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testStatusRules() {
  try {
    console.log('🧪 Testando regras de status das ordens...\n');

    // 1. Login
    console.log('1. Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'teste@otica.com',
      password: '123456'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login realizado\n');

    // 2. Verificar caixa aberto
    console.log('2. Verificando caixa...');
    const cashierResponse = await axios.get(`${API_BASE}/cashier/open-session`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!cashierResponse.data.session) {
      console.log('❌ Não há caixa aberto');
      return;
    }

    console.log('✅ Caixa está aberto\n');

    // 3. Buscar ordens
    console.log('3. Buscando ordens...');
    const ordersResponse = await axios.get(`${API_BASE}/orders`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const pendingOrders = ordersResponse.data.filter(order => order.status === 'pending');
    const inProgressOrders = ordersResponse.data.filter(order => order.status === 'in_progress');
    const completedOrders = ordersResponse.data.filter(order => order.status === 'completed');

    console.log(`📊 Status das ordens:`);
    console.log(`   - Pendentes: ${pendingOrders.length}`);
    console.log(`   - Em Andamento: ${inProgressOrders.length}`);
    console.log(`   - Concluídas: ${completedOrders.length}\n`);

    // 4. Testar regras para ordem pendente
    if (pendingOrders.length > 0) {
      console.log('4. Testando regras para ordem pendente...');
      const pendingOrder = pendingOrders[0];
      
      // Tentar finalizar como concluída (deve dar erro)
      try {
        await axios.post(`${API_BASE}/orders/${pendingOrder.id}/finalize`, {
          paymentMethod: 'cash',
          totalPaid: Number(pendingOrder.total_amount),
          productDelivered: true,
          status: 'completed',
          observations: 'Teste - deve dar erro'
        }, { headers: { Authorization: `Bearer ${token}` } });
        
        console.log('❌ Erro: Deveria ter dado erro ao tentar concluir ordem pendente');
      } catch (error) {
        if (error.response?.status === 400) {
          console.log('✅ Correto: Erro ao tentar concluir ordem pendente');
        } else {
          console.log('❌ Erro inesperado:', error.response?.data);
        }
      }

      // Finalizar como em andamento (deve funcionar)
      try {
        await axios.post(`${API_BASE}/orders/${pendingOrder.id}/finalize`, {
          paymentMethod: 'cash',
          totalPaid: Number(pendingOrder.total_amount),
          productDelivered: false,
          status: 'in_progress',
          observations: 'Teste - ordem em andamento'
        }, { headers: { Authorization: `Bearer ${token}` } });
        
        console.log('✅ Ordem pendente finalizada como Em Andamento');
      } catch (error) {
        console.log('❌ Erro ao finalizar como em andamento:', error.response?.data);
      }
    }

    // 5. Testar regras para ordem em andamento
    if (inProgressOrders.length > 0) {
      console.log('\n5. Testando regras para ordem em andamento...');
      const inProgressOrder = inProgressOrders[0];
      
      // Tentar cancelar (deve dar erro)
      try {
        await axios.post(`${API_BASE}/orders/${inProgressOrder.id}/finalize`, {
          paymentMethod: 'cash',
          totalPaid: 0,
          productDelivered: false,
          status: 'cancelled',
          cancellationReason: 'teste',
          observations: 'Teste - deve dar erro'
        }, { headers: { Authorization: `Bearer ${token}` } });
        
        console.log('❌ Erro: Deveria ter dado erro ao tentar cancelar ordem em andamento');
      } catch (error) {
        if (error.response?.status === 400) {
          console.log('✅ Correto: Erro ao tentar cancelar ordem em andamento');
        } else {
          console.log('❌ Erro inesperado:', error.response?.data);
        }
      }

      // Concluir (deve funcionar)
      try {
        await axios.post(`${API_BASE}/orders/${inProgressOrder.id}/finalize`, {
          paymentMethod: 'cash',
          totalPaid: Number(inProgressOrder.total_amount),
          productDelivered: true,
          status: 'completed',
          observations: 'Teste - ordem concluída'
        }, { headers: { Authorization: `Bearer ${token}` } });
        
        console.log('✅ Ordem em andamento finalizada como Concluída');
      } catch (error) {
        console.log('❌ Erro ao concluir ordem:', error.response?.data);
      }
    }

    // 6. Testar regras para ordem concluída
    if (completedOrders.length > 0) {
      console.log('\n6. Testando regras para ordem concluída...');
      const completedOrder = completedOrders[0];
      
      // Tentar alterar status (deve dar erro)
      try {
        await axios.post(`${API_BASE}/orders/${completedOrder.id}/finalize`, {
          paymentMethod: 'cash',
          totalPaid: Number(completedOrder.total_amount),
          productDelivered: false,
          status: 'in_progress',
          observations: 'Teste - deve dar erro'
        }, { headers: { Authorization: `Bearer ${token}` } });
        
        console.log('❌ Erro: Deveria ter dado erro ao tentar alterar ordem concluída');
      } catch (error) {
        if (error.response?.status === 400) {
          console.log('✅ Correto: Erro ao tentar alterar ordem concluída');
        } else {
          console.log('❌ Erro inesperado:', error.response?.data);
        }
      }
    }

    console.log('\n🎉 Testes de regras de status concluídos!');

  } catch (error) {
    console.error('❌ Erro nos testes:', error.response?.data || error.message);
  }
}

testStatusRules(); 