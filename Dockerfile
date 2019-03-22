FROM instructure/node-passenger:10
COPY . /usr/src/app
RUN npm install
