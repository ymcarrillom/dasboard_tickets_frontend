# syntax=docker/dockerfile:1.7

# ---- build ----
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./

# Reduce ruido y mejora tiempos de red
RUN npm config set fund false \
 && npm config set audit false \
 && npm config set fetch-retries 5 \
 && npm config set fetch-retry-maxtimeout 600000 \
 && npm config set fetch-timeout 600000

# ✅ Cachea descargas de npm entre builds (MUY importante)
RUN --mount=type=cache,target=/root/.npm \
    if [ -f package-lock.json ]; then \
      npm ci --prefer-offline --no-audit --no-fund; \
    else \
      npm install --prefer-offline --no-audit --no-fund; \
    fi

COPY . .

# Por si Vite consume RAM en build
ENV NODE_OPTIONS=--max_old_space_size=2048

RUN npm run build

# ---- serve ----
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
