# Stage 1: Build
FROM node:22-alpine AS build
WORKDIR /app

# Herramientas necesarias para compilar Prisma
RUN apk add --no-cache bash python3 make g++ libc6-compat

# Copiar dependencias
COPY package*.json ./
RUN npm ci

# Generar Prisma Client
RUN npx prisma generate

# Copiar código fuente
COPY . .

# Build NestJS
RUN npm run build

# Stage 2: Runtime
FROM node:22-alpine AS runtime
WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./

# Instalar solo dependencias de producción
RUN npm install --omit=dev

EXPOSE 3000
CMD ["node", "dist/src/main.js"]



