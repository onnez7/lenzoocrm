const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'lenzoocrm',
  password: 'postgres',
  port: 5432,
});

async function updateSessionTotals() {
  try {
    console.log('1. Atualizando totais de todas as sessões...');
    
    // Buscar todas as sessões
    const sessionsResult = await pool.query(`
      SELECT id, session_code, status 
      FROM cashier_sessions 
      ORDER BY open_time DESC
    `);
    
    console.log('Sessões encontradas:', sessionsResult.rows.length);
    
    for (const session of sessionsResult.rows) {
      console.log(`\nProcessando sessão ${session.session_code}...`);
      
      // Calcular total de vendas da sessão
      const salesResult = await pool.query(`
        SELECT 
          COUNT(*) as total_orders,
          COALESCE(SUM(total_amount), 0) as total_sales
        FROM service_orders 
        WHERE session_id = $1 AND status != 'cancelled'
      `, [session.id]);
      
      const totalOrders = salesResult.rows[0].total_orders;
      const totalSales = salesResult.rows[0].total_sales;
      
      console.log(`  Ordens: ${totalOrders}, Total: R$ ${totalSales}`);
      
      // Atualizar total_sales na sessão
      await pool.query(`
        UPDATE cashier_sessions 
        SET total_sales = $1 
        WHERE id = $2
      `, [totalSales, session.id]);
      
      console.log(`  ✅ Total atualizado para R$ ${totalSales}`);
    }
    
    console.log('\n2. Verificando resultado...');
    
    const finalResult = await pool.query(`
      SELECT 
        cs.id,
        cs.session_code,
        cs.total_sales,
        cs.status,
        e.name as employee_name
      FROM cashier_sessions cs
      LEFT JOIN employees e ON cs.employee_id = e.id
      ORDER BY cs.open_time DESC
    `);
    
    console.log('Sessões após atualização:');
    finalResult.rows.forEach(session => {
      console.log(`  ${session.session_code}: R$ ${session.total_sales || 0} (${session.status}) - ${session.employee_name}`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

updateSessionTotals(); 