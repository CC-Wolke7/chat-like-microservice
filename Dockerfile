# --- Build container ---
# Includes build tools required for native dependencies
FROM node:14.15.4 as builder

WORKDIR /app

# Dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile && yarn cache clean

# Build
COPY . ./
RUN yarn build

# --- Run container ---
FROM node:14.15.4-alpine

WORKDIR /app

COPY --from=builder /app ./

EXPOSE 3000
CMD ["yarn", "start:prod"]
