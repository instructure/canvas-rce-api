import _auth from "../middleware/auth.js";
import { StatsMiddleware as stats } from "../middleware/stats.js";

import * as announcements from "./announcements.js";
import * as assignments from "./assignments.js";
import * as discussions from "./discussions.js";
import * as documents from "./documents.js";
import * as file from "./file.js";
import * as files from "./files.js";
import { flickrSearch } from "./flickrSearch.js";
import * as folders from "./folders.js";
import * as images from "./images.js";
import * as kaltura from "./kaltura.js";
import * as media_objects from "./mediaObjects.js";
import * as media_tracks from "./mediaTracks.js";
import * as modules from "./modules.js";
import * as quizzes from "./quizzes.js";
import * as rceConfig from "./rceConfig.js";
import { getSessionHandler } from "./session.js";
import * as upload from "./upload.js";
import * as usageRights from "./usageRights.js";
import * as wikiPages from "./wikiPages.js";
import { wrapCanvas } from "./wrapCanvas.js";
import { youTubeTitle } from "./youTubeApi.js";

const statsdKey = stats.actionKeyMiddleware;

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
        wrapCanvas(announcements),
      );
      app.get(
        "/api/assignments",
        statsdKey("api", "assignments"),
        auth,
        wrapCanvas(assignments),
      );
      app.get(
        "/api/discussions",
        statsdKey("api", "discussions"),
        auth,
        wrapCanvas(discussions),
      );
      app.get(
        "/api/modules",
        statsdKey("api", "modules"),
        auth,
        wrapCanvas(modules),
      );
      app.get(
        "/api/quizzes",
        statsdKey("api", "quizzes"),
        auth,
        wrapCanvas(quizzes),
      );
      app.get(
        "/api/rceConfig",
        statsdKey("api", "rceConfig"),
        auth,
        wrapCanvas(rceConfig),
      );
      app.get(
        "/api/wikiPages",
        statsdKey("api", "wikiPages"),
        auth,
        wrapCanvas(wikiPages),
      );
      app.get("/api/files", statsdKey("api", "files"), auth, wrapCanvas(files));
      app.get(
        "/api/files/:folderId",
        statsdKey("api", "files"),
        auth,
        wrapCanvas(files),
      );
      app.get(
        "/api/documents",
        statsdKey("api", "files"),
        auth,
        wrapCanvas(documents),
      );
      app.get(
        "/api/file/:fileId",
        statsdKey("api", "file"),
        auth,
        wrapCanvas(file),
      );
      app.get(
        "/api/folders/:folderId?",
        statsdKey("api", "folders"),
        auth,
        wrapCanvas(folders),
      );
      app.get(
        "/api/images",
        statsdKey("api", "images"),
        auth,
        wrapCanvas(images),
      );
      app.post(
        "/api/upload",
        statsdKey("api", "upload"),
        auth,
        wrapCanvas(upload, { method: "POST" }),
      );
      app.post(
        "/api/usage_rights",
        statsdKey("api", "usage_rights"),
        auth,
        wrapCanvas(usageRights, { method: "PUT" }),
      );
      app.get(
        "/api/flickr_search",
        statsdKey("api", "flickr_search"),
        auth,
        flickrSearch,
      );

      app.get(
        "/api/session",
        statsdKey("api", "session"),
        auth,
        getSessionHandler,
      );
      app.get(
        "/api/youtube_title",
        statsdKey("api", "youtube_title"),
        auth,
        youTubeTitle,
      );
      app.post(
        "/api/v1/services/kaltura_session",
        statsdKey("api", "kaltura_session"),
        auth,
        wrapCanvas(kaltura, { method: "POST" }),
      );
      app.post(
        "/api/media_objects",
        statsdKey("api", "media_objects"),
        auth,
        wrapCanvas(media_objects, { method: "POST" }),
      );
      app.post(
        "/api/media_attachments",
        statsdKey("api", "media_attachments"),
        auth,
        wrapCanvas(media_objects, { method: "POST" }),
      );
      app.get(
        "/api/media_objects",
        statsdKey("api", "media_objects"),
        auth,
        wrapCanvas(media_objects),
      );
      app.put(
        "/api/media_objects/:mediaObjectId",
        statsdKey("api", "media_objects"),
        auth,
        wrapCanvas(media_objects, { method: "PUT" }),
      );
      app.put(
        "/api/media_attachments/:mediaAttachmentId",
        statsdKey("api", "media_attachments"),
        auth,
        wrapCanvas(media_objects, { method: "PUT" }),
      );
      app.get(
        "/api/media_objects/:mediaObjectId/media_tracks",
        statsdKey("api", "media_tracks"),
        auth,
        wrapCanvas(media_tracks),
      );
      app.get(
        "/api/media_attachments/:mediaAttachmentId/media_tracks",
        statsdKey("api", "media_tracks"),
        auth,
        wrapCanvas(media_tracks),
      );
      app.put(
        "/api/media_objects/:mediaObjectId/media_tracks",
        statsdKey("api", "media_tracks"),
        auth,
        wrapCanvas(media_tracks, { method: "PUT" }),
      );
      app.put(
        "/api/media_attachments/:mediaAttachmentId/media_tracks",
        statsdKey("api", "media_tracks"),
        auth,
        wrapCanvas(media_tracks, { method: "PUT" }),
      );
    },
  };
}

export default { inject, init, singleton: true };
