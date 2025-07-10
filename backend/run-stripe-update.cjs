require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function updateSubscriptionsTables() {
  try {
    console.log('🔄 Atualizando tabelas de assinaturas para Stripe...');
    
    const sql = fs.readFileSync('update-subscriptions-stripe.sql', 'utf8');
    await pool.query(sql);
    
    console.log('✅ Tabelas de assinaturas atualizadas com sucesso!');
    
    // Verificar se as tabelas foram criadas
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('subscription_payments', 'subscription_notifications')
    `);
    
    console.log('📋 Tabelas criadas:', result.rows.map(row => row.table_name));
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

updateSubscriptionsTables(); 