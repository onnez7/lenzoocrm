const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'lenzoocrm',
});

async function checkFranchiseStructure() {
  try {
    console.log('🔍 Verificando estrutura da tabela franchises...\n');
    
    // Verificar todas as colunas da tabela
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'franchises' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Colunas atuais da tabela franchises:');
    columns.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // Verificar se as colunas necessárias existem
    const requiredColumns = ['id', 'name', 'cnpj', 'address', 'phone', 'email', 'city', 'state', 'status', 'created_at', 'updated_at'];
    const existingColumns = columns.rows.map(row => row.column_name);
    
    console.log('\n🔍 Verificando colunas necessárias:');
    requiredColumns.forEach(col => {
      const exists = existingColumns.includes(col);
      console.log(`${exists ? '✅' : '❌'} ${col}: ${exists ? 'EXISTE' : 'FALTA'}`);
    });
    
    // Verificar triggers
    console.log('\n🔍 Verificando triggers:');
    const triggers = await pool.query(`
      SELECT trigger_name, event_manipulation
      FROM information_schema.triggers 
      WHERE event_object_table = 'franchises'
    `);
    
    triggers.rows.forEach(row => {
      console.log(`- ${row.trigger_name}: ${row.event_manipulation}`);
    });
    
    // Verificar dados existentes
    console.log('\n📊 Dados existentes:');
    const data = await pool.query('SELECT id, name, cnpj, email, phone, city, state FROM franchises LIMIT 5');
    data.rows.forEach(row => {
      console.log(`ID ${row.id}: ${row.name} | CNPJ: ${row.cnpj || 'N/A'} | Email: ${row.email || 'N/A'} | Phone: ${row.phone || 'N/A'} | City: ${row.city || 'N/A'} | State: ${row.state || 'N/A'}`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await pool.end();
    process.exit();
  }
}

checkFranchiseStructure(); 