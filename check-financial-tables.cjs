const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'lenzoocrm',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function checkTables() {
  try {
    console.log('🔍 Verificando estrutura das tabelas financeiras...\n');

    // Verificar tabela payables
    console.log('📋 Tabela PAYABLES:');
    const payablesResult = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'payables' 
      ORDER BY ordinal_position;
    `);
    
    payablesResult.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
    });

    console.log('\n📋 Tabela RECEIVABLES:');
    const receivablesResult = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'receivables' 
      ORDER BY ordinal_position;
    `);
    
    receivablesResult.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
    });

    // Verificar se existem dados nas tabelas
    console.log('\n📊 Dados nas tabelas:');
    
    const payablesCount = await pool.query('SELECT COUNT(*) as count FROM payables');
    console.log(`  - PAYABLES: ${payablesCount.rows[0].count} registros`);
    
    const receivablesCount = await pool.query('SELECT COUNT(*) as count FROM receivables');
    console.log(`  - RECEIVABLES: ${receivablesCount.rows[0].count} registros`);

    // Verificar alguns registros de exemplo
    console.log('\n📝 Exemplo de registros PAYABLES:');
    const payablesSample = await pool.query('SELECT id, description, amount, status, payment_method FROM payables LIMIT 3');
    payablesSample.rows.forEach(row => {
      console.log(`  - ID ${row.id}: ${row.description} - R$ ${row.amount} - ${row.status} - ${row.payment_method}`);
    });

    console.log('\n📝 Exemplo de registros RECEIVABLES:');
    const receivablesSample = await pool.query('SELECT id, description, amount, status, payment_method FROM receivables LIMIT 3');
    receivablesSample.rows.forEach(row => {
      console.log(`  - ID ${row.id}: ${row.description} - R$ ${row.amount} - ${row.status} - ${row.payment_method}`);
    });

  } catch (error) {
    console.error('❌ Erro ao verificar tabelas:', error);
  } finally {
    await pool.end();
  }
}

checkTables(); 