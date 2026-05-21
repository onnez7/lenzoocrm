const { Pool } = require('pg');
require('dotenv').config({ path: './backend/.env' });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'lenzoocrm',
});

async function checkFinanceTables() {
  try {
    console.log('🔍 Verificando tabelas financeiras...\n');

    // Verificar se as tabelas existem
    const tables = [
      'receivables',
      'payables', 
      'service_orders',
      'employees',
      'cashier_sangrias'
    ];

    for (const table of tables) {
      console.log(`📋 Verificando tabela: ${table}`);
      
      try {
        const result = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`   ✅ Tabela existe com ${result.rows[0].count} registros`);
        
        // Mostrar alguns registros de exemplo
        const sampleResult = await pool.query(`SELECT * FROM ${table} LIMIT 3`);
        if (sampleResult.rows.length > 0) {
          console.log(`   📝 Exemplo de registro:`);
          console.log(`      ${JSON.stringify(sampleResult.rows[0], null, 6)}`);
        }
        console.log('');
      } catch (error) {
        console.log(`   ❌ Erro na tabela ${table}:`, error.message);
        console.log('');
      }
    }

    // Verificar estrutura das tabelas
    console.log('🏗️ Verificando estrutura das tabelas...\n');
    
    for (const table of tables) {
      try {
        const result = await pool.query(`
          SELECT column_name, data_type, is_nullable 
          FROM information_schema.columns 
          WHERE table_name = '${table}'
          ORDER BY ordinal_position
        `);
        
        console.log(`📊 Estrutura da tabela ${table}:`);
        result.rows.forEach(col => {
          console.log(`   ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
        });
        console.log('');
      } catch (error) {
        console.log(`   ❌ Erro ao verificar estrutura de ${table}:`, error.message);
        console.log('');
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  } finally {
    await pool.end();
  }
}

checkFinanceTables(); 