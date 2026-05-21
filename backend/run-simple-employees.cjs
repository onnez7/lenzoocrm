const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'lenzoocrm',
});

async function runSQL() {
  try {
    console.log('Executando script de funcionários...');
    
    const sqlContent = fs.readFileSync('./create-employees-simple.sql', 'utf8');
    await pool.query(sqlContent);
    
    console.log('✅ Tabelas de funcionários criadas com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao executar script:', error.message);
  } finally {
    await pool.end();
  }
}

runSQL(); 