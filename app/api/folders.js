"use strict";

const packageBookmark = require("./packageBookmark");

function transformBody(baseUrl, folders) {
  if (!Array.isArray(folders)) {
    folders = [folders];
  }
  return folders.map(folder => {
    return {
      id: folder.id,
      parentId: folder.parent_folder_id,
      name: folder.name,
      filesUrl: `${baseUrl}/files/${folder.id}`,
      foldersUrl: `${baseUrl}/folders/${folder.id}`,
      lockedForUser: folder.locked_for_user,
      contextType: folder.context_type,
      contextId: folder.context_id,
      canUpload: folder.can_upload
    };
  });
}

function canvasPath(request) {
  const id = request.params.folderId;
  /*
   ** This logic ensures that backwards compatibility is maintained until canvas no longer uses this URL
   ** with buttons_and_icons
   ** It should be safe to delete the buttons_and_icons-related (isIconMaker) logic after canvas release/2022-05-25.XXX is in production
   */
  const idButtonsAndIcons = "buttons_and_icons";
  const idIconMaker = "icon_maker";
  const isIconMaker = id === idIconMaker || id === idButtonsAndIcons;
  if (id && id !== "all" && !isIconMaker && id !== "media") {
    return `/api/v1/folders/${request.params.folderId}/folders?per_page=${request.query.per_page}`;
  }
  const byPath = id === "all" ? "" : "/by_path";
  switch (request.query.contextType) {
    case "course":
      if (isIconMaker) {
        return `/api/v1/courses/${request.query.contextId}/folders/${id}`;
      }
      if (id === "media") {
        return `/api/v1/courses/${request.query.contextId}/folders/media`;
      }
      return `/api/v1/courses/${request.query.contextId}/folders${byPath}?per_page=${request.query.per_page}`;
    case "group":
      if (id === "media") {
        return `/api/v1/groups/${request.query.contextId}/folders/media`;
      }
      return `/api/v1/groups/${request.query.contextId}/folders${byPath}?per_page=${request.query.per_page}`;
    case "user":
      if (id === "media") {
        return `/api/v1/users/${request.query.contextId}/folders/media`;
      }
      return `/api/v1/users/${request.query.contextId}/folders${byPath}?per_page=${request.query.per_page}`;
    default:
      throw new Error(`invalid contextType (${request.query.contextType})`);
  }
}

function canvasResponseHandler(request, response, canvasResponse) {
  response.status(canvasResponse.statusCode);
  if (canvasResponse.statusCode === 200) {
    const folders = canvasResponse.body;
    const protocol = request.get("X-Forwarded-Proto") || request.protocol;
    const baseUrl = `${protocol}://${request.get("host")}/api`;
    response.send({
      folders: transformBody(baseUrl, folders),
      bookmark: packageBookmark(request, canvasResponse.bookmark)
    });
  } else {
    response.send(canvasResponse.body);
  }
}

module.exports = { transformBody, canvasPath, canvasResponseHandler };
