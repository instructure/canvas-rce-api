import {
  CompactEncrypt,
  CompactSign,
  compactDecrypt,
  compactVerify,
} from "jose";

import _config from "./config.js";
import { TokenInvalidException } from "./exceptions/TokenInvalidException.js";

class Token {
  static inject() {
    return [_config];
  }

  static init(config) {
    return new this(config);
  }

  constructor(config) {
    const signingSecret = config.require("token.signingSecret");
    const encryptionSecret = config.require("token.encryptionSecret");
    this._signingKey = new TextEncoder().encode(signingSecret);
    this._encryptionKey = new TextEncoder().encode(encryptionSecret);
  }

  /**
   * Creates a signed and ecrypted JWT for a given payload.
   *
   * @param {Object} payload
   *
   * @return {String}
   */
  async create(payload) {
    const signed = await this._sign(payload);
    const encrypted = await this._encrypt(signed);
    const encoded = this._encode(encrypted);
    return encoded;
  }

  /**
   * Returns the payload from a signed and encrypted JWT. Does not validate
   * claims.
   *
   * @param {String} token
   *
   * @throws {TokenInvalidException}
   *
   * @return {Object}
   */
  async payload(token) {
    try {
      const decoded = this._decode(token);
      const decrypted = await this._decrypt(decoded);
      const verified = await this._verify(decrypted.plaintext.toString());
      return JSON.parse(verified.payload);
    } catch (error) {
      throw TokenInvalidException.parse(error);
    }
  }

  /**
   * Returns the payload from a signed and encrypted JWT and validates the
   * claims.
   *
   * @param {String} token
   *
   * @throws {TokenInvalidException}
   *
   * @return {Object}
   */
  async verify(token) {
    const payload = await this.payload(token);
    this._validatePayload(payload);
    return payload;
  }

  /**
   * Wraps and signs a user token. The returned token can be used directly with
   * Canvas as a bearer token.
   *
   * @param {String} token
   *
   * @return {String}
   */
  async wrap(token) {
    const payload = { user_token: this._decode(token) };
    const signed = await this._sign(payload);
    const encoded = this._encode(signed);
    return encoded;
  }

  _decode(value) {
    return Buffer.from(value, "base64").toString("utf8");
  }

  _encode(value) {
    return Buffer.from(value).toString("base64");
  }

  async _decrypt(value) {
    const { plaintext } = await compactDecrypt(value, this._encryptionKey);
    return { plaintext: Buffer.from(plaintext) };
  }

  async _encrypt(value) {
    return await new CompactEncrypt(new TextEncoder().encode(value))
      .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
      .encrypt(this._encryptionKey);
  }

  async _verify(value) {
    const { payload } = await compactVerify(value, this._signingKey);
    return { payload: new TextDecoder().decode(payload) };
  }

  async _sign(payload) {
    const value = new TextEncoder().encode(JSON.stringify(payload));
    return await new CompactSign(value)
      .setProtectedHeader({ alg: "HS256" })
      .sign(this._signingKey);
  }

  _validatePayload(payload) {
    const now = Date.now() / 1000;
    if (payload.nbf != null && payload.nbf > now) {
      throw TokenInvalidException.before();
    }

    if (payload.exp != null && payload.exp < now) {
      throw TokenInvalidException.expired();
    }
  }
}

export { Token };
