"use strict";

const unirest = require("unirest");

const ytApiBase = "https://content.googleapis.com/youtube/v3/search";
const ytApiQuery = "part=snippet&maxResults=2";

function getYouTubeUrl(vid_id) {
  let key = process.env.YOUTUBE_API_KEY;
  let queryAddendum = `q="${vid_id}"&key=${key}`;
  return `${ytApiBase}?${ytApiQuery}&${queryAddendum}`;
}

function fetchYouTubeTitle(vid_id) {
  let ytApiUrl = getYouTubeUrl(vid_id);
  return new Promise(resolve => {
    unirest.get(ytApiUrl).end(resolve);
  });
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

function youTubeTitle(request, response) {
  let vidId = request.query.vid_id;
  fetchYouTubeTitle(vidId)
    .then(searchResults => {
      if (searchResults.status >= 400) {
        throw searchResults.error;
      }
      let title = parseTitle(vidId, searchResults);
      if (title === undefined) {
        process.stderr.write(
          `YouTube video search not found: vid_id="${vidId}"`
        );
        response.status(500);
        response.send(`Video "${vidId}" not found.`);
      } else {
        response.status(searchResults.status);
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
