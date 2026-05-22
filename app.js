import dns from "node:dns";
import container from "./app/container.js";
import _application from "./app/application.js";

// Note: dotenv and Sentry are loaded via ./instrument.js
// https://docs.sentry.io/platforms/javascript/guides/node/#apply-instrumentation-to-your-app

// Node 17 introduced a breaking change that changed the default IP result order (ordering
// ipv6 addresses first). This breaks local development when the Canvas host is localhost,
// so set the default back to ipv4 first.
dns.setDefaultResultOrder("ipv4first");

export default container.make(_application).listen();
