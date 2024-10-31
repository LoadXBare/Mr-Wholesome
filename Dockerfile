FROM node:lts-alpine AS build
WORKDIR /home/mr-wholesome/
COPY ["package.json", "package-lock.json", "tsconfig.json", "prisma", "/home/mr-wholesome/"]
RUN npm ci
COPY ["src", "/home/mr-wholesome/src"]
RUN npx tsc

FROM node:lts-alpine
WORKDIR /home/mr-wholesome/
COPY ["package.json", "package-lock.json", "tsconfig.json", "prisma", "/home/mr-wholesome/"]
RUN npm install --production
COPY --from=build ["/home/mr-wholesome/dist", "/home/mr-wholesome/dist"]
CMD ["npm", "start"]
