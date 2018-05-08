"use strict";

const jose = require("node-jose");
const _config = require("./config");
const TokenInvalidException = require("./exceptions/TokenInvalidException");

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
    this._signingKey = this._jwk(signingSecret, "HS256");
    this._encryptionKey = this._jwk(encryptionSecret, "A256GCM");
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
    return Buffer.from(value, "base64").toString("ascii");
  }

  _encode(value) {
    return Buffer.from(value).toString("base64");
  }

  async _decrypt(value) {
    const key = await jose.JWK.asKey(this._encryptionKey);
    return await jose.JWE.createDecrypt(key).decrypt(value);
  }

  async _encrypt(value) {
    const key = await jose.JWK.asKey(this._encryptionKey);
    return await jose.JWE.createEncrypt({ format: "compact" }, key)
      .update(value)
      .final();
  }

  async _verify(value) {
    const key = await jose.JWK.asKey(this._signingKey);
    return await jose.JWS.createVerify(key).verify(value);
  }

  async _sign(payload) {
    const value = Buffer.from(JSON.stringify(payload));
    const key = await jose.JWK.asKey(this._signingKey);
    return await jose.JWS.createSign({ format: "compact" }, key)
      .update(value)
      .final();
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

  _jwk(secret, alg) {
    return {
      kty: "oct",
      k: Buffer.from(secret).toString("base64"),
      alg
    };
  }
}

module.exports = Token;
