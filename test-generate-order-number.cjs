const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'lenzoocrm',
  password: 'postgres',
  port: 5432,
});

async function testGenerateOrderNumber() {
  try {
    console.log('1. Testando se a função generate_order_number existe...');
    
    const result = await pool.query('SELECT generate_order_number() as order_number');
    console.log('✅ Função existe e retornou:', result.rows[0].order_number);
    
    console.log('\n2. Testando novamente para ver se incrementa...');
    
    const result2 = await pool.query('SELECT generate_order_number() as order_number');
    console.log('✅ Segunda chamada retornou:', result2.rows[0].order_number);
    
    console.log('\n3. Verificando se a função está definida corretamente...');
    
    const functionDef = await pool.query(`
      SELECT pg_get_functiondef(oid) as definition 
      FROM pg_proc 
      WHERE proname = 'generate_order_number'
    `);
    
    if (functionDef.rows.length > 0) {
      console.log('✅ Função encontrada no banco');
      console.log('Definição:', functionDef.rows[0].definition.substring(0, 200) + '...');
    } else {
      console.log('❌ Função não encontrada no banco');
    }
    
    console.log('\n4. Verificando se há ordens na tabela...');
    
    const ordersCount = await pool.query('SELECT COUNT(*) as count FROM service_orders');
    console.log('✅ Total de ordens na tabela:', ordersCount.rows[0].count);
    
    console.log('\n5. Verificando a última ordem...');
    
    const lastOrder = await pool.query('SELECT order_number FROM service_orders ORDER BY id DESC LIMIT 1');
    if (lastOrder.rows.length > 0) {
      console.log('✅ Última ordem:', lastOrder.rows[0].order_number);
    } else {
      console.log('ℹ️ Nenhuma ordem encontrada na tabela');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    
    if (error.message.includes('function generate_order_number() does not exist')) {
      console.log('\n🔧 A função não existe. Vamos criá-la...');
      
      try {
        await pool.query(`
          CREATE OR REPLACE FUNCTION generate_order_number()
          RETURNS VARCHAR AS $$
          DECLARE
            next_number INTEGER;
            order_number VARCHAR;
          BEGIN
            SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 4) AS INTEGER)), 0) + 1
            INTO next_number
            FROM service_orders;
            
            order_number := 'OS-' || LPAD(next_number::TEXT, 3, '0');
            RETURN order_number;
          END;
          $$ LANGUAGE plpgsql;
        `);
        
        console.log('✅ Função criada com sucesso!');
        
        // Testar novamente
        const testResult = await pool.query('SELECT generate_order_number() as order_number');
        console.log('✅ Teste da função criada:', testResult.rows[0].order_number);
        
      } catch (createError) {
        console.error('❌ Erro ao criar função:', createError.message);
      }
    }
  } finally {
    await pool.end();
  }
}

testGenerateOrderNumber(); 