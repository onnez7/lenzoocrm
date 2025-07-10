import pkg from 'pg';
import bcrypt from 'bcrypt';

const { Client } = pkg;

const db = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'lenzoocrm',
  password: '', // coloque a senha do seu postgres se houver
  port: 5432,
});

async function createFranchiseAdmin() {
  try {
    await db.connect();
    console.log('🚀 Conectado ao banco PostgreSQL!');

    // 1. Verificar se existe uma franquia
    let franchise = await db.query('SELECT id, name FROM franchises LIMIT 1');
    if (franchise.rows.length === 0) {
      console.log('❌ Nenhuma franquia encontrada. Criando uma franquia...');
      const newFranchise = await db.query(
        `INSERT INTO franchises (name, cnpj, address, phone, email) VALUES ($1, $2, $3, $4, $5) RETURNING id, name`,
        ['Ótica Visão Clara', '12.345.678/0001-90', 'Rua das Flores, 123', '(11) 99999-9999', 'contato@oticavisaoclara.com.br']
      );
      franchise = { rows: [newFranchise.rows[0]] };
      console.log(`✅ Franquia criada: ${newFranchise.rows[0].name} (ID: ${newFranchise.rows[0].id})`);
    }
    const franchiseId = franchise.rows[0].id;

    // 2. Dados do usuário
    const name = 'João Silva';
    const email = 'joao@oticavisaoclara.com.br';
    const password = 'franquia123';
    const role = 'FRANCHISE_ADMIN';
    const hash = await bcrypt.hash(password, 10);

    // 3. Verificar se já existe
    const exists = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (exists.rows.length > 0) {
      await db.query(
        'UPDATE users SET name = $1, password_hash = $2, role = $3, franchise_id = $4 WHERE email = $5',
        [name, hash, role, franchiseId, email]
      );
      console.log('⚠️ Usuário já existia, dados atualizados.');
    } else {
      await db.query(
        'INSERT INTO users (name, email, password_hash, role, franchise_id) VALUES ($1, $2, $3, $4, $5)',
        [name, email, hash, role, franchiseId]
      );
      console.log('✅ Usuário FRANCHISE_ADMIN criado com sucesso!');
    }

    // 4. Mostrar dados
    const user = await db.query(
      'SELECT u.id, u.name, u.email, u.role, f.name as franchise_name FROM users u LEFT JOIN franchises f ON u.franchise_id = f.id WHERE u.email = $1',
      [email]
    );
    const u = user.rows[0];
    console.log('\n📋 Dados do FRANCHISE_ADMIN:');
    console.log(`   ID: ${u.id}`);
    console.log(`   Nome: ${u.name}`);
    console.log(`   Email: ${u.email}`);
    console.log(`   Role: ${u.role}`);
    console.log(`   Franquia: ${u.franchise_name}`);
    console.log(`   Senha: ${password}`);
    console.log('\n🔑 Faça login com essas credenciais para testar o acesso da franquia!');
    await db.end();
  } catch (err) {
    console.error('❌ Erro:', err);
    await db.end();
  }
}

createFranchiseAdmin(); 