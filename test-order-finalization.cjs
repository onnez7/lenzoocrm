const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testOrderFinalization() {
  try {
    console.log('🧪 Testando finalização de ordens...\n');

    // 1. Login como FRANCHISE_ADMIN
    console.log('1. Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'franchise@test.com',
      password: '123456'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso\n');

    // 2. Verificar se há caixa aberto
    console.log('2. Verificando caixa aberto...');
    const cashierResponse = await axios.get(`${API_BASE}/cashier/check-open-session`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!cashierResponse.data.session) {
      console.log('❌ Não há caixa aberto. Abrindo caixa...');
      
      // Abrir caixa
      await axios.post(`${API_BASE}/cashier/open`, {
        employee_id: 1,
        initial_amount: 100.00,
        notes: 'Caixa aberto para teste'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Caixa aberto com sucesso\n');
    } else {
      console.log('✅ Caixa já está aberto\n');
    }

    // 3. Buscar ordens pendentes
    console.log('3. Buscando ordens pendentes...');
    const ordersResponse = await axios.get(`${API_BASE}/orders`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const pendingOrders = ordersResponse.data.filter(order => order.status === 'pending');
    
    if (pendingOrders.length === 0) {
      console.log('❌ Não há ordens pendentes. Criando uma ordem...');
      
      // Criar uma ordem
      const createOrderResponse = await axios.post(`${API_BASE}/orders`, {
        client_id: 1,
        items: [
          {
            product_id: 1,
            product_name: 'Óculos Teste',
            quantity: 1,
            unit_price: 150.00,
            total_price: 150.00
          }
        ],
        notes: 'Ordem criada para teste'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Ordem criada:', createOrderResponse.data.order_number);
      pendingOrders.push(createOrderResponse.data);
    }

    console.log(`✅ Encontradas ${pendingOrders.length} ordens pendentes\n`);

    // 4. Testar finalização com pagamento em dinheiro
    console.log('4. Testando finalização com pagamento em dinheiro...');
    const orderToFinalize = pendingOrders[0];
    
    const finalizationData = {
      paymentMethod: 'cash',
      totalPaid: 150.00,
      productDelivered: true,
      status: 'completed',
      observations: 'Teste de finalização em dinheiro'
    };

    await axios.post(`${API_BASE}/orders/${orderToFinalize.id}/finalize`, finalizationData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Ordem finalizada com pagamento em dinheiro\n');

    // 5. Testar finalização com cartão parcelado
    console.log('5. Criando nova ordem para testar cartão...');
    const cardOrderResponse = await axios.post(`${API_BASE}/orders`, {
      client_id: 1,
      items: [
        {
          product_id: 1,
          product_name: 'Óculos Teste Cartão',
          quantity: 1,
          unit_price: 200.00,
          total_price: 200.00
        }
      ],
      notes: 'Ordem para teste de cartão'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('6. Testando finalização com cartão parcelado...');
    const cardFinalizationData = {
      paymentMethod: 'card',
      cardInstallments: 3,
      cardInterest: 2.5,
      totalPaid: 205.00, // 200 + 5 de juros
      productDelivered: false,
      status: 'in_progress',
      observations: 'Teste de finalização com cartão parcelado'
    };

    await axios.post(`${API_BASE}/orders/${cardOrderResponse.data.id}/finalize`, cardFinalizationData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Ordem finalizada com cartão parcelado\n');

    // 6. Testar cancelamento
    console.log('7. Criando ordem para testar cancelamento...');
    const cancelOrderResponse = await axios.post(`${API_BASE}/orders`, {
      client_id: 1,
      items: [
        {
          product_id: 1,
          product_name: 'Óculos Cancelado',
          quantity: 1,
          unit_price: 100.00,
          total_price: 100.00
        }
      ],
      notes: 'Ordem para teste de cancelamento'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('8. Testando cancelamento...');
    const cancelFinalizationData = {
      paymentMethod: 'cash',
      totalPaid: 0,
      productDelivered: false,
      status: 'cancelled',
      cancellationReason: 'price',
      observations: 'Cliente desistiu pelo preço'
    };

    await axios.post(`${API_BASE}/orders/${cancelOrderResponse.data.id}/finalize`, cancelFinalizationData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Ordem cancelada com sucesso\n');

    // 7. Verificar ordens atualizadas
    console.log('9. Verificando ordens atualizadas...');
    const updatedOrdersResponse = await axios.get(`${API_BASE}/orders`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const completedOrders = updatedOrdersResponse.data.filter(order => order.status === 'completed');
    const inProgressOrders = updatedOrdersResponse.data.filter(order => order.status === 'in_progress');
    const cancelledOrders = updatedOrdersResponse.data.filter(order => order.status === 'cancelled');

    console.log(`📊 Resumo das ordens:`);
    console.log(`   - Concluídas: ${completedOrders.length}`);
    console.log(`   - Em Andamento: ${inProgressOrders.length}`);
    console.log(`   - Canceladas: ${cancelledOrders.length}`);
    console.log(`   - Pendentes: ${updatedOrdersResponse.data.filter(order => order.status === 'pending').length}`);

    // 8. Verificar totais do caixa
    console.log('\n10. Verificando totais do caixa...');
    const cashierTotalsResponse = await axios.get(`${API_BASE}/cashier/check-open-session`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const session = cashierTotalsResponse.data.session;
    console.log(`💰 Totais da sessão:`);
    console.log(`   - Dinheiro: R$ ${session.cash_sales.toFixed(2)}`);
    console.log(`   - Cartão: R$ ${session.card_sales.toFixed(2)}`);
    console.log(`   - PIX: R$ ${session.pix_sales.toFixed(2)}`);
    console.log(`   - Total: R$ ${session.total_sales.toFixed(2)}`);

    console.log('\n🎉 Todos os testes de finalização passaram com sucesso!');

  } catch (error) {
    console.error('❌ Erro nos testes:', error.response?.data || error.message);
  }
}

testOrderFinalization(); 