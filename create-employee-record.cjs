const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'lenzoocrm',
  password: 'postgres',
  port: 5432,
});

async function createEmployeeRecord() {
  try {
    console.log('1. Verificando se o usuário João Silva existe...');
    
    const userResult = await pool.query('SELECT * FROM users WHERE id = 7');
    if (userResult.rows.length === 0) {
      console.log('❌ Usuário João Silva não encontrado');
      return;
    }
    
    const user = userResult.rows[0];
    console.log('✅ Usuário encontrado:', user.name);
    
    console.log('\n2. Verificando se já existe na tabela employees...');
    
    const employeeResult = await pool.query('SELECT * FROM employees WHERE user_id = 7');
    if (employeeResult.rows.length > 0) {
      console.log('✅ Já existe registro na tabela employees');
      console.log('Employee ID:', employeeResult.rows[0].id);
      return;
    }
    
    console.log('\n3. Criando registro na tabela employees...');
    
    const insertResult = await pool.query(`
      INSERT INTO employees (
        user_id, 
        franchise_id, 
        name, 
        email, 
        position, 
        hire_date, 
        status, 
        created_at, 
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) 
      RETURNING *
    `, [
      user.id,           // user_id
      user.franchise_id, // franchise_id
      user.name,         // name
      user.email,        // email
      'FRANCHISE_ADMIN', // position
      new Date(),        // hire_date
      'active'           // status
    ]);
    
    console.log('✅ Registro criado com sucesso!');
    console.log('Employee ID:', insertResult.rows[0].id);
    console.log('Nome:', insertResult.rows[0].name);
    console.log('Email:', insertResult.rows[0].email);
    console.log('Position:', insertResult.rows[0].position);
    
    console.log('\n4. Verificando se o registro foi criado...');
    
    const verifyResult = await pool.query('SELECT * FROM employees WHERE user_id = 7');
    if (verifyResult.rows.length > 0) {
      console.log('✅ Registro confirmado na tabela employees');
    } else {
      console.log('❌ Erro: Registro não foi criado');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('Detail:', error.detail);
  } finally {
    await pool.end();
  }
}

createEmployeeRecord(); 