/**
 * Sign and verify a value.
 *
 * Implemented as a JWT, signing, encoding, and verifying with an expiration.
 *
 * Uses ECOSYSTEM_SECRET from the environment as the signing secret.
 */

import { SignJWT, jwtVerify } from "jose";

const DEFAULT_EXP = 24 * 60 * 60;
const SECRET = process.env.ECOSYSTEM_SECRET;
const secretBytes = new TextEncoder().encode(SECRET);

/**
 * Sign a value
 *
 * @param {*} value to be signed
 * @param {number} [expiresIn=86400] seconds
 * @return {Promise<string>}
 */
async function sign(val, expiresIn = DEFAULT_EXP) {
  return await new SignJWT({ val })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${expiresIn}s`)
    .sign(secretBytes);
}

/**
 * Verify and return a signed value
 *
 * @param {string} token
 * @return {Promise<*>} original value or null if invalid for any reason
 */
async function verify(token) {
  try {
    const { payload } = await jwtVerify(token, secretBytes);
    return payload.val;
  } catch (_) {
    return null;
  }
}

export const signer = { sign, verify };
