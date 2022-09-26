FROM node:16-buster-slim

WORKDIR /app

COPY package.json /app

RUN npm install

COPY . /app

CMD ["npm","start"]