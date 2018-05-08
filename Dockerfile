FROM instructure/node-passenger:8
COPY . /usr/src/app
RUN npm install
