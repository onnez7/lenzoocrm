# --- frontend/Dockerfile ---

# Estágio 1: Construir a aplicação React
FROM node:18-alpine AS build

WORKDIR /app

# Copiar arquivos de dependência
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar o código fonte
COPY . .

# Construir a aplicação para produção
RUN npm run build

# Estágio 2: Servir a aplicação com Nginx
FROM nginx:1.25-alpine

# Copiar os arquivos estáticos construídos do estágio anterior
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar a configuração personalizada do Nginx (se você tiver uma, senão, pode remover esta linha)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 84
CMD ["nginx", "-g", "daemon off;"]