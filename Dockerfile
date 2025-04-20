FROM node:20-alpine as build

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --production

COPY --from=build /usr/src/app/dist ./dist

CMD [ "node", "dist/main.js" ]
