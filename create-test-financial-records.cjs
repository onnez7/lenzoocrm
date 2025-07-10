const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'lenzoocrm',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function createTestRecords() {
  try {
    console.log('🔧 Criando registros de teste para contas a pagar e receber...\n');

    // Primeiro, vamos verificar se existe uma franquia
    const franchiseResult = await pool.query('SELECT id FROM franchises LIMIT 1');
    if (!franchiseResult.rows.length) {
      console.log('❌ Nenhuma franquia encontrada. Criando uma franquia de teste...');
      await pool.query(`
        INSERT INTO franchises (name, address, phone, email, cnpj, status)
        VALUES ('Franquia Teste', 'Rua Teste, 123', '(11) 99999-9999', 'teste@franquia.com', '12.345.678/0001-90', 'active')
        RETURNING id
      `);
    }

    const franchiseId = franchiseResult.rows[0]?.id || 1;

    // Criar contas a pagar com status pending
    console.log('📝 Criando contas a pagar com status pending...');
    
    const payablesData = [
      {
        description: 'Fornecedor de Lentes - Janeiro 2024',
        amount: 1500.00,
        due_date: '2024-02-15',
        supplier: 'Ótica Fornecedora Ltda',
        category: 'Fornecedores',
        invoice_number: 'FAT-2024-001'
      },
      {
        description: 'Aluguel da Loja - Fevereiro 2024',
        amount: 2500.00,
        due_date: '2024-02-05',
        supplier: 'Imobiliária Central',
        category: 'Despesas Fixas',
        invoice_number: 'ALUG-2024-002'
      },
      {
        description: 'Energia Elétrica - Janeiro 2024',
        amount: 350.00,
        due_date: '2024-02-10',
        supplier: 'Companhia de Energia',
        category: 'Serviços Públicos',
        invoice_number: 'ENER-2024-003'
      }
    ];

    for (const payable of payablesData) {
      await pool.query(`
        INSERT INTO payables 
        (franchise_id, description, amount, due_date, supplier, category, invoice_number, status, payment_method)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', 'bank_transfer')
      `, [
        franchiseId,
        payable.description,
        payable.amount,
        payable.due_date,
        payable.supplier,
        payable.category,
        payable.invoice_number
      ]);
    }

    // Criar contas a receber com status pending
    console.log('📝 Criando contas a receber com status pending...');
    
    const receivablesData = [
      {
        description: 'Venda de Óculos - Cliente João Silva',
        amount: 450.00,
        due_date: '2024-02-20',
        category: 'Vendas',
        client_name: 'João Silva',
        invoice_number: 'VENDA-2024-001'
      },
      {
        description: 'Consulta Oftalmológica - Maria Santos',
        amount: 120.00,
        due_date: '2024-02-18',
        category: 'Consultas',
        client_name: 'Maria Santos',
        invoice_number: 'CONS-2024-002'
      },
      {
        description: 'Parcela 1/3 - Óculos Progressivo - Pedro Costa',
        amount: 300.00,
        due_date: '2024-02-25',
        category: 'Parcelamentos',
        client_name: 'Pedro Costa',
        invoice_number: 'PARC-2024-003'
      }
    ];

    for (const receivable of receivablesData) {
      await pool.query(`
        INSERT INTO receivables 
        (franchise_id, description, amount, due_date, category, client_name, invoice_number, status, payment_method)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', 'bank_transfer')
      `, [
        franchiseId,
        receivable.description,
        receivable.amount,
        receivable.due_date,
        receivable.category,
        receivable.client_name,
        receivable.invoice_number
      ]);
    }

    console.log('✅ Registros de teste criados com sucesso!');
    console.log('\n📊 Resumo dos registros criados:');
    console.log('  - Contas a pagar: 3 registros com status "pending"');
    console.log('  - Contas a receber: 3 registros com status "pending"');
    console.log('\n🎯 Agora você pode testar a funcionalidade de marcar como paga/recebida!');

  } catch (error) {
    console.error('❌ Erro ao criar registros de teste:', error);
  } finally {
    await pool.end();
  }
}

createTestRecords(); 