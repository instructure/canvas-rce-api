FROM instructure/node-passenger:16
COPY --chown=docker:docker . /usr/src/app

RUN npm install
