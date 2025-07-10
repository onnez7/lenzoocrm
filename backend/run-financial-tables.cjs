const mysql = require('mysql2/promise');

async function createFinancialTables() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'lenzoocrm'
  });

  try {
    console.log('Criando tabelas financeiras...');

    // 1. Contas Bancárias
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS bank_accounts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        franchise_id INT NOT NULL,
        bank_name VARCHAR(100) NOT NULL,
        account_type ENUM('checking', 'savings', 'business') NOT NULL,
        account_number VARCHAR(20) NOT NULL,
        agency VARCHAR(20) NOT NULL,
        balance DECIMAL(10,2) DEFAULT 0.00,
        is_active BOOLEAN DEFAULT true,
        pix_key VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (franchise_id) REFERENCES franchises(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Tabela bank_accounts criada');

    // 2. Cartões de Crédito
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS credit_cards (
        id INT PRIMARY KEY AUTO_INCREMENT,
        franchise_id INT NOT NULL,
        card_name VARCHAR(100) NOT NULL,
        bank_name VARCHAR(100) NOT NULL,
        last_four_digits VARCHAR(4) NOT NULL,
        brand ENUM('visa', 'mastercard', 'elo', 'amex') NOT NULL,
        limit_amount DECIMAL(10,2) NOT NULL,
        available_limit DECIMAL(10,2) NOT NULL,
        due_date INT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (franchise_id) REFERENCES franchises(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Tabela credit_cards criada');

    // 3. Notas Fiscais
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS invoices (
        id INT PRIMARY KEY AUTO_INCREMENT,
        franchise_id INT NOT NULL,
        number VARCHAR(50) NOT NULL,
        supplier VARCHAR(100) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        issue_date DATE NOT NULL,
        due_date DATE NOT NULL,
        status ENUM('pending', 'paid', 'overdue') DEFAULT 'pending',
        category VARCHAR(50) NOT NULL,
        description TEXT,
        file_name VARCHAR(255),
        file_size INT,
        file_path VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (franchise_id) REFERENCES franchises(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Tabela invoices criada');

    // 4. Contas a Pagar
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS payables (
        id INT PRIMARY KEY AUTO_INCREMENT,
        franchise_id INT NOT NULL,
        description VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        due_date DATE NOT NULL,
        status ENUM('pending', 'paid', 'overdue') DEFAULT 'pending',
        supplier VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL,
        invoice_number VARCHAR(50),
        payment_method ENUM('bank_transfer', 'credit_card', 'cash', 'pix') DEFAULT 'bank_transfer',
        bank_account_id INT,
        credit_card_id INT,
        paid_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (franchise_id) REFERENCES franchises(id) ON DELETE CASCADE,
        FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id) ON DELETE SET NULL,
        FOREIGN KEY (credit_card_id) REFERENCES credit_cards(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Tabela payables criada');

    // 5. Contas a Receber
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS receivables (
        id INT PRIMARY KEY AUTO_INCREMENT,
        franchise_id INT NOT NULL,
        client_id INT,
        description VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        due_date DATE NOT NULL,
        status ENUM('pending', 'paid', 'overdue', 'partial') DEFAULT 'pending',
        invoice_number VARCHAR(50),
        installments VARCHAR(10),
        payment_method ENUM('cash', 'credit_card', 'debit_card', 'pix', 'bank_transfer') DEFAULT 'cash',
        bank_account_id INT,
        paid_amount DECIMAL(10,2) DEFAULT 0.00,
        paid_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (franchise_id) REFERENCES franchises(id) ON DELETE CASCADE,
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
        FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Tabela receivables criada');

    // 6. Transações Bancárias
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS bank_transactions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        franchise_id INT NOT NULL,
        bank_account_id INT NOT NULL,
        type ENUM('credit', 'debit') NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        description VARCHAR(255) NOT NULL,
        category VARCHAR(50),
        reference_id INT,
        reference_type ENUM('payable', 'receivable', 'invoice', 'manual') NOT NULL,
        transaction_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (franchise_id) REFERENCES franchises(id) ON DELETE CASCADE,
        FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Tabela bank_transactions criada');

    // 7. Categorias Financeiras
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS financial_categories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        franchise_id INT NOT NULL,
        name VARCHAR(50) NOT NULL,
        type ENUM('income', 'expense') NOT NULL,
        color VARCHAR(7) DEFAULT '#3b82f6',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (franchise_id) REFERENCES franchises(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Tabela financial_categories criada');

    // Inserir categorias padrão
    const categories = [
      ['Produtos', 'expense', '#ef4444'],
      ['Serviços', 'expense', '#f59e0b'],
      ['Utilidades', 'expense', '#10b981'],
      ['Equipamentos', 'expense', '#8b5cf6'],
      ['Aluguel', 'expense', '#06b6d4'],
      ['Vendas', 'income', '#22c55e'],
      ['Consultas', 'income', '#84cc16'],
      ['Serviços', 'income', '#f97316']
    ];

    for (const [name, type, color] of categories) {
      await connection.execute(`
        INSERT IGNORE INTO financial_categories (franchise_id, name, type, color) 
        VALUES (1, ?, ?, ?)
      `, [name, type, color]);
    }
    console.log('✅ Categorias financeiras inseridas');

    // Criar índices
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_bank_accounts_franchise ON bank_accounts(franchise_id)',
      'CREATE INDEX IF NOT EXISTS idx_credit_cards_franchise ON credit_cards(franchise_id)',
      'CREATE INDEX IF NOT EXISTS idx_invoices_franchise ON invoices(franchise_id)',
      'CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status)',
      'CREATE INDEX IF NOT EXISTS idx_payables_franchise ON payables(franchise_id)',
      'CREATE INDEX IF NOT EXISTS idx_payables_status ON payables(status)',
      'CREATE INDEX IF NOT EXISTS idx_payables_due_date ON payables(due_date)',
      'CREATE INDEX IF NOT EXISTS idx_receivables_franchise ON receivables(franchise_id)',
      'CREATE INDEX IF NOT EXISTS idx_receivables_status ON receivables(status)',
      'CREATE INDEX IF NOT EXISTS idx_receivables_due_date ON receivables(due_date)',
      'CREATE INDEX IF NOT EXISTS idx_bank_transactions_franchise ON bank_transactions(franchise_id)',
      'CREATE INDEX IF NOT EXISTS idx_bank_transactions_date ON bank_transactions(transaction_date)'
    ];

    for (const index of indexes) {
      await connection.execute(index);
    }
    console.log('✅ Índices criados');

    console.log('\n🎉 Todas as tabelas financeiras foram criadas com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error);
  } finally {
    await connection.end();
  }
}

createFinancialTables(); 