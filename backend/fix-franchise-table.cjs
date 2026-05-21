const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'lenzoocrm',
});

async function fixFranchiseTable() {
  try {
    console.log('🔧 Corrigindo tabela franchises...\n');
    
    // 1. Verificar se a coluna updated_at existe
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'franchises' AND column_name = 'updated_at'
    `);
    
    if (checkColumn.rows.length === 0) {
      console.log('➕ Adicionando coluna updated_at...');
      await pool.query(`
        ALTER TABLE franchises 
        ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `);
      console.log('✅ Coluna updated_at adicionada!');
    } else {
      console.log('✅ Coluna updated_at já existe!');
    }
    
    // 2. Verificar se as colunas city e state existem
    const checkCity = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'franchises' AND column_name = 'city'
    `);
    
    if (checkCity.rows.length === 0) {
      console.log('➕ Adicionando coluna city...');
      await pool.query(`
        ALTER TABLE franchises 
        ADD COLUMN city VARCHAR(100)
      `);
      console.log('✅ Coluna city adicionada!');
    } else {
      console.log('✅ Coluna city já existe!');
    }
    
    const checkState = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'franchises' AND column_name = 'state'
    `);
    
    if (checkState.rows.length === 0) {
      console.log('➕ Adicionando coluna state...');
      await pool.query(`
        ALTER TABLE franchises 
        ADD COLUMN state VARCHAR(2)
      `);
      console.log('✅ Coluna state adicionada!');
    } else {
      console.log('✅ Coluna state já existe!');
    }
    
    // 3. Recriar a função update_updated_at_column
    console.log('🔄 Recriando função update_updated_at_column...');
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);
    console.log('✅ Função recriada!');
    
    // 4. Remover e recriar o trigger
    console.log('🔄 Recriando trigger...');
    await pool.query(`
      DROP TRIGGER IF EXISTS update_franchises_updated_at ON franchises
    `);
    
    await pool.query(`
      CREATE TRIGGER update_franchises_updated_at 
      BEFORE UPDATE ON franchises 
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column()
    `);
    console.log('✅ Trigger recriado!');
    
    // 5. Atualizar dados existentes
    console.log('🔄 Atualizando dados existentes...');
    await pool.query(`
      UPDATE franchises 
      SET city = 'São Paulo', state = 'SP' 
      WHERE city IS NULL OR state IS NULL
    `);
    console.log('✅ Dados atualizados!');
    
    // 6. Verificar estrutura final
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
    
    // 7. Verificar trigger
    console.log('\n🔍 Verificando trigger:');
    const trigger = await pool.query(`
      SELECT trigger_name, event_manipulation
      FROM information_schema.triggers 
      WHERE event_object_table = 'franchises'
    `);
    
    trigger.rows.forEach(row => {
      console.log(`- ${row.trigger_name}: ${row.event_manipulation}`);
    });
    
    console.log('\n✅ Tabela franchises corrigida com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await pool.end();
    process.exit();
  }
}

fixFranchiseTable(); 