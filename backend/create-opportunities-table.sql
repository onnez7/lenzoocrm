-- Tabela de oportunidades (pipeline/kanban CRM)
CREATE TABLE IF NOT EXISTS opportunities (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    value NUMERIC(12,2) NOT NULL,
    stage VARCHAR(30) NOT NULL, -- ex: prospect, qualificado, proposta, negociacao, fechado
    probability INTEGER DEFAULT 0, -- 0 a 100
    responsible_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'open', -- open, won, lost, canceled
    expected_close DATE,
    origin VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
); 