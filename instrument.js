/*eslint no-console: 0*/

// Loaded via `node --import ./instrument.js`
// https://docs.sentry.io/platforms/javascript/guides/node/#apply-instrumentation-to-your-app

import "dotenv/config.js";

import * as Sentry from "@sentry/node";

import { onBeforeSend } from "./app/middleware/errors.js";

const dsn = process.env.SENTRY_DSN;

if (dsn) {
  const environment = process.env.INS_STACK_NAME || process.env.NODE_ENV;
  Sentry.init({
    dsn,
    environment,
    beforeSend(event) {
      return onBeforeSend(event, environment);
    },
    onFatalError(err) {
      console.log("Exiting due to uncaught exception.", err);
      process.exit(1);
    },
  });
}
