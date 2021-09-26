FROM node:latest

ENV NODE_ENV production

RUN \
  mkdir /tmp/directus-extensions-installer && \
  cd /tmp/directus-extensions-installer && \
  wget -O extensions-installer.tar.gz https://github.com/V1210N/directus-extensions-installer/releases/download/latest/bundle.tar.gz && \
  tar -xf extensions-installer.tar.gz && \
  rm extensions-installer.tar.gz && \
  node bundle.js && \
  rm bundle.js