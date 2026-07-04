FROM node:24-alpine

RUN apk add --no-cache su-exec
WORKDIR /app
ENV NPM_CONFIG_USERCONFIG=/tmp/.npmrc
RUN mkdir -p /app/node_modules && chown -R node:node /app
USER node
RUN npm config set registry https://registry.npmjs.org/

COPY --chown=node:node package.json ./
COPY --chown=node:node tsconfig.json ./
COPY --chown=node:node src ./src

EXPOSE 3000
CMD ["npm", "run", "dev"]