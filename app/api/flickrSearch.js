"use strict";

const { parseFetchResponse } = require("../utils/fetch");

const flickrBase = "https://api.flickr.com/services/rest";
// extras=needs_interstitial is required to get undocumented needs_interstitial
// photo property in the results
const flickrQuery =
  "method=flickr.photos.search&format=json&sort=relevance&license=1,2,3,4,5,6&per_page=15&nojsoncallback=1&extras=needs_interstitial";

function getFlickrResults(searchTerm) {
  const flickrKey = process.env.FLICKR_API_KEY;
  const encodedTerm = encodeURIComponent(searchTerm);
  const queryAddendum = `api_key=${flickrKey}&text=${encodedTerm}`;
  const url = `${flickrBase}?${flickrQuery}&${queryAddendum}`;
  return global.fetch(url).then(parseFetchResponse);
}

function transformSearchResults(results) {
  return (
    results.body.photos.photo
      // needs_interstitial is an undcoumented parameter of the photo object.
      // it seems to be reliable at identifying nsfw rsults where safe and the
      // safe_search filter are not. this should be the first thing to check if
      // nsfw results come through in the future.
      .filter(photo => photo.needs_interstitial != 1)
      .map(photo => {
        const url = `https://farm${photo.farm}.static.flickr.com/${photo.server}/${photo.id}_${photo.secret}.jpg`;
        const link = `https://www.flickr.com/photos/${photo.owner}/${photo.id}`;
        return {
          id: photo.id,
          title: photo.title,
          href: url,
          link: link
        };
      })
  );
}

// get results from Flickr API
async function flickrSearch(req, response) {
  const searchTerm = req.query.term;
  try {
    const searchResults = await getFlickrResults(searchTerm);
    const images = transformSearchResults(searchResults);
    response.status(searchResults.statusCode);
    response.send(images);
  } catch (e) {
    // TODO: better error handling
    process.stderr.write("Flickr Search Failed");
    process.stderr.write("" + e);
    response.status(500);
    response.send("Internal Error, see server logs");
  }
}

module.exports = flickrSearch;
