const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'lenzoocrm',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function addInstallmentFields() {
  try {
    console.log('🔧 Adicionando campos de parcelamento...');
    
    await pool.query(`
      ALTER TABLE service_orders 
      ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20) DEFAULT 'cash' CHECK (payment_method IN ('cash', 'credit_card', 'debit_card', 'pix', 'bank_transfer', 'installments')),
      ADD COLUMN IF NOT EXISTS installments INTEGER DEFAULT 1,
      ADD COLUMN IF NOT EXISTS installment_amount DECIMAL(10,2) DEFAULT 0;
    `);

    console.log('✅ Campos de parcelamento adicionados com sucesso!');
    
    // Atualizar valores padrão
    await pool.query(`
      UPDATE service_orders 
      SET installment_amount = total_amount 
      WHERE installment_amount = 0 OR installment_amount IS NULL;
    `);
    
    console.log('✅ Valores padrão atualizados!');
    
  } catch (error) {
    console.error('❌ Erro ao adicionar campos:', error.message);
  } finally {
    await pool.end();
  }
}

addInstallmentFields(); 