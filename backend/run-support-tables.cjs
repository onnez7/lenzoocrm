const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/lenzoocrm',
});

async function createSupportTables() {
  try {
    console.log('🔄 Iniciando criação das tabelas de suporte...');
    const sqlPath = path.join(__dirname, 'create-support-tables.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    await pool.query(sqlContent);
    console.log('✅ Tabelas de suporte criadas com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao criar tabelas de suporte:', error);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  createSupportTables();
}

module.exports = { createSupportTables }; 