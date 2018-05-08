"use strict";

const assert = require("assert");
const cipher = require("../../app/utils/cipher");

describe("Cipher", function() {
  describe("encryption", function() {
    it("can encrypt and decrypt a string", function(done) {
      const cryptedString = cipher.encrypt("0.0.1");
      assert.notEqual(cryptedString, "0.0.1");

      const decryptedString = cipher.decrypt(cryptedString);
      assert.equal("0.0.1", decryptedString);

      done();
    });
  });
});
