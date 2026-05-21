const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'lenzoocrm',
  password: 'postgres',
  port: 5432,
});

async function fixCashierSession() {
  try {
    console.log('1. Corrigindo employee_id da sessão de caixa...');
    
    // Atualizar a sessão para usar o employee_id correto (João Silva)
    const updateSessionResult = await pool.query(`
      UPDATE cashier_sessions 
      SET employee_id = 2 
      WHERE id = 7
    `);
    
    console.log('✅ Sessão atualizada para João Silva');
    
    console.log('\n2. Calculando total de vendas da sessão...');
    
    const salesResult = await pool.query(`
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total_amount), 0) as total_sales
      FROM service_orders 
      WHERE session_id = 7 AND status != 'cancelled'
    `);
    
    const totalOrders = salesResult.rows[0].total_orders;
    const totalSales = salesResult.rows[0].total_sales;
    
    console.log('Total de ordens:', totalOrders);
    console.log('Total de vendas:', totalSales);
    
    console.log('\n3. Atualizando total_sales na sessão...');
    
    const updateSalesResult = await pool.query(`
      UPDATE cashier_sessions 
      SET total_sales = $1 
      WHERE id = 7
    `, [totalSales]);
    
    console.log('✅ Total de vendas atualizado na sessão');
    
    console.log('\n4. Verificando resultado...');
    
    const sessionResult = await pool.query(`
      SELECT 
        cs.*,
        u.name as user_name,
        e.name as employee_name
      FROM cashier_sessions cs
      LEFT JOIN users u ON cs.employee_id = u.id
      LEFT JOIN employees e ON cs.employee_id = e.id
      WHERE cs.id = 7
    `);
    
    if (sessionResult.rows.length > 0) {
      const session = sessionResult.rows[0];
      console.log('Sessão atualizada:');
      console.log('  Employee ID:', session.employee_id);
      console.log('  User Name:', session.user_name);
      console.log('  Employee Name:', session.employee_name);
      console.log('  Total Sales:', session.total_sales);
    }
    
    console.log('\n5. Verificando se há problemas no histórico...');
    
    const historyResult = await pool.query(`
      SELECT 
        id,
        session_code,
        employee_id,
        total_sales,
        status,
        open_time,
        close_time
      FROM cashier_sessions 
      ORDER BY open_time DESC
      LIMIT 5
    `);
    
    console.log('Últimas 5 sessões:');
    historyResult.rows.forEach(session => {
      console.log(`  ${session.session_code}: R$ ${session.total_sales || 0} (${session.status}) - Employee: ${session.employee_id}`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

fixCashierSession(); 