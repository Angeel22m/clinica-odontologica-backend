# ------------------ ETAPA 1: Construcción (Builder) ------------------
FROM node:22-alpine AS builder

# 1. DECLARA EL ARGUMENTO DE CONSTRUCCIÓN
# Docker usará el valor pasado por el workflow aquí.
ARG DATABASE_URL

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de manifiesto
COPY package*.json ./

# Instala todas las dependencias
RUN npm install

# Copia el resto de los archivos fuente de la aplicación
COPY . .

# 2. Asigna la variable de entorno para que Prisma la use en este paso
ENV DATABASE_URL=${DATABASE_URL}

# 3. Genera los archivos de cliente de Prisma (Soluciona el error)
RUN npx prisma generate

# 4. Construye la aplicación NestJS
RUN npm run build

# ------------------ ETAPA 2: Producción (Runner) ------------------
FROM node:22-alpine AS runner

# Configura la variable de entorno para el entorno de producción
ENV NODE_ENV production

# Establece el directorio de trabajo
WORKDIR /usr/src/app

# Copia SOLO los archivos esenciales de la etapa de construcción:
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist/
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma/

# Instala SÓLO las dependencias de producción
RUN npm install --omit=dev

# Expone el puerto (3000 por defecto)
EXPOSE 3000

# Comando para ejecutar la aplicación
# La ruta corregida es 'dist/src/main.js'
CMD [ "node", "dist/src/main.js" ]
