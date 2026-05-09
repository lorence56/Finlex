FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Test stage — no build needed
FROM base AS test
CMD ["npm", "test"]

# Production stage
FROM base AS prod
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
