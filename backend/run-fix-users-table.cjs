const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuração do banco de dados
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/lenzoocrm',
});

async function fixUsersTable() {
  try {
    console.log('🔄 Corrigindo tabela users...');
    
    // Ler o arquivo SQL
    const sqlPath = path.join(__dirname, 'fix-users-table.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📄 Executando script SQL...');
    
    // Executar o SQL
    await pool.query(sqlContent);
    
    console.log('✅ Tabela users corrigida com sucesso!');
    
    // Verificar se a coluna foi criada
    const columnCheck = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'is_active'
    `);
    
    if (columnCheck.rows.length > 0) {
      console.log('✅ Coluna is_active existe na tabela users');
      console.log('📋 Detalhes da coluna:', columnCheck.rows[0]);
    } else {
      console.log('❌ Erro: Coluna is_active não foi criada');
    }
    
    // Verificar todas as colunas da tabela users
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
    
  } catch (error) {
    console.error('❌ Erro ao corrigir tabela users:', error);
  } finally {
    await pool.end();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  fixUsersTable();
}

module.exports = { fixUsersTable }; 