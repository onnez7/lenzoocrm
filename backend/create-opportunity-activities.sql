-- Tabela de atividades/tarefas de oportunidades
CREATE TABLE IF NOT EXISTS opportunity_activities (
    id SERIAL PRIMARY KEY,
    opportunity_id INTEGER NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    activity_type VARCHAR(50) DEFAULT 'task', -- task, call, email, meeting, note
    status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed, cancelled
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
    due_date DATE,
    due_time TIME,
    assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    completed_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_opportunity_activities_opportunity_id ON opportunity_activities(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_activities_assigned_to ON opportunity_activities(assigned_to);
CREATE INDEX IF NOT EXISTS idx_opportunity_activities_created_by ON opportunity_activities(created_by);
CREATE INDEX IF NOT EXISTS idx_opportunity_activities_status ON opportunity_activities(status);
CREATE INDEX IF NOT EXISTS idx_opportunity_activities_due_date ON opportunity_activities(due_date);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_opportunity_activities_updated_at 
    BEFORE UPDATE ON opportunity_activities 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir dados de exemplo
INSERT INTO opportunity_activities (opportunity_id, title, description, activity_type, status, priority, due_date, due_time, assigned_to, created_by, notes) VALUES
(1, 'Ligar para cliente', 'Confirmar interesse na proposta enviada', 'call', 'pending', 'high', '2024-01-15', '14:00:00', 1, 1, 'Cliente demonstrou interesse inicial'),
(1, 'Enviar proposta detalhada', 'Preparar proposta com especificações técnicas', 'task', 'completed', 'medium', '2024-01-12', '10:00:00', 1, 1, 'Proposta enviada por e-mail'),
(2, 'Reunião de demonstração', 'Apresentar funcionalidades do sistema', 'meeting', 'pending', 'high', '2024-01-20', '15:30:00', 2, 1, 'Agendar com equipe técnica'),
(2, 'Follow-up por e-mail', 'Enviar material complementar', 'email', 'pending', 'medium', '2024-01-18', '09:00:00', 2, 1, 'Incluir cases de sucesso');

-- Comentários
COMMENT ON TABLE opportunity_activities IS 'Atividades e tarefas relacionadas a oportunidades de vendas';
COMMENT ON COLUMN opportunity_activities.activity_type IS 'Tipo da atividade: task, call, email, meeting, note';
COMMENT ON COLUMN opportunity_activities.status IS 'Status da atividade: pending, in_progress, completed, cancelled';
COMMENT ON COLUMN opportunity_activities.priority IS 'Prioridade: low, medium, high, urgent'; 