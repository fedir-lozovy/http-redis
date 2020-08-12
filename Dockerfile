# Builder container
FROM node:12.4 AS prodbuild

ENV TZ=Europe/London
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN mkdir -p /home/node/app
WORKDIR /home/node/app

# install just production libs that we'll need to run the app
COPY package.json package-lock.json ./
RUN npm set progress=false
RUN npm ci --only=production

# install ALL node_modules, including 'devDependencies' so we can build
FROM prodbuild AS prebuild
RUN npm set progress=false
RUN npm ci
RUN npm i typescript -g

FROM prebuild as build
COPY . .
RUN npm run build

# Release container
FROM node:12.4-alpine as release

# Set NODE_ENV to production
ENV NODE_ENV production

RUN mkdir -p /home/node/app
WORKDIR /home/node/app

# copy in the prod dependencies
COPY --from=prodbuild --chown=node:node /home/node/app/node_modules ./node_modules
# copy in the built dist
COPY --from=build --chown=node:node /home/node/app/dist ./dist
# copy in the built dist
COPY --from=prodbuild --chown=node:node /home/node/app/package.json ./package.json

USER node
EXPOSE 3000