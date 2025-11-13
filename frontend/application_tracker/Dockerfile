# ================================
#  Étape 1 : build Angular
# ================================
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build Angular en mode prod
RUN npm run build -- --configuration production

# ================================
#  Étape 2 : Nginx pour servir le front
# ================================
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

# Nom du projet Angular
ARG APP_NAME=application_tracker

COPY --from=build /app/dist/${APP_NAME}/browser/ /usr/share/nginx/html

EXPOSE 80
