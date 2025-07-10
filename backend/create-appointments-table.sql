-- Criar tabela de agendamentos
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    service VARCHAR(100) NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'agendado' CHECK (status IN ('agendado', 'confirmado', 'em_andamento', 'concluido', 'cancelado')),
    observations TEXT,
    franchise_id INTEGER NOT NULL REFERENCES franchises(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_appointments_franchise_id ON appointments(franchise_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_employee_id ON appointments(employee_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Inserir alguns agendamentos de exemplo
INSERT INTO appointments (client_id, employee_id, service, appointment_date, appointment_time, status, observations, franchise_id) VALUES
(1, 1, 'Consulta Oftalmológica', '2024-01-15', '09:00:00', 'confirmado', 'Primeira consulta', 1),
(2, 2, 'Exame de Vista', '2024-01-15', '10:30:00', 'agendado', NULL, 1),
(3, 3, 'Adaptação de Lentes', '2024-01-16', '14:00:00', 'em_andamento', 'Cliente já tem receita', 1),
(4, 1, 'Teste de Lentes de Contato', '2024-01-17', '11:00:00', 'agendado', NULL, 1),
(5, 2, 'Exame de Fundo de Olho', '2024-01-18', '15:30:00', 'agendado', 'Exame de rotina', 1);

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_appointments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_appointments_updated_at ON appointments;
CREATE TRIGGER trigger_update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_appointments_updated_at(); 