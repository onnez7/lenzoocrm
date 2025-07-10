-- Script para criar o usuário admin matriz
-- Senha: admin123 (criptografada com bcrypt)

-- Primeiro, vamos criar uma franquia matriz se não existir
INSERT INTO franchises (name, address) 
VALUES ('Matriz', 'Endereço da Matriz') 
ON CONFLICT DO NOTHING;

-- Agora vamos criar o usuário admin matriz
-- A senha 'admin123' criptografada com bcrypt (salt rounds = 10)
INSERT INTO users (name, email, password_hash, role, franchise_id) 
VALUES (
    'Admin Matriz', 
    'admin@matriz.com', 
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- admin123
    'SUPER_ADMIN', 
    NULL -- SUPER_ADMIN não tem franchise_id
) ON CONFLICT (email) DO NOTHING;

-- Verificar se foi criado
SELECT id, name, email, role, franchise_id, created_at 
FROM users 
WHERE email = 'admin@matriz.com'; 