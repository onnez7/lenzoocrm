const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'lenzoocrm',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function resetStatus() {
  try {
    console.log('🔄 Resetando status de algumas contas para "pending"...\n');

    // Resetar algumas contas a pagar
    const payablesResult = await pool.query(`
      UPDATE payables 
      SET status = 'pending', payment_date = NULL 
      WHERE id IN (4, 5) 
      RETURNING id, description, status
    `);

    console.log('📝 Contas a pagar resetadas:');
    payablesResult.rows.forEach(row => {
      console.log(`  - ID ${row.id}: ${row.description} → ${row.status}`);
    });

    // Resetar algumas contas a receber
    const receivablesResult = await pool.query(`
      UPDATE receivables 
      SET status = 'pending', payment_date = NULL 
      WHERE id IN (4, 5) 
      RETURNING id, description, status
    `);

    console.log('\n📝 Contas a receber resetadas:');
    receivablesResult.rows.forEach(row => {
      console.log(`  - ID ${row.id}: ${row.description} → ${row.status}`);
    });

    console.log('\n✅ Status resetado com sucesso!');
    console.log('🎯 Agora você pode testar a funcionalidade de marcar como paga/recebida novamente.');

  } catch (error) {
    console.error('❌ Erro ao resetar status:', error);
  } finally {
    await pool.end();
  }
}

resetStatus(); 