FROM node:latest

WORKDIR /migrate

COPY package.json /migrate/package.json
COPY . /migrate
RUN npm install

CMD ["yarn", "start"]
