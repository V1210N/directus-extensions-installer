FROM node:latest

COPY dist/bundle.js /etc/directus-extensions-installer.js

ENV NODE_ENV production

CMD node etc/directus-extensions-installer.js