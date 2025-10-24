# -----------------------------
# Stage 1: Build
# -----------------------------
FROM node:20-alpine AS build
WORKDIR /app

# Instalar herramientas necesarias para compilación de Prisma y otros paquetes nativos
RUN apk add --no-cache python3 make g++

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar todas las dependencias (incluyendo dev para Prisma)
RUN npm ci

# Copiar todo el código
COPY . .

# Build NestJS
RUN npm run build

# -----------------------------
# Stage 2: Runtime
# -----------------------------
FROM node:20-alpine AS runtime
WORKDIR /app

# Copiar solo build y package.json
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./

# Instalar solo dependencias de producción
RUN npm install --omit=dev

EXPOSE 3000
CMD ["node", "dist/main.js"]

