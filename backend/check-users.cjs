const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkUsers() {
  try {
    const result = await pool.query('SELECT id, name, email, role, franchise_id FROM users LIMIT 5');
    console.log('Usuários encontrados:');
    result.rows.forEach(user => {
      console.log(`- ID: ${user.id}, Nome: ${user.name}, Email: ${user.email}, Role: ${user.role}, Franquia: ${user.franchise_id}`);
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
  } finally {
    await pool.end();
    process.exit();
  }
}

checkUsers(); 