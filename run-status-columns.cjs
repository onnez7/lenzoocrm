const { Pool } = require('pg');
require('dotenv').config();

// Configuração do banco de dados
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'lenzoocrm',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

const sqlCommands = [
  // 1. Franquias
  "ALTER TABLE franchises ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';",
  
  // 2. Produtos
  "ALTER TABLE products ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';",
  
  // 3. Funcionários
  "ALTER TABLE employees ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';",
  
  // 4. Contas a pagar
  "ALTER TABLE payables ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';",
  
  // 5. Contas a receber
  "ALTER TABLE receivables ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';",
  
  // 6. Categorias
  "ALTER TABLE categories ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';",
  
  // 7. Marcas
  "ALTER TABLE brands ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';",
  
  // 8. Movimentações de estoque
  "ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';",
  
  // 9. Vendas
  "ALTER TABLE sales ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'completed';",
  
  // 10. Ordens de serviço
  "ALTER TABLE service_orders ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'open';",
  
  // 11. Agendamentos
  "ALTER TABLE appointments ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'scheduled';",
  
  // 12. Caixa (sangrias)
  "ALTER TABLE cashier_sangrias ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'open';"
];

async function addStatusColumns() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Adicionando colunas status nas tabelas...\n');
    
    for (let i = 0; i < sqlCommands.length; i++) {
      const command = sqlCommands[i];
      const tableName = command.match(/ALTER TABLE (\w+)/)[1];
      
      try {
        await client.query(command);
        console.log(`✅ Coluna status adicionada na tabela: ${tableName}`);
      } catch (error) {
        if (error.code === '42701') {
          console.log(`ℹ️  Coluna status já existe na tabela: ${tableName}`);
        } else {
          console.log(`❌ Erro ao adicionar coluna na tabela ${tableName}:`, error.message);
        }
      }
    }
    
    console.log('\n🎉 Processo concluído!');
    console.log('📝 Agora você pode reiniciar o backend e testar o dashboard.');
    
  } catch (error) {
    console.error('❌ Erro de conexão:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

// Executar o script
addStatusColumns(); 