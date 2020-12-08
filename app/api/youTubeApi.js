"use strict";

const { parseFetchResponse } = require("../utils/fetch");

const ytApiBase = "https://content.googleapis.com/youtube/v3/search";
const ytApiQuery = "part=snippet&maxResults=2";

function getYouTubeUrl(vid_id) {
  let key = process.env.YOUTUBE_API_KEY;
  let queryAddendum = `q="${vid_id}"&key=${key}`;
  return `${ytApiBase}?${ytApiQuery}&${queryAddendum}`;
}

function fetchYouTubeTitle(vid_id) {
  const url = getYouTubeUrl(vid_id);
  return global.fetch(url).then(parseFetchResponse);
}

function parseTitle(vidId, results) {
  let vidTitle;
  results.body.items.forEach(vid => {
    if (vid.id.videoId === vidId) {
      vidTitle = vid.snippet.title;
    }
  });
  return vidTitle;
}

function youTubeTitle(req, response) {
  let vidId = req.query.vid_id;
  fetchYouTubeTitle(vidId)
    .then(searchResults => {
      if (searchResults.statusCode >= 400) {
        const err = new Error("YouTube search failed");
        err.body = searchResults.body;
        throw err;
      }
      let title = parseTitle(vidId, searchResults);
      if (title === undefined) {
        process.stderr.write(
          `YouTube video search not found: vid_id="${vidId}"`
        );
        response.status(500);
        response.send(`Video "${vidId}" not found.`);
      } else {
        response.status(searchResults.statusCode);
        response.json({ id: vidId, title: title });
      }
    })
    .catch(e => {
      process.stderr.write("YouTube Search Failed");
      process.stderr.write("" + e);
      process.stderr.write(getYouTubeUrl(vidId));
      response.status(500);
      response.send("Internal Error, see server logs");
    });
}

module.exports = youTubeTitle;
