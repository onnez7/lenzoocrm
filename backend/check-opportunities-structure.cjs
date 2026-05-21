const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkOpportunitiesStructure() {
  try {
    console.log('=== VERIFICANDO ESTRUTURA DA TABELA OPPORTUNITIES ===');
    
    // Verificar se a tabela existe
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'opportunities'
      );
    `);
    
    console.log('Tabela opportunities existe:', tableExists.rows[0].exists);
    
    if (!tableExists.rows[0].exists) {
      console.log('❌ Tabela opportunities não existe!');
      return;
    }
    
    // Verificar estrutura da tabela
    const structure = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'opportunities'
      ORDER BY ordinal_position;
    `);
    
    console.log('\n=== ESTRUTURA DA TABELA ===');
    structure.rows.forEach(col => {
      console.log(`${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Verificar se há dados
    const count = await pool.query('SELECT COUNT(*) as total FROM opportunities');
    console.log('\nTotal de oportunidades:', count.rows[0].total);
    
    // Verificar alguns registros de exemplo
    if (count.rows[0].total > 0) {
      const sample = await pool.query('SELECT * FROM opportunities LIMIT 3');
      console.log('\n=== EXEMPLO DE REGISTROS ===');
      sample.rows.forEach((row, index) => {
        console.log(`Registro ${index + 1}:`, row);
      });
    }
    
    // Verificar relacionamento com clients
    const clientsWithOpportunities = await pool.query(`
      SELECT c.id, c.name, c.franchise_id, COUNT(o.id) as opportunities_count
      FROM clients c
      LEFT JOIN opportunities o ON c.id = o.client_id
      GROUP BY c.id, c.name, c.franchise_id
      HAVING COUNT(o.id) > 0
      LIMIT 5;
    `);
    
    console.log('\n=== CLIENTES COM OPORTUNIDADES ===');
    clientsWithOpportunities.rows.forEach(client => {
      console.log(`Cliente ${client.id} (${client.name}) - Franquia ${client.franchise_id} - ${client.opportunities_count} oportunidades`);
    });
    
    // Verificar se há oportunidades sem clientes válidos
    const orphanedOpportunities = await pool.query(`
      SELECT COUNT(*) as count
      FROM opportunities o
      LEFT JOIN clients c ON o.client_id = c.id
      WHERE c.id IS NULL;
    `);
    
    console.log('\nOportunidades órfãs (sem cliente):', orphanedOpportunities.rows[0].count);
    
  } catch (error) {
    console.error('Erro ao verificar estrutura:', error);
  } finally {
    await pool.end();
  }
}

checkOpportunitiesStructure(); 