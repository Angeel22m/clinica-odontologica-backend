# ------------------ ETAPA 1: Construcción (Builder) ------------------
FROM node:22-alpine AS builder

# Recibe la URL de la base de datos como argumento de construcción
ARG DATABASE_URL

WORKDIR /app

# Copia package.json y package-lock.json
COPY package*.json ./

# Instala dependencias
RUN npm install

# Copia el resto del código fuente
COPY . .

# Hace que el ARG sea accesible como ENV para Prisma
ENV DATABASE_URL=${DATABASE_URL}

# Genera el cliente de Prisma
RUN npx prisma generate

# Construye la aplicación NestJS
RUN npm run build

# ------------------ ETAPA 2: Producción (Runner) ------------------
FROM node:22-alpine AS runner

ENV NODE_ENV=production
WORKDIR /usr/src/app

# Copia solo lo esencial desde el builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules/
COPY --from=builder /app/dist ./dist/
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma/
COPY --from=builder /app/prisma ./prisma/

# Expone el puerto
EXPOSE 3000

# Ejecuta la aplicación
CMD ["node", "dist/src/main.js"]
