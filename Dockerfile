# --- backend/Dockerfile ---

# ESTÁGIO 1: Build da Aplicação
# Usamos um apelido 'builder' para este estágio
FROM node:18-alpine AS builder

# Define o diretório de trabalho
WORKDIR /app

# Copia primeiro os arquivos de gerenciamento de pacotes
# Isso aproveita o cache de camadas do Docker, acelerando builds futuros
COPY package*.json ./

# Instala TODAS as dependências, incluindo as de desenvolvimento (`devDependencies`)
# que são necessárias para o build (ex: typescript)
RUN npm install

# Copia o restante do código-fonte do backend
COPY . .

# Compila o código TypeScript para JavaScript
# O script 'build' no package.json executa `tsc`
RUN npm run build

# --- ESTÁGIO 2: Cria a imagem final de produção ---
# Usamos o apelido 'runner', uma convenção comum
FROM node:18-alpine AS runner

WORKDIR /app

# Copia os arquivos de pacotes do estágio de build
COPY --from=builder /app/package*.json ./

# Instala APENAS as dependências de produção para manter a imagem pequena e segura
RUN npm ci --only=production

# Copia a pasta 'dist' com o código compilado do estágio de build
COPY --from=builder /app/dist ./dist

# Expõe a porta em que a aplicação irá rodar
EXPOSE 3001

# Comando para iniciar a aplicação
# Ele usa o script "start" do seu package.json ("node dist/server.js")
CMD [ "npm", "start" ]

