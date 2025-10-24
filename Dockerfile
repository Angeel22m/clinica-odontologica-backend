# ------------------ ETAPA 1: Construcción (Builder) ------------------
FROM node:22-alpine AS builder

# 1. DECLARA ARG (Recibe el valor del workflow/build)
ARG DATABASE_URL

WORKDIR /app

# Copia e instala dependencias
COPY package*.json ./
RUN npm install

# Copia código fuente
COPY . .

# 2. Asigna ENV (Necesario para el paso 'prisma generate')
ENV DATABASE_URL=${DATABASE_URL}

# 3. Genera el cliente de Prisma (Éxito garantizado con el ARG/ENV)
RUN npx prisma generate

# 4. Construye la aplicación NestJS
RUN npm run build

# ------------------ ETAPA 2: Producción (Runner) ------------------
FROM node:22-alpine AS runner

# Configura la variable de entorno de producción
ENV NODE_ENV production

# 🚨 CORRECCIÓN CLAVE: Declarar la ENV en la imagen final
# Esto le indica al contenedor que debe esperar esta variable en runtime.
ENV DATABASE_URL

WORKDIR /usr/src/app

# Copia solo los archivos esenciales de la etapa de construcción:
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist/
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma/

# Instala SÓLO las dependencias de producción
RUN npm install --omit=dev

# Expone el puerto (3000 por defecto)
EXPOSE 3000

# Comando para ejecutar la aplicación con la ruta corregida
CMD [ "node", "dist/src/main.js" ]
