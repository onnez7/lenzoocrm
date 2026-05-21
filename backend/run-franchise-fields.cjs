const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Importar a configuração do banco
const db = require('./src/config/db');

async function addFranchiseFields() {
  try {
    console.log('🔧 Adicionando campos city e state à tabela franchises...\n');
    
    // Ler o arquivo SQL
    const sqlPath = path.join(__dirname, 'add-franchise-fields.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Executar o SQL
    await db.query(sqlContent);
    
    console.log('✅ Campos city e state adicionados com sucesso!');
    console.log('✅ Trigger updated_at corrigido!');
    
    // Verificar a estrutura final
    console.log('\n📋 Estrutura atual da tabela franchises:');
    const structure = await db.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'franchises' 
      ORDER BY ordinal_position
    `);
    
    structure.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // Verificar dados existentes
    console.log('\n📊 Dados atuais das franquias:');
    const franchises = await db.query('SELECT id, name, city, state FROM franchises');
    franchises.rows.forEach(franchise => {
      console.log(`- ${franchise.name}: ${franchise.city || 'N/A'}, ${franchise.state || 'N/A'}`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao adicionar campos:', error);
  } finally {
    await db.end();
    process.exit();
  }
}

addFranchiseFields(); 