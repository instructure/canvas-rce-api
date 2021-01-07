FROM instructure/node-passenger:12
COPY . /usr/src/app
RUN npm install
