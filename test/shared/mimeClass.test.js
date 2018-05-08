"use strict";

const assert = require("assert");
const { fileEmbed, mimeClass } = require("../../shared/mimeClass");

describe("fileEmbed", () => {
  it("defaults to file", () => {
    assert.equal(fileEmbed({}).type, "file");
  });

  it("uses content-type to identify video and audio", () => {
    let video = fileEmbed({ "content-type": "video/mp4" });
    let audio = fileEmbed({ "content-type": "audio/mpeg" });
    assert.equal(video.type, "video");
    assert.equal(video.id, "maybe");
    assert.equal(audio.type, "audio");
    assert.equal(audio.id, "maybe");
  });

  it("returns media entry id if provided", () => {
    let video = fileEmbed({
      "content-type": "video/mp4",
      media_entry_id: "42"
    });
    assert.equal(video.id, "42");
  });

  it("returns maybe in place of media entry id if not provided", () => {
    let video = fileEmbed({ "content-type": "video/mp4" });
    assert.equal(video.id, "maybe");
  });

  it("picks scribd if there is a preview_url", () => {
    let scribd = fileEmbed({ preview_url: "some-url" });
    assert.equal(scribd.type, "scribd");
  });

  it("uses content-type to identify images", () => {
    let image = fileEmbed({
      "content-type": "image/png",
      canvadoc_session_url: "some-url"
    });
    assert.equal(image.type, "image");
  });
});

describe("mimeClass", () => {
  it("returns mime_class attribute if present", () => {
    let mime_class = "wooper";
    assert.equal(mimeClass({ mime_class: mime_class }), mime_class);
  });

  it("returns value corresponding to provided `content-type`", () => {
    assert.equal(mimeClass({ "content-type": "video/mp4" }), "video");
  });

  it("returns value corresponding to provided `type`", () => {
    assert.equal(mimeClass({ type: "video/mp4" }), "video");
  });
});
