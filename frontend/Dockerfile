FROM node:20-alpine

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar el resto del código
COPY . .

# Ejecutar como root (no recomendado pero funciona)
# No usar USER node

EXPOSE 3000

CMD ["npm", "run", "dev"]