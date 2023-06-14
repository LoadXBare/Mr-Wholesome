FROM node:18.16.0-alpine3.18 AS build
WORKDIR /home/mr-wholesome/
COPY ["package.json", "yarn.lock", "tsconfig.json", "prisma", "/home/mr-wholesome/"]
RUN yarn --frozen-lockfile --link-duplicates
COPY ["src", "/home/mr-wholesome/src"]
RUN npx tsc

FROM node:18.16.0-alpine3.18
WORKDIR /home/mr-wholesome/
COPY ["package.json", "yarn.lock", "prisma", "/home/mr-wholesome/"]
RUN yarn install --frozen-lockfile --link-duplicates --pure-lockfile --production=true
COPY --from=build ["/home/mr-wholesome/dist", "/home/mr-wholesome/dist"]

CMD ["npm", "start"]