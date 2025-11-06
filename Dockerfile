# ------------------ ETAPA 1: Construcción (Builder) ------------------
FROM node:22-alpine AS builder

# Recibe la URL de la base de datos como argumento de construcción
ARG DATABASE_URL

WORKDIR /app

# Copia e instala dependencias usando npm ci (más rápido y consistente con lock file)
COPY package*.json ./
COPY package-lock.json ./  # <--- Aseguramos la copia del lock file
RUN npm ci                  # <--- Usamos npm ci

# Copia el resto del código fuente
COPY . . 

# Hace que el ARG sea accesible como ENV para la generación de Prisma
ENV DATABASE_URL=${DATABASE_URL}

# Genera el cliente de Prisma
RUN npx prisma generate

# Construye la aplicación NestJS
RUN npm run build

# ------------------ ETAPA 2: Producción (Runner) ------------------
FROM node:22-alpine AS runner

# Configura la variable de entorno de producción
ENV NODE_ENV production
WORKDIR /usr/src/app

# Copia solo los archivos esenciales de la etapa de construcción:
COPY --from=builder /app/package*.json ./
# Copia node_modules completo de la etapa anterior (donde se instaló con npm ci)
COPY --from=builder /app/node_modules ./node_modules/ 
COPY --from=builder /app/dist ./dist/
# Aseguramos que se copien los archivos de Prisma generados
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma/ 
COPY --from=builder /app/prisma ./prisma/

# Expone el puerto
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD [ "node", "dist/src/main.js" ]