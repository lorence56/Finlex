FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Test stage — no build needed, just run vitest
FROM base AS test
CMD ["npm", "test"]

# Production stage
FROM base AS prod
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]

