const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuração do banco de dados
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/lenzoocrm',
});

async function createUserSettingsTable() {
  try {
    console.log('🔄 Iniciando criação da tabela de configurações de usuário...');
    
    // Ler o arquivo SQL
    const sqlPath = path.join(__dirname, 'create-user-settings-table.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📄 Executando script SQL...');
    
    // Executar o SQL
    await pool.query(sqlContent);
    
    console.log('✅ Tabela de configurações de usuário criada com sucesso!');
    console.log('✅ Colunas adicionais na tabela users criadas com sucesso!');
    
    // Verificar se a tabela foi criada
    const tableCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'user_settings'
    `);
    
    if (tableCheck.rows.length > 0) {
      console.log('✅ Tabela user_settings existe no banco de dados');
    } else {
      console.log('❌ Erro: Tabela user_settings não foi criada');
    }
    
    // Verificar colunas na tabela users
    const columnsCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('phone', 'bio', 'address', 'avatar', 'last_login')
    `);
    
    console.log('📋 Colunas encontradas na tabela users:');
    columnsCheck.rows.forEach(row => {
      console.log(`   - ${row.column_name}`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao criar tabela de configurações:', error);
  } finally {
    await pool.end();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  createUserSettingsTable();
}

module.exports = { createUserSettingsTable }; 