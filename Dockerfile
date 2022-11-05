FROM node:18-alpine3.15
WORKDIR /data
ENV MYSQL_URL="mysql://root:password@localhost:3306/plan"
RUN apk add --no-cache git
RUN git clone https://github.com/TypicalTropic/guardian.git /data/app
WORKDIR /data/app
COPY ["config/config.yml", "./"]
RUN npx @databases/mysql-schema-cli --database MYSQL_URL --directory src/__generated__
RUN yarn install
RUN yarn build
CMD [ "yarn", "start"]