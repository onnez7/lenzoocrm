const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'lenzoocrm',
  password: 'postgres',
  port: 5432,
});

async function checkOrdersSessionLink() {
  try {
    console.log('1. Verificando ordens e suas sessões...');
    
    const ordersResult = await pool.query(`
      SELECT 
        so.id,
        so.order_number,
        so.total_amount,
        so.status,
        so.created_at,
        so.session_id,
        cs.session_code,
        cs.status as session_status,
        e.name as employee_name,
        c.name as client_name
      FROM service_orders so
      LEFT JOIN cashier_sessions cs ON so.session_id = cs.id
      LEFT JOIN employees e ON so.employee_id = e.id
      LEFT JOIN clients c ON so.client_id = c.id
      ORDER BY so.created_at DESC
    `);
    
    console.log('Ordens encontradas:', ordersResult.rows.length);
    
    ordersResult.rows.forEach(order => {
      console.log(`\nOrdem ${order.order_number}:`);
      console.log('  ID:', order.id);
      console.log('  Total:', order.total_amount);
      console.log('  Status:', order.status);
      console.log('  Session ID:', order.session_id);
      console.log('  Session Code:', order.session_code);
      console.log('  Session Status:', order.session_status);
      console.log('  Employee:', order.employee_name);
      console.log('  Client:', order.client_name);
      
      if (!order.session_id) {
        console.log('  ⚠️ Ordem sem sessão!');
      }
    });
    
    console.log('\n2. Verificando se há ordens sem session_id...');
    
    const orphanOrders = await pool.query(`
      SELECT COUNT(*) as count
      FROM service_orders 
      WHERE session_id IS NULL
    `);
    
    console.log('Ordens sem sessão:', orphanOrders.rows[0].count);
    
    if (orphanOrders.rows[0].count > 0) {
      console.log('⚠️ Há ordens sem sessão! Vamos corrigir...');
      
      // Buscar sessão aberta atual
      const openSession = await pool.query(`
        SELECT id FROM cashier_sessions 
        WHERE status = 'open' 
        ORDER BY open_time DESC LIMIT 1
      `);
      
      if (openSession.rows.length > 0) {
        const sessionId = openSession.rows[0].id;
        console.log('Atribuindo ordens à sessão:', sessionId);
        
        await pool.query(`
          UPDATE service_orders 
          SET session_id = $1 
          WHERE session_id IS NULL
        `, [sessionId]);
        
        console.log('✅ Ordens corrigidas');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

checkOrdersSessionLink(); 