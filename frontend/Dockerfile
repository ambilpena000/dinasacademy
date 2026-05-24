# ── Build stage ───────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# ARG untuk menerima env variable saat build
ARG VITE_API_URL=http://localhost:3000/api
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Production stage (Nginx) ──────────────────────────────────
FROM nginx:alpine AS production

# Copy hasil build ke nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Config nginx untuk React Router (SPA)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
