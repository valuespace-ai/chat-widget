# Stage 1: Build
FROM node:18 AS builder
WORKDIR /app
COPY . .
RUN npm ci
ENV VITE_BOT_SERVICE_URL=https://valuespace-chat-bot.greenocean-c31c3e3d.switzerlandnorth.azurecontainerapps.io
RUN npm run build:dev

# Stage 2: Serve with NGINX
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]