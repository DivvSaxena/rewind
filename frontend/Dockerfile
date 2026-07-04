# Rewind frontend — Next.js standalone build for Fly.io.
# NEXT_PUBLIC_API_URL is inlined at build time; pass the deployed backend URL:
#   fly deploy --build-arg NEXT_PUBLIC_API_URL=https://rewind-backend.fly.dev
FROM node:20-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG NEXT_PUBLIC_API_URL=http://localhost:8000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
