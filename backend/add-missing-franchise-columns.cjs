const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'lenzoocrm',
});

async function addMissingColumns() {
  try {
    console.log('🔧 Adicionando colunas faltantes na tabela franchises...\n');
    
    // 1. Adicionar coluna cnpj
    console.log('➕ Adicionando coluna cnpj...');
    await pool.query(`
      ALTER TABLE franchises 
      ADD COLUMN IF NOT EXISTS cnpj VARCHAR(18)
    `);
    console.log('✅ Coluna cnpj adicionada!');
    
    // 2. Adicionar coluna phone
    console.log('➕ Adicionando coluna phone...');
    await pool.query(`
      ALTER TABLE franchises 
      ADD COLUMN IF NOT EXISTS phone VARCHAR(20)
    `);
    console.log('✅ Coluna phone adicionada!');
    
    // 3. Adicionar coluna email
    console.log('➕ Adicionando coluna email...');
    await pool.query(`
      ALTER TABLE franchises 
      ADD COLUMN IF NOT EXISTS email VARCHAR(255)
    `);
    console.log('✅ Coluna email adicionada!');
    
    // 4. Verificar estrutura final
    console.log('\n📋 Estrutura final da tabela franchises:');
    const structure = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'franchises' 
      ORDER BY ordinal_position
    `);
    
    structure.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // 5. Atualizar dados existentes com valores padrão
    console.log('\n🔄 Atualizando dados existentes...');
    await pool.query(`
      UPDATE franchises 
      SET 
        cnpj = '00.000.000/0001-00',
        phone = '(11) 9999-9999',
        email = 'contato@franquia.com'
      WHERE cnpj IS NULL OR phone IS NULL OR email IS NULL
    `);
    console.log('✅ Dados atualizados!');
    
    // 6. Verificar dados
    console.log('\n📊 Dados após atualização:');
    const data = await pool.query('SELECT id, name, cnpj, email, phone, city, state FROM franchises LIMIT 3');
    data.rows.forEach(row => {
      console.log(`ID ${row.id}: ${row.name} | CNPJ: ${row.cnpj || 'N/A'} | Email: ${row.email || 'N/A'} | Phone: ${row.phone || 'N/A'} | City: ${row.city || 'N/A'} | State: ${row.state || 'N/A'}`);
    });
    
    console.log('\n✅ Todas as colunas foram adicionadas com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await pool.end();
    process.exit();
  }
}

addMissingColumns(); 