# Stage 1: build
FROM node:22-alpine AS build
WORKDIR /app

# Asegurar misma versión de npm
RUN npm install -g npm@10.9.3

COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Stage 2: runtime
FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
RUN npm install --omit=dev --legacy-peer-deps

EXPOSE 3000
CMD ["node", "dist/main.js"]
