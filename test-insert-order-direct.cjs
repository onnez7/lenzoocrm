const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'lenzoocrm',
  password: 'postgres',
  port: 5432,
});

async function testInsertOrderDirect() {
  try {
    console.log('1. Verificando se há caixa aberto para franquia 1...');
    
    const cashierResult = await pool.query(
      'SELECT * FROM cashier_sessions WHERE franchise_id = 1 AND status = \'open\' ORDER BY open_time DESC LIMIT 1'
    );
    
    if (cashierResult.rows.length === 0) {
      console.log('❌ Não há caixa aberto para franquia 1');
      return;
    }
    
    const session = cashierResult.rows[0];
    console.log('✅ Caixa aberto encontrado:');
    console.log('Session ID:', session.id);
    console.log('Employee ID:', session.employee_id);
    console.log('Franchise ID:', session.franchise_id);
    
    console.log('\n2. Verificando se o cliente existe...');
    
    const clientResult = await pool.query(
      'SELECT * FROM clients WHERE franchise_id = 1 LIMIT 1'
    );
    
    if (clientResult.rows.length === 0) {
      console.log('❌ Não há clientes para franquia 1');
      return;
    }
    
    const client = clientResult.rows[0];
    console.log('✅ Cliente encontrado:');
    console.log('Client ID:', client.id);
    console.log('Name:', client.name);
    console.log('Franchise ID:', client.franchise_id);
    
    console.log('\n3. Gerando número da ordem...');
    
    const orderNumberResult = await pool.query('SELECT generate_order_number() as order_number');
    const orderNumber = orderNumberResult.rows[0].order_number;
    console.log('✅ Número da ordem:', orderNumber);
    
    console.log('\n4. Testando inserção da ordem...');
    
    const insertOrderResult = await pool.query(
      `INSERT INTO service_orders (order_number, client_id, employee_id, session_id, status, total_amount, description, notes)
       VALUES ($1, $2, $3, $4, 'pending', $5, $6, $7) RETURNING *`,
      [orderNumber, client.id, session.employee_id, session.id, 10.00, 'Teste direto', 'Teste']
    );
    
    console.log('✅ Ordem inserida com sucesso!');
    console.log('Order ID:', insertOrderResult.rows[0].id);
    console.log('Order Number:', insertOrderResult.rows[0].order_number);
    
    console.log('\n5. Testando inserção do item...');
    
    const insertItemResult = await pool.query(
      `INSERT INTO service_order_items (order_id, product_id, product_name, quantity, unit_price, total_price)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [insertOrderResult.rows[0].id, 1, 'Produto Teste', 1, 10.00, 10.00]
    );
    
    console.log('✅ Item inserido com sucesso!');
    console.log('Item ID:', insertItemResult.rows[0].id);
    
    console.log('\n6. Limpando dados de teste...');
    
    await pool.query('DELETE FROM service_order_items WHERE order_id = $1', [insertOrderResult.rows[0].id]);
    await pool.query('DELETE FROM service_orders WHERE id = $1', [insertOrderResult.rows[0].id]);
    
    console.log('✅ Dados de teste removidos');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('Detail:', error.detail);
    console.error('Hint:', error.hint);
  } finally {
    await pool.end();
  }
}

testInsertOrderDirect(); 