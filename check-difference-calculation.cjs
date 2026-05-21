const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'lenzoocrm',
  password: 'postgres',
  port: 5432,
});

async function checkDifferenceCalculation() {
  try {
    console.log('1. Verificando sessões com problemas de diferença...');
    
    const sessionsResult = await pool.query(`
      SELECT 
        cs.*,
        e.name as employee_name
      FROM cashier_sessions cs
      LEFT JOIN employees e ON cs.employee_id = e.id
      WHERE cs.status = 'closed'
      ORDER BY cs.close_time DESC
    `);
    
    console.log('Sessões fechadas encontradas:', sessionsResult.rows.length);
    
    for (const session of sessionsResult.rows) {
      console.log(`\nSessão ${session.session_code}:`);
      console.log('  Employee:', session.employee_name);
      console.log('  Initial Amount:', session.initial_amount);
      console.log('  Total Sales:', session.total_sales);
      console.log('  Final Amount:', session.final_amount);
      console.log('  Difference:', session.difference);
      
      // Verificar se a diferença está correta
      const expectedTotal = Number(session.initial_amount || 0) + Number(session.total_sales || 0);
      const actualDifference = Number(session.final_amount || 0) - expectedTotal;
      
      console.log('  Expected Total:', expectedTotal);
      console.log('  Calculated Difference:', actualDifference);
      
      if (session.difference !== actualDifference) {
        console.log('  ⚠️ Diferença incorreta, corrigindo...');
        
        await pool.query(`
          UPDATE cashier_sessions 
          SET difference = $1 
          WHERE id = $2
        `, [actualDifference, session.id]);
        
        console.log('  ✅ Diferença corrigida');
      } else {
        console.log('  ✅ Diferença correta');
      }
    }
    
    console.log('\n2. Verificando se há valores nulos que causam NaN...');
    
    const nullCheckResult = await pool.query(`
      SELECT 
        id,
        session_code,
        initial_amount,
        total_sales,
        final_amount,
        difference
      FROM cashier_sessions 
      WHERE 
        initial_amount IS NULL OR 
        total_sales IS NULL OR 
        final_amount IS NULL OR
        difference IS NULL
    `);
    
    if (nullCheckResult.rows.length > 0) {
      console.log('Sessões com valores nulos encontradas:');
      nullCheckResult.rows.forEach(session => {
        console.log(`  ${session.session_code}: initial=${session.initial_amount}, sales=${session.total_sales}, final=${session.final_amount}, diff=${session.difference}`);
      });
    } else {
      console.log('✅ Nenhum valor nulo encontrado');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

checkDifferenceCalculation(); 