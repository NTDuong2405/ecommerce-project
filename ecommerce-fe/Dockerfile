# Build Stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Final Stage (Nginx)
FROM nginx:stable-alpine

# Copy built assets to Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port (Nginx default)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
