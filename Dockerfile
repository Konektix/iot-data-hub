FROM node:22.14.0-alpine

WORKDIR /app

COPY package*.json .

RUN npm ci

COPY . .

CMD ["npm", "start"]