"use strict";

require("dotenv").config();

global.fetch = require("node-fetch");

const container = require("./app/container");
const _application = require("./app/application");

module.exports = container.make(_application).listen();
