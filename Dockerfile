FROM --platform=${TARGETPLATFORM:-"linux/amd64"} instructure/node-passenger:20
COPY --chown=docker:docker . /usr/src/app

RUN npm ci
