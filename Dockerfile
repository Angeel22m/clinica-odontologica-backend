# ------------------ ETAPA 1: Construcción (Builder) ------------------
FROM node:22-alpine AS builder

# 1. REINTRODUCIMOS ARG para recibir la URL desde GitHub Actions o el comando 'docker build'.
# Este es el método correcto para inyectar secretos que no están en el repositorio.
ARG DATABASE_URL

WORKDIR /app

# Copia e instala dependencias
COPY package*.json ./
RUN npm install

# 2. Copia el resto del código fuente (ya no copiamos .env)
COPY . . 

# 3. Hacemos el ARG disponible como ENV para que 'prisma generate' lo pueda leer.
ENV DATABASE_URL=${DATABASE_URL}

# 4. Genera el cliente de Prisma (Ahora usa la variable inyectada via ARG)
RUN npx prisma generate

# 5. Construye la aplicación NestJS
RUN npm run build

# ------------------ ETAPA 2: Producción (Runner) ------------------
FROM node:22-alpine AS runner

# Configura la variable de entorno de producción
ENV NODE_ENV production

# 🚨 CORRECCIÓN CLAVE: Declarar la ENV en la imagen final
# Esto le indica al contenedor que debe esperar esta variable en runtime.
ENV DATABASE_URL=${DATABASE_URL}

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

# ------------------ ETAPA 1: Construcción (Builder) ------------------
FROM node:22-alpine AS builder

# 1. REINTRODUCIMOS ARG para recibir la URL desde GitHub Actions o el comando 'docker build'.
# Este es el método correcto para inyectar secretos que no están en el repositorio.
ARG DATABASE_URL

WORKDIR /app

# Copia e instala dependencias
COPY package*.json ./
RUN npm install

# 2. Copia el resto del código fuente (ya no copiamos .env)
COPY . . 

# 3. Hacemos el ARG disponible como ENV para que 'prisma generate' lo pueda leer.
ENV DATABASE_URL=${DATABASE_URL}

# 4. Genera el cliente de Prisma (Ahora usa la variable inyectada via ARG)
RUN npx prisma generate

# 5. Construye la aplicación NestJS
RUN npm run build

# ------------------ ETAPA 2: Producción (Runner) ------------------
FROM node:22-alpine AS runner

# Configura la variable de entorno de producción
ENV NODE_ENV production

# La ENV vacía se mantiene. Esto le dice a la aplicación que debe esperar
# la URL de producción en runtime, y no filtra ningún valor de ARG anterior.
ENV DATABASE_URL=""

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

