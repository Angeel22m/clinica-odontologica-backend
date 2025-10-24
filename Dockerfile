# -----------------------------
# Stage 1: Build
# -----------------------------
FROM node:22-alpine AS build
WORKDIR /app

# Herramientas necesarias para compilar paquetes nativos (Prisma)
RUN apk add --no-cache python3 make g++

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar todas las dependencias (dev incluidas)
RUN npm ci

# Copiar el código fuente
COPY . .

# Compilar NestJS
RUN npm run build

# -----------------------------
# Stage 2: Runtime
# -----------------------------
FROM node:22-alpine AS runtime
WORKDIR /app

# Copiar solo build y package.json
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./

# Instalar solo dependencias de producción
RUN npm install --omit=dev

EXPOSE 3000

# Apuntar al path correcto del main.js
CMD ["node", "dist/src/main.js"]


