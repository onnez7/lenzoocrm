const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'lenzoocrm',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function testPayableCreation() {
  try {
    console.log('🧪 Testando criação de conta a pagar...');
    
    // Verificar se a tabela existe
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'payables'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ Tabela payables não existe!');
      return;
    }
    
    console.log('✅ Tabela payables existe');
    
    // Verificar estrutura da tabela
    const structure = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'payables' 
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Estrutura da tabela payables:');
    structure.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // Verificar se há franquias
    const franchises = await pool.query('SELECT id, name FROM franchises LIMIT 1');
    
    if (franchises.rows.length === 0) {
      console.log('❌ Nenhuma franquia encontrada!');
      return;
    }
    
    const franchiseId = franchises.rows[0].id;
    console.log(`✅ Usando franquia: ${franchises.rows[0].name} (ID: ${franchiseId})`);
    
    // Tentar criar uma conta a pagar
    const testData = {
      description: 'Teste de conta a pagar',
      amount: 100.50,
      due_date: '2024-12-31',
      supplier: 'Fornecedor Teste',
      category: 'Serviços',
      invoice_number: 'INV-001',
      payment_method: 'bank_transfer'
    };
    
    console.log('📝 Tentando criar conta a pagar com dados:', testData);
    
    const result = await pool.query(
      `INSERT INTO payables 
       (franchise_id, description, amount, due_date, supplier, category, invoice_number, payment_method) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        franchiseId,
        testData.description,
        testData.amount,
        testData.due_date,
        testData.supplier,
        testData.category,
        testData.invoice_number,
        testData.payment_method
      ]
    );
    
    console.log('✅ Conta a pagar criada com sucesso!');
    console.log('📄 Dados criados:', result.rows[0]);
    
    // Limpar dados de teste
    await pool.query('DELETE FROM payables WHERE description = $1', [testData.description]);
    console.log('🧹 Dados de teste removidos');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    console.error('Detalhes:', error);
  } finally {
    await pool.end();
  }
}

testPayableCreation(); 