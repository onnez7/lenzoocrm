const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function addBillingCycleColumn() {
  try {
    console.log('🔧 Adicionando coluna billing_cycle na tabela subscriptions...');
    
    // Adicionar coluna billing_cycle
    await pool.query(`
      ALTER TABLE subscriptions 
      ADD COLUMN IF NOT EXISTS billing_cycle VARCHAR(10) DEFAULT 'monthly' 
      CHECK (billing_cycle IN ('monthly', 'yearly'))
    `);
    
    // Atualizar registros existentes
    await pool.query(`
      UPDATE subscriptions 
      SET billing_cycle = 'monthly' 
      WHERE billing_cycle IS NULL
    `);
    
    console.log('✅ Coluna billing_cycle adicionada com sucesso!');
    
    // Verificar estrutura da tabela
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'subscriptions' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Estrutura atual da tabela subscriptions:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao adicionar coluna billing_cycle:', error);
  } finally {
    await pool.end();
  }
}

addBillingCycleColumn(); 