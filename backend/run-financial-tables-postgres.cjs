const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuração do banco PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'lenzoocrm',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function createFinancialTables() {
  try {
    console.log('🔌 Conectando ao banco PostgreSQL...');
    
    // Ler o arquivo SQL
    const sqlPath = path.join(__dirname, 'create-financial-tables-postgres.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📋 Executando script SQL...');
    
    // Executar o script SQL
    await pool.query(sqlContent);
    
    console.log('✅ Tabelas financeiras criadas com sucesso!');
    
    // Verificar se as tabelas foram criadas
    const tables = ['bank_accounts', 'credit_cards', 'payables', 'receivables', 'invoices'];
    
    for (const table of tables) {
      const result = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `, [table]);
      
      if (result.rows[0].exists) {
        console.log(`✅ Tabela ${table} criada com sucesso`);
      } else {
        console.log(`❌ Erro ao criar tabela ${table}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro ao criar tabelas financeiras:', error.message);
  } finally {
    await pool.end();
  }
}

createFinancialTables(); 