const { Pool } = require('pg');
require('dotenv').config();

// Configuração do banco de dados
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'lenzoocrm',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

const bcrypt = require('bcryptjs');

async function createTestData() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Criando dados de teste...\n');

    // 1. Criar franquias de teste
    console.log('1. Criando franquias...');
    const franchises = [
      { name: 'Ótica Visão Clara', address: 'Rua das Flores, 123' },
      { name: 'Ótica Central', address: 'Av. Principal, 456' },
      { name: 'Ótica Premium', address: 'Rua do Comércio, 789' },
      { name: 'Ótica Moderna', address: 'Shopping Center, Loja 15' },
      { name: 'Ótica Express', address: 'Rua da Rapidez, 321' }
    ];

    const franchiseIds = [];
    for (const franchise of franchises) {
      const result = await client.query(
        'INSERT INTO franchises (name, address, status) VALUES ($1, $2, $3) RETURNING id',
        [franchise.name, franchise.address, 'active']
      );
      franchiseIds.push(result.rows[0].id);
      console.log(`   ✅ ${franchise.name} criada (ID: ${result.rows[0].id})`);
    }

    // 2. Criar usuários de teste
    console.log('\n2. Criando usuários...');
    
    // Admin Matriz (já deve existir)
    console.log('   ℹ️  Admin Matriz já existe');
    
    // Admins de franquia
    const franchiseAdmins = [
      { name: 'João Silva', email: 'joao@visaoclara.com', password: '123456', franchiseId: franchiseIds[0] },
      { name: 'Maria Santos', email: 'maria@oticacentral.com', password: '123456', franchiseId: franchiseIds[1] },
      { name: 'Pedro Costa', email: 'pedro@oticapremium.com', password: '123456', franchiseId: franchiseIds[2] },
      { name: 'Ana Oliveira', email: 'ana@oticamoderna.com', password: '123456', franchiseId: franchiseIds[3] },
      { name: 'Carlos Lima', email: 'carlos@oticaexpress.com', password: '123456', franchiseId: franchiseIds[4] }
    ];

    for (const admin of franchiseAdmins) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(admin.password, salt);
      
      const result = await client.query(
        'INSERT INTO users (name, email, password_hash, role, franchise_id) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [admin.name, admin.email, passwordHash, 'FRANCHISE_ADMIN', admin.franchiseId]
      );
      console.log(`   ✅ ${admin.name} criado (${admin.email})`);
    }

    // Funcionários
    const employees = [
      { name: 'Roberto Alves', email: 'roberto@visaoclara.com', password: '123456', franchiseId: franchiseIds[0] },
      { name: 'Fernanda Lima', email: 'fernanda@oticacentral.com', password: '123456', franchiseId: franchiseIds[1] },
      { name: 'Lucas Mendes', email: 'lucas@oticapremium.com', password: '123456', franchiseId: franchiseIds[2] },
      { name: 'Juliana Costa', email: 'juliana@oticamoderna.com', password: '123456', franchiseId: franchiseIds[3] },
      { name: 'Ricardo Silva', email: 'ricardo@oticaexpress.com', password: '123456', franchiseId: franchiseIds[4] },
      { name: 'Patrícia Santos', email: 'patricia@visaoclara.com', password: '123456', franchiseId: franchiseIds[0] },
      { name: 'Marcelo Oliveira', email: 'marcelo@oticacentral.com', password: '123456', franchiseId: franchiseIds[1] }
    ];

    for (const employee of employees) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(employee.password, salt);
      
      const result = await client.query(
        'INSERT INTO users (name, email, password_hash, role, franchise_id) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [employee.name, employee.email, passwordHash, 'EMPLOYEE', employee.franchiseId]
      );
      console.log(`   ✅ ${employee.name} criado (${employee.email})`);
    }

    // 3. Criar categorias
    console.log('\n3. Criando categorias...');
    const categories = [
      { name: 'Óculos de Grau', franchiseId: franchiseIds[0] },
      { name: 'Óculos de Sol', franchiseId: franchiseIds[0] },
      { name: 'Lentes de Contato', franchiseId: franchiseIds[0] },
      { name: 'Acessórios', franchiseId: franchiseIds[0] }
    ];

    for (const category of categories) {
      const result = await client.query(
        'INSERT INTO categories (name, franchise_id, status) VALUES ($1, $2, $3) RETURNING id',
        [category.name, category.franchiseId, 'active']
      );
      console.log(`   ✅ ${category.name} criada`);
    }

    // 4. Criar marcas
    console.log('\n4. Criando marcas...');
    const brands = [
      { name: 'Ray-Ban', franchiseId: franchiseIds[0] },
      { name: 'Oakley', franchiseId: franchiseIds[0] },
      { name: 'Polaroid', franchiseId: franchiseIds[0] },
      { name: 'Marca Local', franchiseId: franchiseIds[0] }
    ];

    for (const brand of brands) {
      const result = await client.query(
        'INSERT INTO brands (name, franchise_id, status) VALUES ($1, $2, $3) RETURNING id',
        [brand.name, brand.franchiseId, 'active']
      );
      console.log(`   ✅ ${brand.name} criada`);
    }

    // 5. Criar produtos
    console.log('\n5. Criando produtos...');
    const products = [
      { name: 'Óculos Ray-Ban Aviador', price: 299.90, franchiseId: franchiseIds[0] },
      { name: 'Óculos Oakley Sport', price: 199.90, franchiseId: franchiseIds[0] },
      { name: 'Lentes de Contato Mensais', price: 89.90, franchiseId: franchiseIds[0] },
      { name: 'Estojo para Óculos', price: 29.90, franchiseId: franchiseIds[0] }
    ];

    for (const product of products) {
      const result = await client.query(
        'INSERT INTO products (name, price, franchise_id, status) VALUES ($1, $2, $3, $4) RETURNING id',
        [product.name, product.price, product.franchiseId, 'active']
      );
      console.log(`   ✅ ${product.name} criado - R$ ${product.price}`);
    }

    console.log('\n🎉 Dados de teste criados com sucesso!');
    console.log('\n📋 Resumo:');
    console.log(`   - ${franchises.length} franquias criadas`);
    console.log(`   - ${franchiseAdmins.length} admins de franquia criados`);
    console.log(`   - ${employees.length} funcionários criados`);
    console.log(`   - ${categories.length} categorias criadas`);
    console.log(`   - ${brands.length} marcas criadas`);
    console.log(`   - ${products.length} produtos criados`);
    
    console.log('\n🔑 Credenciais de teste:');
    console.log('   Admin Matriz: admin@matriz.com / admin123');
    console.log('   Admin Franquia: joao@visaoclara.com / 123456');
    console.log('   Funcionário: roberto@visaoclara.com / 123456');

  } catch (error) {
    console.error('❌ Erro ao criar dados de teste:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

createTestData(); 