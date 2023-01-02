FROM node:lts-alpine AS builder
WORKDIR /usr/src/app
COPY . .
RUN npm i
RUN npm run compile
WORKDIR /usr/src/app/dist
EXPOSE 3003
ENTRYPOINT ["node","server.js"]