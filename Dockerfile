FROM node:18-alpine

WORKDIR /app

# Copiar package.json e instalar dependências
COPY package*.json ./
COPY backend/package*.json ./backend/
RUN npm install
RUN cd backend && npm install

# Copiar código fonte
COPY . .

# Build do frontend
RUN npm run build

# Build do backend
RUN cd backend && npm run build

# Expor porta
EXPOSE 3001

# Comando para iniciar
CMD ["npm", "run", "start"] 