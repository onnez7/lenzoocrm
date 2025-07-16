
# Copia primeiro os arquivos de gerenciamento de pacotes
# Isso aproveita o cache de camadas do Docker, acelerando builds futuros
COPY backend/package*.json ./

# Instala TODAS as dependências, incluindo as de desenvolvimento (`devDependencies`)
# que são necessárias para o build (ex: typescript)
RUN npm install

# Copia o restante do código-fonte do backend
COPY backend/ .

# Compila o código TypeScript para JavaScript
# O script 'build' no package.json do backend deve executar `tsc`
RUN npm run build

# --- ESTÁGIO 2: Cria a imagem final de produção ---

