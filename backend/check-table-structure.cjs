const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'lenzoocrm',
});

async function checkTableStructure() {
  try {
    console.log('Verificando estrutura da tabela clients...');
    
    const client = await pool.connect();
    
    // Verificar colunas da tabela clients
    const columnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'clients'
      ORDER BY ordinal_position
    `);
    
    console.log('Colunas da tabela clients:');
    columnsResult.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // Verificar se updated_at existe
    const hasUpdatedAt = columnsResult.rows.some(row => row.column_name === 'updated_at');
    console.log(`\nColuna updated_at existe: ${hasUpdatedAt}`);
    
    if (!hasUpdatedAt) {
      console.log('\nAdicionando coluna updated_at...');
      await client.query(`
        ALTER TABLE clients 
        ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `);
      console.log('Coluna updated_at adicionada com sucesso!');
    }
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('Erro:', error.message);
    await pool.end();
  }
}

checkTableStructure(); 