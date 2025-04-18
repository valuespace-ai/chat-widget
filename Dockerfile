# Build stage
FROM node:18 AS builder
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build:dev

# Runtime stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY test.html /usr/share/nginx/html/index.html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
