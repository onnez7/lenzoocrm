const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'lenzoocrm',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function addPaymentMethodColumns() {
  try {
    console.log('🔧 Adicionando colunas payment_method...');
    
    // Adicionar payment_method na tabela payables
    await pool.query(`
      ALTER TABLE payables 
      ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'bank_transfer';
    `);
    console.log('✅ Coluna payment_method adicionada na tabela payables');
    
    // Adicionar payment_method na tabela receivables
    await pool.query(`
      ALTER TABLE receivables 
      ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'bank_transfer';
    `);
    console.log('✅ Coluna payment_method adicionada na tabela receivables');
    
    // Adicionar outras colunas que podem estar faltando
    await pool.query(`
      ALTER TABLE payables 
      ADD COLUMN IF NOT EXISTS bank_account_id INTEGER,
      ADD COLUMN IF NOT EXISTS credit_card_id INTEGER;
    `);
    console.log('✅ Colunas bank_account_id e credit_card_id adicionadas na tabela payables');
    
    await pool.query(`
      ALTER TABLE receivables 
      ADD COLUMN IF NOT EXISTS bank_account_id INTEGER,
      ADD COLUMN IF NOT EXISTS credit_card_id INTEGER;
    `);
    console.log('✅ Colunas bank_account_id e credit_card_id adicionadas na tabela receivables');
    
    console.log('🎉 Todas as colunas foram adicionadas com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao adicionar colunas:', error.message);
  } finally {
    await pool.end();
  }
}

addPaymentMethodColumns(); 