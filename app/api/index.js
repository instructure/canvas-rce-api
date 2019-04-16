"use strict";

const { actionKeyMiddleware: statsdKey } = require("../middleware/stats");
const _auth = require("../middleware/auth");
const wrapCanvas = require("./wrapCanvas");
const flickrSearch = require("./flickrSearch");
const getSessionHandler = require("./session");
const announcements = require("./announcements");
const assignments = require("./assignments");
const discussions = require("./discussions");
const modules = require("./modules");
const quizzes = require("./quizzes");
const wikiPages = require("./wikiPages");
const file = require("./file");
const files = require("./files");
const folders = require("./folders");
const images = require("./images");
const usageRights = require("./usageRights");
const upload = require("./upload");
const youTubeTitle = require("./youTubeApi");

function inject() {
  return [_auth];
}

function init(auth) {
  return {
    applyToApp(app) {
      app.get(
        "/api/announcements",
        statsdKey("api", "announcements"),
        auth,
        wrapCanvas(announcements)
      );
      app.get(
        "/api/assignments",
        statsdKey("api", "assignments"),
        auth,
        wrapCanvas(assignments)
      );
      app.get(
        "/api/discussions",
        statsdKey("api", "discussions"),
        auth,
        wrapCanvas(discussions)
      );
      app.get(
        "/api/modules",
        statsdKey("api", "modules"),
        auth,
        wrapCanvas(modules)
      );
      app.get(
        "/api/quizzes",
        statsdKey("api", "quizzes"),
        auth,
        wrapCanvas(quizzes)
      );
      app.get(
        "/api/wikiPages",
        statsdKey("api", "wikiPages"),
        auth,
        wrapCanvas(wikiPages)
      );
      app.get(
        "/api/files/:folderId",
        statsdKey("api", "files"),
        auth,
        wrapCanvas(files)
      );
      app.get(
        "/api/files/:folderId",
        statsdKey("api", "files"),
        auth,
        wrapCanvas(files)
      );
      app.get(
        "/api/file/:fileId",
        statsdKey("api", "file"),
        auth,
        wrapCanvas(file)
      );
      app.get(
        "/api/folders/:folderId?",
        statsdKey("api", "folders"),
        auth,
        wrapCanvas(folders)
      );
      app.get(
        "/api/images",
        statsdKey("api", "images"),
        auth,
        wrapCanvas(images)
      );
      app.post(
        "/api/upload",
        statsdKey("api", "upload"),
        auth,
        wrapCanvas(upload, { method: "POST" })
      );
      app.post(
        "/api/usage_rights",
        statsdKey("api", "usage_rights"),
        auth,
        wrapCanvas(usageRights, { method: "PUT" })
      );
      app.get(
        "/api/flickr_search",
        statsdKey("api", "flickr_search"),
        auth,
        flickrSearch
      );
      app.get(
        "/api/session",
        statsdKey("api", "session"),
        auth,
        getSessionHandler
      );
      app.get(
        "/api/youtube_title",
        statsdKey("api", "youtube_title"),
        auth,
        youTubeTitle
      );
    }
  };
}

module.exports = { inject, init, singleton: true };
