/**
 * Sign and verify a value.
 *
 * Implemented as a JWT since the library is already present, and handles
 * signing, encoding, and verifying with and expiration.
 *
 * Uses ECOSYSTEM_SECRET from the environment as the signing secret.
 */

"use strict";

const jwt = require("jsonwebtoken");

const DEFAULT_EXP = 24 * 60 * 60;
const SECRET = process.env.ECOSYSTEM_SECRET;

/**
 * Sign a value
 *
 * @param {*} value to be signed
 * @param {number} [expiresIn=86400] seconds
 * @return {string}
 */
function sign(val, expiresIn = DEFAULT_EXP) {
  return jwt.sign({ val }, SECRET, { expiresIn });
}

/**
 * Verify and return a signed value
 *
 * @param {string} token
 * @return {*} original value or null if invalid for any reason
 */
function verify(token) {
  try {
    const { val } = jwt.verify(token, SECRET);
    return val;
  } catch (_) {
    return null;
  }
}

module.exports = { sign, verify };
