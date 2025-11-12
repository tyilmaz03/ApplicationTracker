# ====== Étape 1 : build Angular ======
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ====== Étape 2 : nginx pour servir le front ======
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers générés dans nginx
COPY --from=build /app/dist/application_tracker/browser/ /usr/share/nginx/html

EXPOSE 80
