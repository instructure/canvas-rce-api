"use strict";

const { actionKeyMiddleware: statsdKey } = require("../middleware/stats");
const _auth = require("../middleware/auth");
const wrapCanvas = require("./wrapCanvas");
const flickrSearch = require("./flickrSearch");
const UnsplashController = require("./unsplash");
const getSessionHandler = require("./session");
const announcements = require("./announcements");
const assignments = require("./assignments");
const discussions = require("./discussions");
const modules = require("./modules");
const quizzes = require("./quizzes");
const rceConfig = require("./rceConfig");
const wikiPages = require("./wikiPages");
const kaltura = require("./kaltura");
const media_objects = require("./mediaObjects");
const media_tracks = require("./mediaTracks");
const file = require("./file");
const files = require("./files");
const folders = require("./folders");
const images = require("./images");
const usageRights = require("./usageRights");
const upload = require("./upload");
const youTubeTitle = require("./youTubeApi");
const documents = require("./documents");

function inject() {
  return [_auth, UnsplashController];
}

function init(auth, unsplashController) {
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
        "/api/rceConfig",
        statsdKey("api", "rceConfig"),
        auth,
        wrapCanvas(rceConfig)
      );
      app.get(
        "/api/wikiPages",
        statsdKey("api", "wikiPages"),
        auth,
        wrapCanvas(wikiPages)
      );
      app.get("/api/files", statsdKey("api", "files"), auth, wrapCanvas(files));
      app.get(
        "/api/files/:folderId",
        statsdKey("api", "files"),
        auth,
        wrapCanvas(files)
      );
      app.get(
        "/api/documents",
        statsdKey("api", "files"),
        auth,
        wrapCanvas(documents)
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
        "/api/unsplash/search",
        statsdKey("api", "unsplash_search"),
        auth,
        unsplashController.search.bind(unsplashController)
      );
      app.get(
        "/api/unsplash/pingback",
        statsdKey("api", "unsplash_pingback"),
        auth,
        unsplashController.pingback.bind(unsplashController)
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
      app.post(
        "/api/v1/services/kaltura_session",
        statsdKey("api", "kaltura_session"),
        auth,
        wrapCanvas(kaltura, { method: "POST" })
      );
      app.post(
        "/api/media_objects",
        statsdKey("api", "media_objects"),
        auth,
        wrapCanvas(media_objects, { method: "POST" })
      );
      app.get(
        "/api/media_objects",
        statsdKey("api", "media_objects"),
        auth,
        wrapCanvas(media_objects)
      );
      app.put(
        "/api/media_objects/:mediaObjectId",
        statsdKey("api", "media_objects"),
        auth,
        wrapCanvas(media_objects, { method: "PUT" })
      );
      app.get(
        "/api/media_objects/:mediaObjectId/media_tracks",
        statsdKey("api", "media_tracks"),
        auth,
        wrapCanvas(media_tracks)
      ),
        app.put(
          "/api/media_objects/:mediaObjectId/media_tracks",
          statsdKey("api", "media_tracks"),
          auth,
          wrapCanvas(media_tracks, { method: "PUT" })
        );
    }
  };
}

module.exports = { inject, init, singleton: true };
