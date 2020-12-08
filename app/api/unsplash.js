"use strict";

const toJson = require("unsplash-js").toJson;
const _unsplash = require("../services/unsplash");
const _env = require("../env");

class UnsplashController {
  static inject() {
    return [_unsplash, _env];
  }

  static init(unsplash, env) {
    return new UnsplashController(unsplash, env);
  }

  constructor(unsplash, env) {
    this.unsplash = unsplash;
    this.env = env;
  }

  transformSearchResults(results) {
    const transformedResults = {
      total_results: results.total,
      total_pages: results.total_pages,
      results: results.results.map(imageResult => ({
        urls: {
          link: imageResult.urls.regular,
          thumbnail: imageResult.urls.thumb
        },
        id: imageResult.id,
        alt_text: imageResult.alt_description,
        user: {
          name: imageResult.user.name,
          avatar: imageResult.user.profile_image.small,
          url: `${imageResult.user.links.html}?utm_source=${this.env.get(
            "UNSPLASH_APP_NAME",
            () => "canvas-rce-api-dev"
          )}&utm_medium=referral`
        }
      }))
    };
    return transformedResults;
  }

  async search(req, res) {
    const searchTerm = req.query.term;
    const page = req.query.page || undefined; // Unsplash defaults to page 1
    const perPage = req.query.per_page || undefined; // Unsplash defaults to 10
    try {
      const searchResults = await this.unsplash.search.photos(
        searchTerm,
        page,
        perPage,
        {
          contentFilter: "high"
        }
      );
      const jsonified = await toJson(searchResults);
      res.send(this.transformSearchResults(jsonified));
    } catch (e) {
      // TODO: better error handling
      process.stderr.write("Unsplash Search Failed");
      process.stderr.write("" + e);
      res.status(500).send("Internal Error, see server logs");
    }
  }

  async pingback(req, res) {
    const imageId = req.query.id;
    // Doing this manually rather than using the Unsplash SDK saves us
    // an extra request since the SDK requires doing an initial get request
    // prior to then doing a "download" request.
    try {
      await global.fetch(
        `https://api.unsplash.com/photos/${imageId}/download`,
        {
          headers: {
            Authorization: `Client-ID ${this.env.get(
              "UNSPLASH_APP_ID",
              () => "fake_app_id"
            )}`
          }
        }
      );
      // The Unsplash API gives back an image URL, but it's unnecessary so
      // we just send back an OK response with no body to save a few bytes
      // across the wire.
      res.status(200).send();
    } catch (e) {
      // TODO: better error handling
      process.stderr.write("Unsplash Pingback (Download) Failed");
      process.stderr.write("" + e);
      res.status(500).send("Internal Error, see server logs");
    }
  }
}

module.exports = UnsplashController;
