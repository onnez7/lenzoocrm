const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'lenzoocrm',
});

async function createAdmin() {
  try {
    // Conectar ao banco
    const client = await pool.connect();
    
    // Criar senha criptografada
    const password = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    console.log('Senha criptografada:', passwordHash);
    
    // Verificar se o usuário já existe
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      ['admin@matriz.com']
    );
    
    if (existingUser.rows.length > 0) {
      // Atualizar a senha do usuário existente
      await client.query(
        'UPDATE users SET password_hash = $1 WHERE email = $2',
        [passwordHash, 'admin@matriz.com']
      );
      console.log('Usuário admin atualizado com nova senha');
    } else {
      // Criar novo usuário
      await client.query(
        'INSERT INTO users (name, email, password_hash, role, franchise_id) VALUES ($1, $2, $3, $4, $5)',
        ['Admin Matriz', 'admin@matriz.com', passwordHash, 'SUPER_ADMIN', null]
      );
      console.log('Usuário admin criado com sucesso');
    }
    
    // Verificar o usuário criado
    const result = await client.query(
      'SELECT id, name, email, role FROM users WHERE email = $1',
      ['admin@matriz.com']
    );
    
    console.log('Usuário no banco:', result.rows[0]);
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('Erro:', error);
    process.exit(1);
  }
}

createAdmin(); 