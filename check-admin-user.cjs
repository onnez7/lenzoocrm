const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkAdminUser() {
  try {
    console.log('🔍 Verificando usuários admin no banco...\n');

    const result = await pool.query(`
      SELECT id, email, role, franchise_id, created_at 
      FROM users 
      WHERE role IN ('SUPER_ADMIN', 'FRANCHISE_ADMIN')
      ORDER BY created_at DESC
    `);

    if (result.rows.length === 0) {
      console.log('❌ Nenhum usuário admin encontrado!');
      console.log('💡 Execute o script create-admin.js para criar um usuário admin');
    } else {
      console.log('✅ Usuários admin encontrados:');
      result.rows.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user.id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Franchise ID: ${user.franchise_id}`);
        console.log(`   Criado em: ${user.created_at}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Erro ao verificar usuários:', error);
  } finally {
    await pool.end();
  }
}

checkAdminUser(); 