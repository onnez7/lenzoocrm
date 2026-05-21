import bcrypt from 'bcrypt';
import db from './src/config/db.ts';

async function createFranchiseAdmin() {
  try {
    console.log('🚀 Criando usuário FRANCHISE_ADMIN...\n');

    // 1. Verificar se existe uma franquia
    const franchiseResult = await db.query('SELECT id, name FROM franchises LIMIT 1');
    
    if (franchiseResult.rows.length === 0) {
      console.log('❌ Nenhuma franquia encontrada. Criando uma franquia primeiro...');
      
      // Criar uma franquia de exemplo
      const newFranchise = await db.query(
        `INSERT INTO franchises (name, cnpj, address, phone, email) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id, name`,
        ['Ótica Visão Clara', '12.345.678/0001-90', 'Rua das Flores, 123', '(11) 99999-9999', 'contato@oticavisaoclara.com.br']
      );
      
      console.log(`✅ Franquia criada: ${newFranchise.rows[0].name} (ID: ${newFranchise.rows[0].id})`);
    }

    // 2. Buscar franquia para associar o usuário
    const franchise = franchiseResult.rows[0] || (await db.query('SELECT id, name FROM franchises LIMIT 1')).rows[0];
    
    // 3. Dados do FRANCHISE_ADMIN
    const franchiseAdminData = {
      name: 'João Silva',
      email: 'joao@oticavisaoclara.com.br',
      password: 'franquia123',
      role: 'FRANCHISE_ADMIN',
      franchiseId: franchise.id
    };

    // 4. Verificar se o usuário já existe
    const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [franchiseAdminData.email]);
    
    if (existingUser.rows.length > 0) {
      console.log('⚠️ Usuário já existe. Atualizando dados...');
      
      // Atualizar usuário existente
      const hashedPassword = await bcrypt.hash(franchiseAdminData.password, 10);
      await db.query(
        `UPDATE users 
         SET name = $1, password = $2, role = $3, franchise_id = $4 
         WHERE email = $5`,
        [franchiseAdminData.name, hashedPassword, franchiseAdminData.role, franchiseAdminData.franchiseId, franchiseAdminData.email]
      );
      
      console.log('✅ Usuário FRANCHISE_ADMIN atualizado com sucesso!');
    } else {
      // 5. Criar novo usuário
      const hashedPassword = await bcrypt.hash(franchiseAdminData.password, 10);
      
      const newUser = await db.query(
        `INSERT INTO users (name, email, password, role, franchise_id) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id, name, email, role, franchise_id`,
        [franchiseAdminData.name, franchiseAdminData.email, hashedPassword, franchiseAdminData.role, franchiseAdminData.franchiseId]
      );
      
      console.log('✅ Usuário FRANCHISE_ADMIN criado com sucesso!');
    }

    // 6. Mostrar dados do usuário criado
    const userResult = await db.query(
      `SELECT u.id, u.name, u.email, u.role, f.name as franchise_name 
       FROM users u 
       LEFT JOIN franchises f ON u.franchise_id = f.id 
       WHERE u.email = $1`,
      [franchiseAdminData.email]
    );
    
    const user = userResult.rows[0];
    
    console.log('\n📋 Dados do FRANCHISE_ADMIN criado:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Nome: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Franquia: ${user.franchise_name} (ID: ${user.franchise_id})`);
    console.log(`   Senha: ${franchiseAdminData.password}`);
    
    console.log('\n🔑 Credenciais de Login:');
    console.log(`   Email: ${franchiseAdminData.email}`);
    console.log(`   Senha: ${franchiseAdminData.password}`);
    
    console.log('\n🎯 Próximos passos:');
    console.log('   1. Faça login com essas credenciais');
    console.log('   2. Teste o acesso limitado por franquia');
    console.log('   3. Compare com o acesso do SUPER_ADMIN');
    
    await db.end();
    
  } catch (error) {
    console.error('❌ Erro ao criar FRANCHISE_ADMIN:', error);
    await db.end();
  }
}

createFranchiseAdmin(); 