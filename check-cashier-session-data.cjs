const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'lenzoocrm',
  password: 'postgres',
  port: 5432,
});

async function checkCashierSessionData() {
  try {
    console.log('1. Verificando sessões de caixa abertas...');
    
    const sessionsResult = await pool.query(`
      SELECT 
        cs.*,
        u.name as user_name,
        e.name as employee_name,
        e.user_id
      FROM cashier_sessions cs
      LEFT JOIN users u ON cs.employee_id = u.id
      LEFT JOIN employees e ON cs.employee_id = e.id
      WHERE cs.status = 'open'
      ORDER BY cs.open_time DESC
    `);
    
    console.log('Sessões abertas encontradas:', sessionsResult.rows.length);
    
    sessionsResult.rows.forEach((session, index) => {
      console.log(`\nSessão ${index + 1}:`);
      console.log('  ID:', session.id);
      console.log('  Session Code:', session.session_code);
      console.log('  Employee ID:', session.employee_id);
      console.log('  User Name:', session.user_name);
      console.log('  Employee Name:', session.employee_name);
      console.log('  User ID:', session.user_id);
      console.log('  Franchise ID:', session.franchise_id);
      console.log('  Open Time:', session.open_time);
      console.log('  Initial Amount:', session.initial_amount);
      console.log('  Total Sales:', session.total_sales);
    });
    
    console.log('\n2. Verificando dados do usuário João Silva...');
    
    const userResult = await pool.query(`
      SELECT 
        u.*,
        e.id as employee_id,
        e.name as employee_name
      FROM users u
      LEFT JOIN employees e ON u.id = e.user_id
      WHERE u.id = 7
    `);
    
    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      console.log('Usuário:', user.name);
      console.log('Email:', user.email);
      console.log('Role:', user.role);
      console.log('Employee ID:', user.employee_id);
      console.log('Employee Name:', user.employee_name);
    }
    
    console.log('\n3. Verificando se há vendas registradas...');
    
    const salesResult = await pool.query(`
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total_amount), 0) as total_sales
      FROM service_orders 
      WHERE session_id = 7 AND status != 'cancelled'
    `);
    
    console.log('Total de ordens:', salesResult.rows[0].total_orders);
    console.log('Total de vendas:', salesResult.rows[0].total_sales);
    
    console.log('\n4. Verificando ordens da sessão atual...');
    
    const ordersResult = await pool.query(`
      SELECT 
        id,
        order_number,
        total_amount,
        status,
        created_at
      FROM service_orders 
      WHERE session_id = 7
      ORDER BY created_at DESC
    `);
    
    console.log('Ordens encontradas:', ordersResult.rows.length);
    ordersResult.rows.forEach(order => {
      console.log(`  ${order.order_number}: R$ ${order.total_amount} (${order.status})`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

checkCashierSessionData(); 