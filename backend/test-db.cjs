const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'lenzoocrm',
});

async function testConnection() {
  try {
    console.log('Testando conexão com o banco...');
    
    const client = await pool.connect();
    console.log('Conexão estabelecida!');
    
    // Testar se a tabela clients existe
    const tableResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'clients'
    `);
    
    console.log('Tabela clients existe:', tableResult.rows.length > 0);
    
    if (tableResult.rows.length > 0) {
      // Contar registros na tabela clients
      const countResult = await client.query('SELECT COUNT(*) FROM clients');
      console.log('Total de clientes:', countResult.rows[0].count);
      
      // Buscar alguns clientes
      const clientsResult = await client.query('SELECT id, name FROM clients LIMIT 3');
      console.log('Primeiros clientes:', clientsResult.rows);
    }
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('Erro:', error.message);
    await pool.end();
  }
}

testConnection(); 