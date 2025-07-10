const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: 'postgres',
  database: 'lenzoocrm',
  port: 5432,
});

async function checkUsers() {
  try {
    console.log('🔍 Verificando usuários no banco...\n');
    
    const result = await pool.query('SELECT id, name, email, role FROM users ORDER BY id');
    
    console.log('Usuários encontrados:');
    result.rows.forEach(user => {
      console.log(`- ID: ${user.id}, Nome: ${user.name}, Email: ${user.email}, Role: ${user.role}`);
    });
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await pool.end();
  }
}

checkUsers(); 