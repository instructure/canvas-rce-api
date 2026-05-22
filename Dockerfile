FROM --platform=${TARGETPLATFORM:-"linux/amd64"} instructure/node-passenger:20
COPY --chown=docker:docker . /usr/src/app

RUN npm ci

# https://docs.sentry.io/platforms/javascript/guides/node/#apply-instrumentation-to-your-app
ENV NODE_OPTIONS="--import=./instrument.js"
