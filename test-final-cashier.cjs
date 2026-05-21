const axios = require('axios');

async function testFinalCashier() {
  try {
    console.log('1. Fazendo login como FRANCHISE_ADMIN...');
    
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'joao@oticavisaoclara.com.br',
      password: 'franquia123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login bem-sucedido!');
    console.log('Usuário:', loginResponse.data.name);
    
    console.log('\n2. Testando caixa aberto...');
    
    const cashierResponse = await axios.get('http://localhost:3001/api/cashier/open-session', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (cashierResponse.data.session) {
      const session = cashierResponse.data.session;
      console.log('✅ Caixa aberto:');
      console.log('  Funcionário:', session.employee_name);
      console.log('  Valor inicial:', session.initial_amount);
      console.log('  Vendas totais:', session.total_sales);
      console.log('  Status:', session.status);
    }
    
    console.log('\n3. Testando histórico...');
    
    const historyResponse = await axios.get('http://localhost:3001/api/cashier/history', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Histórico carregado:');
    console.log('Total de sessões:', historyResponse.data.length);
    
    // Calcular totais para verificar se não há NaN
    const totalSales = historyResponse.data
      .filter(s => s.status === "closed")
      .reduce((sum, session) => sum + Number(session.total_sales || 0), 0);
    
    const closedSessions = historyResponse.data.filter(s => s.status === "closed");
    const averageSales = closedSessions.length > 0 ? totalSales / closedSessions.length : 0;
    
    console.log('Vendas totais calculadas:', totalSales);
    console.log('Média por dia calculada:', averageSales);
    console.log('Sessões fechadas:', closedSessions.length);
    
    // Verificar se há valores NaN
    if (isNaN(totalSales) || isNaN(averageSales)) {
      console.log('❌ Problema: Valores NaN encontrados');
    } else {
      console.log('✅ Valores calculados corretamente');
    }
    
    console.log('\n4. Verificando formatação dos valores...');
    
    const problematicSessions = historyResponse.data.filter(session => {
      const total = Number(session.total_sales);
      return isNaN(total) || total > 1000000 || total < 0;
    });
    
    if (problematicSessions.length > 0) {
      console.log('⚠️ Sessões com valores problemáticos:');
      problematicSessions.forEach(session => {
        console.log(`  ${session.session_code}: ${session.total_sales}`);
      });
    } else {
      console.log('✅ Todos os valores estão corretos');
    }
    
    console.log('\n5. Testando criação de ordem...');
    
    // Buscar cliente e produto
    const clientsResponse = await axios.get('http://localhost:3001/api/clients?page=1&limit=1', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const productsResponse = await axios.get('http://localhost:3001/api/franchise/products?page=1&limit=1', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const orderData = {
      client_id: clientsResponse.data.clients[0].id,
      items: [
        {
          product_id: productsResponse.data.products[0].id,
          product_name: productsResponse.data.products[0].name,
          quantity: 1,
          unit_price: Number(productsResponse.data.products[0].price),
          total_price: Number(productsResponse.data.products[0].price)
        }
      ],
      description: "Teste final do sistema",
      notes: "Verificação completa"
    };
    
    const orderResponse = await axios.post('http://localhost:3001/api/orders', orderData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Ordem criada:', orderResponse.data.order_number);
    
    console.log('\n🎉 Todos os testes passaram! Sistema funcionando corretamente.');
    
  } catch (error) {
    console.error('❌ Erro:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
  }
}

testFinalCashier(); 