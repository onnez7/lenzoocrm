const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/lenzoocrm',
});

async function checkAndFixUsersTable() {
  try {
    console.log('🔍 Verificando estrutura da tabela users...');
    
    // Verificar se a coluna is_active existe
    const columnCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'is_active'
    `);
    
    if (columnCheck.rows.length === 0) {
      console.log('❌ Coluna is_active não existe. Adicionando...');
      
      await pool.query(`
        ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT true
      `);
      
      console.log('✅ Coluna is_active adicionada com sucesso!');
    } else {
      console.log('✅ Coluna is_active já existe');
    }
    
    // Verificar todas as colunas
    const allColumns = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Todas as colunas da tabela users:');
    allColumns.rows.forEach(row => {
      console.log(`   - ${row.column_name}`);
    });
    
    // Testar uma consulta simples
    const testQuery = await pool.query(`
      SELECT id, name, email, role, is_active 
      FROM users 
      LIMIT 1
    `);
    
    console.log('✅ Consulta de teste funcionou!');
    console.log('📋 Exemplo de dados:', testQuery.rows[0]);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

checkAndFixUsersTable(); 