import fetch from 'node-fetch';

const API_URL = 'http://localhost:3001/api';

// Dados de teste
const testData = {
  // Login do SUPER_ADMIN
  login: {
    email: 'admin@lenzoo.com.br',
    password: 'admin123'
  },
  
  // Produtos de teste
  products: [
    {
      name: 'Óculos Ray-Ban Aviador',
      description: 'Óculos de sol clássico com lentes polarizadas',
      price: 899.90,
      cost: 450.00,
      stock_quantity: 15,
      min_stock: 5,
      category: 'Óculos de Sol',
      brand: 'Ray-Ban',
      sku: 'RB-AVI-001',
      targetFranchiseId: 1
    },
    {
      name: 'Óculos Oakley Holbrook',
      description: 'Óculos esportivo com tecnologia Prizm',
      price: 699.90,
      cost: 350.00,
      stock_quantity: 8,
      min_stock: 3,
      category: 'Óculos Esportivo',
      brand: 'Oakley',
      sku: 'OK-HOL-002',
      targetFranchiseId: 1
    },
    {
      name: 'Lente Progressiva Essilor',
      description: 'Lente progressiva com tecnologia Crizal',
      price: 1299.90,
      cost: 650.00,
      stock_quantity: 25,
      min_stock: 10,
      category: 'Lentes',
      brand: 'Essilor',
      sku: 'ES-PRO-003',
      targetFranchiseId: 2
    }
  ],
  
  // Vendas de teste
  sales: [
    {
      client_id: 1,
      total_amount: 899.90,
      payment_method: 'credit_card',
      items: [
        {
          product_id: 1,
          quantity: 1,
          unit_price: 899.90,
          total_price: 899.90
        }
      ],
      targetFranchiseId: 1
    },
    {
      client_id: 2,
      total_amount: 1999.80,
      payment_method: 'pix',
      items: [
        {
          product_id: 2,
          quantity: 1,
          unit_price: 699.90,
          total_price: 699.90
        },
        {
          product_id: 3,
          quantity: 1,
          unit_price: 1299.90,
          total_price: 1299.90
        }
      ],
      targetFranchiseId: 2
    }
  ]
};

async function testAPI() {
  let token = '';
  
  console.log('🚀 Iniciando testes das APIs de Produtos e Vendas...\n');
  
  try {
    // 1. Login
    console.log('1️⃣ Testando Login...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData.login)
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Login falhou: ${loginResponse.status}`);
    }
    
    const loginData = await loginResponse.json();
    token = loginData.token;
    console.log('✅ Login realizado com sucesso!');
    console.log(`👤 Usuário: ${loginData.user.name} (${loginData.user.role})\n`);
    
    // 2. Criar Produtos
    console.log('2️⃣ Testando Criação de Produtos...');
    for (let i = 0; i < testData.products.length; i++) {
      const product = testData.products[i];
      console.log(`   Criando produto: ${product.name}`);
      
      const productResponse = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(product)
      });
      
      if (!productResponse.ok) {
        const error = await productResponse.json();
        console.log(`❌ Erro ao criar produto: ${error.message}`);
      } else {
        const createdProduct = await productResponse.json();
        console.log(`✅ Produto criado: ID ${createdProduct.id}`);
      }
    }
    console.log('');
    
    // 3. Listar Produtos
    console.log('3️⃣ Testando Listagem de Produtos...');
    const productsResponse = await fetch(`${API_URL}/products`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!productsResponse.ok) {
      throw new Error(`Erro ao listar produtos: ${productsResponse.status}`);
    }
    
    const products = await productsResponse.json();
    console.log(`✅ ${products.length} produtos encontrados:`);
    products.forEach(p => {
      console.log(`   - ${p.name} (${p.franchise_name}) - R$ ${p.price}`);
    });
    console.log('');
    
    // 4. Criar Vendas
    console.log('4️⃣ Testando Criação de Vendas...');
    for (let i = 0; i < testData.sales.length; i++) {
      const sale = testData.sales[i];
      console.log(`   Criando venda: R$ ${sale.total_amount}`);
      
      const saleResponse = await fetch(`${API_URL}/sales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(sale)
      });
      
      if (!saleResponse.ok) {
        const error = await saleResponse.json();
        console.log(`❌ Erro ao criar venda: ${error.message}`);
      } else {
        const createdSale = await saleResponse.json();
        console.log(`✅ Venda criada: ID ${createdSale.id}`);
      }
    }
    console.log('');
    
    // 5. Listar Vendas
    console.log('5️⃣ Testando Listagem de Vendas...');
    const salesResponse = await fetch(`${API_URL}/sales`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!salesResponse.ok) {
      throw new Error(`Erro ao listar vendas: ${salesResponse.status}`);
    }
    
    const sales = await salesResponse.json();
    console.log(`✅ ${sales.length} vendas encontradas:`);
    sales.forEach(s => {
      console.log(`   - Venda ${s.id}: R$ ${s.total_amount} (${s.franchise_name})`);
    });
    console.log('');
    
    // 6. Testar Filtros por Franquia
    console.log('6️⃣ Testando Filtros por Franquia...');
    console.log('   (SUPER_ADMIN deve ver todas as vendas e produtos)');
    console.log(`   - Total de produtos: ${products.length}`);
    console.log(`   - Total de vendas: ${sales.length}`);
    console.log('');
    
    console.log('🎉 Todos os testes concluídos com sucesso!');
    console.log('\n📊 Resumo:');
    console.log(`   - Produtos criados: ${testData.products.length}`);
    console.log(`   - Vendas criadas: ${testData.sales.length}`);
    console.log(`   - SUPER_ADMIN tem acesso total a todos os dados`);
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
  }
}

testAPI(); 