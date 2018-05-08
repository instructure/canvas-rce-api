"use strict";

const corsProtection = require("../../../app/middleware/corsProtection");
const assert = require("assert");

describe("corsProtection", function() {
  describe("validateOrigin", function() {
    it("allows everything", function(done) {
      corsProtection.validateOrigin("http://lvh.me", function(_, validated) {
        assert(validated);
        done();
      });
    });

    it("approves undefined origins", function(done) {
      corsProtection.validateOrigin(undefined, function(_, validated) {
        assert(validated);
        done();
      });
    });
  });
});
