const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'lenzoocrm',
  password: 'postgres',
  port: 5432,
});

async function testFindOpenSession() {
  try {
    console.log('1. Testando função findOpenCashierSession diretamente...');
    
    const result = await pool.query(
      'SELECT * FROM cashier_sessions WHERE franchise_id = 1 AND status = \'open\' ORDER BY open_time DESC LIMIT 1'
    );
    
    if (result.rows.length === 0) {
      console.log('❌ Não há caixa aberto para franquia 1');
      return;
    }
    
    const session = result.rows[0];
    console.log('✅ Caixa aberto encontrado:');
    console.log('Session ID:', session.id);
    console.log('Employee ID:', session.employee_id);
    console.log('Franchise ID:', session.franchise_id);
    console.log('Status:', session.status);
    
    console.log('\n2. Verificando se o funcionário existe...');
    
    const employeeResult = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [session.employee_id]
    );
    
    if (employeeResult.rows.length === 0) {
      console.log('❌ Funcionário não encontrado');
      return;
    }
    
    console.log('✅ Funcionário encontrado:', employeeResult.rows[0].name);
    
    console.log('\n3. Verificando se o cliente existe...');
    
    const clientResult = await pool.query(
      'SELECT * FROM clients WHERE franchise_id = 1 LIMIT 1'
    );
    
    if (clientResult.rows.length === 0) {
      console.log('❌ Cliente não encontrado');
      return;
    }
    
    console.log('✅ Cliente encontrado:', clientResult.rows[0].name);
    
    console.log('\n4. Testando inserção completa...');
    
    // Gerar número da ordem
    const orderNumberResult = await pool.query('SELECT generate_order_number() as order_number');
    const orderNumber = orderNumberResult.rows[0].order_number;
    
    // Calcular total
    const totalAmount = 560; // Valor fixo para teste
    
    // Inserir ordem
    const orderResult = await pool.query(
      `INSERT INTO service_orders (order_number, client_id, employee_id, session_id, status, total_amount, description, notes)
       VALUES ($1, $2, $3, $4, 'pending', $5, $6, $7) RETURNING *`,
      [orderNumber, clientResult.rows[0].id, session.employee_id, session.id, totalAmount, 'Teste completo', 'Teste']
    );
    
    console.log('✅ Ordem inserida com sucesso!');
    console.log('Order ID:', orderResult.rows[0].id);
    console.log('Order Number:', orderResult.rows[0].order_number);
    
    // Inserir item
    const itemResult = await pool.query(
      `INSERT INTO service_order_items (order_id, product_id, product_name, quantity, unit_price, total_price)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [orderResult.rows[0].id, 11, 'Armação Carrera 6001', 2, 280, 560]
    );
    
    console.log('✅ Item inserido com sucesso!');
    console.log('Item ID:', itemResult.rows[0].id);
    
    console.log('\n5. Limpando dados de teste...');
    
    await pool.query('DELETE FROM service_order_items WHERE order_id = $1', [orderResult.rows[0].id]);
    await pool.query('DELETE FROM service_orders WHERE id = $1', [orderResult.rows[0].id]);
    
    console.log('✅ Dados de teste removidos');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('Detail:', error.detail);
    console.error('Hint:', error.hint);
  } finally {
    await pool.end();
  }
}

testFindOpenSession(); 