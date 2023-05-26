FROM node:18.16.0-slim

ENV HOME /home/mr-wholesome/
WORKDIR $HOME

COPY ["package.json", "yarn.lock", "tsconfig.json", "prisma", "$HOME"]
RUN yarn --frozen-lockfile --link-duplicates
RUN npx prisma generate

COPY ["src", "$HOME/src"]
RUN npx tsc

CMD ["npm", "start"]