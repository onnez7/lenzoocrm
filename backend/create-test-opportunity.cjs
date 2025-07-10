const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createTestOpportunity() {
  try {
    console.log('=== CRIANDO OPORTUNIDADE DE TESTE ===');
    
    // Primeiro, vamos verificar se existe um cliente da franquia 7
    const clientCheck = await pool.query(`
      SELECT id, name, franchise_id 
      FROM clients 
      WHERE franchise_id = 7 
      LIMIT 1
    `);
    
    if (clientCheck.rows.length === 0) {
      console.log('❌ Nenhum cliente encontrado para a franquia 7');
      console.log('Criando um cliente de teste...');
      
      // Criar um cliente de teste
      const newClient = await pool.query(`
        INSERT INTO clients (name, email, phone, franchise_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        RETURNING id, name, franchise_id
      `, ['Cliente Teste', 'teste@exemplo.com', '(11) 99999-9999', 7]);
      
      console.log('✅ Cliente criado:', newClient.rows[0]);
      var clientId = newClient.rows[0].id;
    } else {
      console.log('✅ Cliente encontrado:', clientCheck.rows[0]);
      var clientId = clientCheck.rows[0].id;
    }
    
    // Agora criar a oportunidade
    const opportunity = await pool.query(`
      INSERT INTO opportunities (
        client_id, title, value, stage, probability, 
        responsible_id, status, expected_close, origin, notes, 
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
      RETURNING *
    `, [
      clientId,
      'Oportunidade de Teste - Óculos de Grau',
      1500.00,
      'lead',
      25,
      null,
      'open',
      '2025-08-15',
      'website',
      'Oportunidade criada para teste do sistema'
    ]);
    
    console.log('✅ Oportunidade criada com sucesso!');
    console.log('Detalhes:', opportunity.rows[0]);
    
    // Verificar se a oportunidade aparece na consulta filtrada
    const testQuery = await pool.query(`
      SELECT o.*, c.name as client_name 
      FROM opportunities o 
      LEFT JOIN clients c ON o.client_id = c.id 
      WHERE c.franchise_id = 7
    `);
    
    console.log('\n=== TESTE DA CONSULTA ===');
    console.log('Oportunidades encontradas para franquia 7:', testQuery.rows.length);
    testQuery.rows.forEach((opp, index) => {
      console.log(`Oportunidade ${index + 1}:`, {
        id: opp.id,
        title: opp.title,
        value: opp.value,
        client_name: opp.client_name,
        stage: opp.stage
      });
    });
    
  } catch (error) {
    console.error('❌ Erro ao criar oportunidade de teste:', error);
  } finally {
    await pool.end();
  }
}

createTestOpportunity(); 