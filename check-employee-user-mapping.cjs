const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'lenzoocrm',
  password: 'postgres',
  port: 5432,
});

async function checkEmployeeUserMapping() {
  try {
    console.log('1. Verificando mapeamento entre employees e users...');
    
    const mappingResult = await pool.query(`
      SELECT 
        e.id as employee_id,
        e.name as employee_name,
        e.user_id,
        u.id as user_id,
        u.name as user_name,
        u.email as user_email
      FROM employees e
      LEFT JOIN users u ON e.user_id = u.id
      ORDER BY e.id
    `);
    
    console.log('Mapeamento encontrado:');
    mappingResult.rows.forEach(row => {
      console.log(`  Employee ID: ${row.employee_id} (${row.employee_name}) -> User ID: ${row.user_id} (${row.user_name || 'N/A'})`);
    });
    
    console.log('\n2. Verificando problema específico do employee_id = 2...');
    
    const employee2Result = await pool.query(`
      SELECT 
        e.*,
        u.name as user_name,
        u.email as user_email
      FROM employees e
      LEFT JOIN users u ON e.user_id = u.id
      WHERE e.id = 2
    `);
    
    if (employee2Result.rows.length > 0) {
      const employee = employee2Result.rows[0];
      console.log('Employee ID 2:');
      console.log('  Name:', employee.name);
      console.log('  User ID:', employee.user_id);
      console.log('  User Name:', employee.user_name);
      console.log('  User Email:', employee.user_email);
    }
    
    console.log('\n3. Verificando se o user_id = 7 existe...');
    
    const user7Result = await pool.query('SELECT * FROM users WHERE id = 7');
    if (user7Result.rows.length > 0) {
      console.log('User ID 7 encontrado:', user7Result.rows[0].name);
    } else {
      console.log('❌ User ID 7 não encontrado');
    }
    
    console.log('\n4. Corrigindo o mapeamento se necessário...');
    
    // Verificar se o employee_id = 2 tem o user_id correto
    const checkEmployee2 = await pool.query('SELECT user_id FROM employees WHERE id = 2');
    if (checkEmployee2.rows.length > 0 && checkEmployee2.rows[0].user_id !== 7) {
      console.log('Corrigindo user_id do employee 2...');
      await pool.query('UPDATE employees SET user_id = 7 WHERE id = 2');
      console.log('✅ user_id corrigido');
    } else {
      console.log('✅ Mapeamento já está correto');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

checkEmployeeUserMapping(); 