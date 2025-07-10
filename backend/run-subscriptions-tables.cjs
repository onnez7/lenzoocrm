const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'lenzoocrm',
});

async function createSubscriptionTables() {
  try {
    console.log('🔧 Criando tabelas de assinaturas...\n');
    
    // Ler o arquivo SQL
    const fs = require('fs');
    const path = require('path');
    const sqlPath = path.join(__dirname, 'create-subscriptions-tables.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Executar o SQL
    await pool.query(sqlContent);
    
    console.log('✅ Tabelas de assinaturas criadas com sucesso!');
    
    // Verificar dados criados
    console.log('\n📊 Verificando dados criados:');
    
    const plans = await pool.query('SELECT * FROM subscription_plans');
    console.log(`\n📋 Planos criados: ${plans.rows.length}`);
    plans.rows.forEach(plan => {
      console.log(`- ${plan.name}: R$ ${plan.price} (${plan.max_users === -1 ? 'Ilimitado' : plan.max_users} usuários)`);
    });
    
    const subscriptions = await pool.query(`
      SELECT s.*, f.name as franchise_name, sp.name as plan_name
      FROM subscriptions s
      JOIN franchises f ON s.franchise_id = f.id
      JOIN subscription_plans sp ON s.plan_id = sp.id
    `);
    console.log(`\n📋 Assinaturas criadas: ${subscriptions.rows.length}`);
    subscriptions.rows.forEach(sub => {
      console.log(`- ${sub.franchise_name}: ${sub.plan_name} (${sub.status})`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await pool.end();
    process.exit();
  }
}

createSubscriptionTables(); 