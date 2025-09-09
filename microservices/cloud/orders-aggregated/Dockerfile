FROM node:22-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig*.json ./

RUN npm install

COPY . .

#Removed for Live Reload
RUN rm -rf ./src

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
