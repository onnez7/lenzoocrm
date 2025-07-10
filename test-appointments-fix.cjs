const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: 'postgres',
  database: 'lenzoocrm',
  port: 5432,
});

async function testAppointmentsTable() {
  try {
    console.log('🔍 Verificando estrutura da tabela appointments...\n');
    
    // Verificar estrutura da tabela
    const structureResult = await pool.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'appointments' 
      ORDER BY ordinal_position
    `);
    
    console.log('Estrutura da tabela appointments:');
    structureResult.rows.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    console.log('\n🔍 Verificando dados da tabela...');
    
    // Verificar se há dados
    const countResult = await pool.query('SELECT COUNT(*) as total FROM appointments');
    console.log(`Total de agendamentos: ${countResult.rows[0].total}`);
    
    if (countResult.rows[0].total > 0) {
      const sampleResult = await pool.query('SELECT * FROM appointments LIMIT 1');
      console.log('\nExemplo de agendamento:');
      Object.keys(sampleResult.rows[0]).forEach(key => {
        console.log(`- ${key}: ${sampleResult.rows[0][key]}`);
      });
    }
    
    console.log('\n🔍 Verificando relacionamentos...');
    
    // Verificar se as foreign keys existem
    const fkResult = await pool.query(`
      SELECT 
        tc.constraint_name, 
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='appointments';
    `);
    
    console.log('Foreign keys da tabela appointments:');
    fkResult.rows.forEach(row => {
      console.log(`- ${row.column_name} -> ${row.foreign_table_name}.${row.foreign_column_name}`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

testAppointmentsTable(); 