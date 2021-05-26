FROM instructure/node-passenger:12
COPY --chown=docker:docker . /usr/src/app

RUN npm install
