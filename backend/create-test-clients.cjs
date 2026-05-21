const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'lenzoocrm',
});

async function createTestClients() {
  try {
    console.log('Criando clientes de teste...');
    
    const client = await pool.connect();
    
    // Array de nomes para gerar clientes variados
    const names = [
      'Ana Silva', 'Bruno Santos', 'Carla Costa', 'Diego Oliveira', 'Elena Ferreira',
      'Fernando Lima', 'Gabriela Rocha', 'Henrique Alves', 'Isabela Martins', 'João Pedro',
      'Karina Souza', 'Lucas Mendes', 'Mariana Torres', 'Nicolas Pereira', 'Olivia Castro',
      'Paulo Rodrigues', 'Quiteria Nunes', 'Rafael Silva', 'Sofia Costa', 'Thiago Santos',
      'Úrsula Lima', 'Vitor Oliveira', 'Wanessa Costa', 'Xavier Santos', 'Yara Silva',
      'Zé Carlos', 'Alice Costa', 'Bernardo Lima', 'Camila Santos', 'Daniel Oliveira'
    ];
    
    for (let i = 0; i < names.length; i++) {
      const name = names[i];
      const email = `${name.toLowerCase().replace(' ', '.')}@email.com`;
      const phone = `(11) 9${String(i + 1000).padStart(4, '0')}-${String(i + 1000).padStart(4, '0')}`;
      
      await client.query(`
        INSERT INTO clients (franchise_id, name, email, phone, address, city, state, zip_code, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        1, // franchise_id
        name,
        email,
        phone,
        `Rua ${name.split(' ')[0]}, ${i + 100}`,
        'São Paulo',
        'SP',
        `0${String(i + 1000).padStart(4, '0')}-${String(i + 100).padStart(3, '0')}`,
        `Cliente de teste ${i + 1}`
      ]);
    }
    
    console.log(`${names.length} clientes de teste criados com sucesso!`);
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('Erro:', error.message);
    await pool.end();
  }
}

createTestClients(); 