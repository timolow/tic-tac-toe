# ---- Stage 1: Build ----
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json tsconfig.json vite.config.ts ./
COPY src/ ./src/
COPY index.html ./

RUN npm install && npm run build

# ---- Stage 2: Serve ----
FROM nginx:alpine AS production

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
