"use strict";

require("dotenv").config();

global.fetch = require("node-fetch");

const container = require("./app/container");
const _application = require("./app/application");

// Node 17 introduced a breaking change that changed the default IP result order (ordering
// ipv6 addresses first). This breaks local development when the Canvas host is localhost,
// so set the default back to ipv4 first.
const dns = require("node:dns");
dns.setDefaultResultOrder("ipv4first");

module.exports = container.make(_application).listen();
