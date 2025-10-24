# Stage 1: build
FROM node:20-alpine AS build
WORKDIR /app

# Copiar package.json y lockfile para instalar dependencias
COPY package*.json ./
RUN npm ci

# Copiar todo el código fuente
COPY . .

# Compilar NestJS
RUN npm run build

# Stage 2: runtime
FROM node:20-alpine AS runtime
WORKDIR /app

# Copiar solo build y package.json
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./

# Instalar solo dependencias de producción
RUN npm ci --omit=dev

EXPOSE 3000
CMD ["node", "dist/main.js"]
