const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'lenzoocrm',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function fixReceivablesTable() {
  try {
    console.log('🔧 Corrigindo tabela receivables...');
    
    // Adicionar coluna payment_method se não existir
    await pool.query(`
      ALTER TABLE receivables 
      ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'bank_transfer';
    `);

    console.log('✅ Coluna payment_method adicionada!');
    
    // Verificar estrutura da tabela
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'receivables' 
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Estrutura atual da tabela receivables:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao corrigir tabela:', error.message);
  } finally {
    await pool.end();
  }
}

fixReceivablesTable(); 