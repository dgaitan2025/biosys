# ---- build ----
FROM node:22-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vacías = mismo origen: nginx redirige /seguridad, /biosys y /api a los contenedores.
# El lector de huellas corre en la PC del usuario, por eso apunta a su localhost.
ARG VITE_SEGURIDAD_URL=""
ARG VITE_API_URL=""
ARG VITE_HUELLA_URL="http://localhost:5056"
ENV VITE_SEGURIDAD_URL=${VITE_SEGURIDAD_URL} \
    VITE_API_URL=${VITE_API_URL} \
    VITE_HUELLA_URL=${VITE_HUELLA_URL}

RUN npm run build

# ---- runtime ----
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
