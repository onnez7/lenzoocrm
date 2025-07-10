const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runSQL() {
  try {
    console.log('Executando script de funcionários e permissões...');
    
    const sqlContent = fs.readFileSync('./create-employees-permissions-tables.sql', 'utf8');
    const statements = sqlContent.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executando:', statement.substring(0, 50) + '...');
        await pool.query(statement);
      }
    }
    
    console.log('✅ Script executado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao executar script:', error.message);
  } finally {
    await pool.end();
  }
}

runSQL(); 