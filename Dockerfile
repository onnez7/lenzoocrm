# Multi-stage build para otimizar o tamanho da imagem
FROM node:18-alpine AS base

# Instalar dependências necessárias
RUN apk add --no-cache libc6-compat

# Stage 1: Build do Frontend
FROM base AS frontend-builder
WORKDIR /app/frontend

# Copiar package.json e instalar dependências
COPY package*.json ./
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Build do frontend
RUN npm run build

# Stage 2: Build do Backend
FROM base AS backend-builder
WORKDIR /app/backend

# Copiar package.json do backend
COPY backend/package*.json ./
RUN npm ci --only=production

# Copiar código fonte do backend
COPY backend/ .

# Build do backend (se necessário)
RUN npm run build

# Stage 3: Imagem final
FROM base AS runner
WORKDIR /app

# Criar usuário não-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar arquivos buildados
COPY --from=frontend-builder --chown=nextjs:nodejs /app/frontend/dist ./frontend/dist
COPY --from=backend-builder --chown=nextjs:nodejs /app/backend/dist ./backend/dist
COPY --from=backend-builder --chown=nextjs:nodejs /app/backend/node_modules ./backend/node_modules
COPY --from=backend-builder --chown=nextjs:nodejs /app/backend/package*.json ./backend/

# Copiar arquivos de configuração
COPY backend/config.env ./backend/
COPY docker-compose.yml ./

# Expor porta
EXPOSE 3001

# Mudar para usuário não-root
USER nextjs

# Comando para iniciar o backend
CMD ["node", "backend/dist/server.js"] 