# LenzooCRM

Sistema de gestão completo para franquias de óticas, com suporte a múltiplas filiais, gerenciamento de estoque, agendamentos e financeiro integrado.

## Stack Tecnológico

- **Frontend:** React 18 + TypeScript + Vite
- **Backend:** Express + TypeScript + Node.js
- **Banco de Dados:** PostgreSQL
- **Styling:** Tailwind CSS + shadcn/ui
- **State Management:** React Query + Context API

## Como Rodar Localmente

### Pré-requisitos
- Node.js >= 18.0.0
- npm >= 8.0.0
- PostgreSQL configurado

### Setup

```bash
# Clone o repositório
git clone <SEU_GIT_URL>
cd lenzoocrm

# Instale dependências do frontend
npm install

# Instale dependências do backend
cd backend && npm install && cd ..

# Configure as variáveis de ambiente
cp .env.example .env
cp backend/.env.example backend/.env
# Edite os arquivos .env com suas credenciais
```

### Rodando em Desenvolvimento

```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
npm run backend:dev
```

O frontend estará disponível em `http://localhost:5173`
O backend estará disponível em `http://localhost:3000`

## Build para Produção

```bash
npm run deploy:build
```

## Estrutura do Projeto

```
lenzoocrm/
├── src/                    # Frontend (React + TypeScript)
│   ├── components/         # Componentes reutilizáveis
│   ├── pages/             # Páginas da aplicação
│   ├── contexts/          # Context API
│   ├── hooks/             # Custom hooks
│   └── services/          # Serviços HTTP
├── backend/               # Backend (Express + TypeScript)
│   ├── src/
│   │   ├── controllers/   # Controladores
│   │   ├── routes/        # Rotas
│   │   ├── services/      # Lógica de negócio
│   │   ├── middleware/    # Middlewares
│   │   └── types/         # Tipos TypeScript
│   └── package.json
└── package.json
```

## Recursos Principais

- 👥 Gestão de clientes e contatos
- 📦 Gestão completa de estoque
- 🏪 Múltiplas filiais/franquias
- 📅 Agendamentos e calendário
- 💰 Módulo financeiro (contas a receber/pagar)
- 📊 Relatórios e analytics
- 🔐 Controle de permissões por roles
- 💬 Chat entre franquias

## Roles e Permissões

- **SUPER_ADMIN:** Acesso total ao sistema
- **FRANCHISE_ADMIN:** Administrador de franquia
- **EMPLOYEE:** Usuário operacional

## Deploy

Para informações sobre deploy, consulte a documentação no diretório `backend/` ou configure via EasyPanel usando `easypanel.yaml`.

## Licença

Proprietary - Todos os direitos reservados
