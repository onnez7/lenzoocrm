const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: 'postgres',
  database: 'lenzoocrm',
  port: 5432,
});

async function checkTableStructure() {
  try {
    console.log('🔍 Verificando estrutura da tabela users...\n');
    
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('Colunas da tabela users:');
    result.rows.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    console.log('\n🔍 Verificando dados da tabela users...\n');
    
    const userResult = await pool.query('SELECT * FROM users LIMIT 1');
    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      console.log('Exemplo de usuário:');
      Object.keys(user).forEach(key => {
        console.log(`- ${key}: ${user[key]}`);
      });
    }
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await pool.end();
  }
}

checkTableStructure(); 