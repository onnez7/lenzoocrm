const db = require('./backend/src/config/db');

async function checkFranchiseColumns() {
  try {
    console.log('🔍 Verificando tabelas com coluna franchise_id...\n');
    
    const result = await db.query(`
      SELECT table_name, column_name 
      FROM information_schema.columns 
      WHERE column_name = 'franchise_id' 
      ORDER BY table_name
    `);
    
    console.log('Tabelas que possuem franchise_id:');
    result.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });
    
    console.log(`\nTotal: ${result.rows.length} tabelas`);
    
    // Verificar tabelas específicas que estamos usando
    const tablesToCheck = ['receivables', 'payables', 'employees', 'cashier_sangrias', 'service_orders', 'clients'];
    
    console.log('\n🔍 Verificando estrutura das tabelas financeiras:');
    for (const table of tablesToCheck) {
      try {
        const columns = await db.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = '${table}' 
          ORDER BY ordinal_position
        `);
        
        const hasFranchiseId = columns.rows.some(col => col.column_name === 'franchise_id');
        console.log(`${table}: ${hasFranchiseId ? '✅ TEM franchise_id' : '❌ NÃO TEM franchise_id'}`);
        
        if (!hasFranchiseId) {
          console.log(`  Colunas: ${columns.rows.map(c => c.column_name).join(', ')}`);
        }
      } catch (err) {
        console.log(`${table}: ❌ ERRO - ${err.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    process.exit();
  }
}

checkFranchiseColumns(); 