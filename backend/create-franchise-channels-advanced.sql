-- Tabela de canais de chat da franquia (agora com canais privados e criador)
CREATE TABLE IF NOT EXISTS franchise_channels (
    id SERIAL PRIMARY KEY,
    franchise_id INTEGER NOT NULL REFERENCES franchises(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_private BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de membros dos canais
CREATE TABLE IF NOT EXISTS franchise_channel_members (
    id SERIAL PRIMARY KEY,
    channel_id INTEGER NOT NULL REFERENCES franchise_channels(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de mensagens do canal (já existe, mas para garantir)
CREATE TABLE IF NOT EXISTS franchise_channel_messages (
    id SERIAL PRIMARY KEY,
    channel_id INTEGER NOT NULL REFERENCES franchise_channels(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
); 