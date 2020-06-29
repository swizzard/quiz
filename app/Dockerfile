FROM node:latest

WORKDIR /app

COPY package.json /app/package.json
COPY . /app
RUN npm install
RUN npm install react-scripts@3.4.1 -g

CMD ["yarn", "start"]
