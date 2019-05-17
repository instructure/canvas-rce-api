"use strict";

const UnsplashController = require("../../../app/api/unsplash");
const sinon = require("sinon");
const assert = require("assert");
const nock = require("nock");

describe("Unsplash", () => {
  let unsplashController;
  let fakeUnsplash;
  beforeEach(() => {
    fakeUnsplash = {
      search: {
        photos() {
          return Promise.resolve({
            ok: true,
            json: () => ({
              total: 2285,
              total_pages: 2285,
              results: [
                {
                  id: "nKC772R_qog",
                  created_at: "2018-06-23T14:40:01-04:00",
                  updated_at: "2019-06-07T01:05:38-04:00",
                  width: 2853,
                  height: 3803,
                  color: "#060807",
                  description:
                    "little cat, \r\nThank you all who downloaded this lovely cat for the likes",
                  alt_description: "brown tabby kitten sitting on floor",
                  urls: {
                    raw:
                      "https://images.unsplash.com/photo-1529778873920-4da4926a72c2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjY4MTA0fQ",
                    full:
                      "https://images.unsplash.com/photo-1529778873920-4da4926a72c2?ixlib=rb-1.2.1&q=85&fm=jpg&crop=entropy&cs=srgb&ixid=eyJhcHBfaWQiOjY4MTA0fQ",
                    regular:
                      "https://images.unsplash.com/photo-1529778873920-4da4926a72c2?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjY4MTA0fQ",
                    small:
                      "https://images.unsplash.com/photo-1529778873920-4da4926a72c2?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjY4MTA0fQ",
                    thumb:
                      "https://images.unsplash.com/photo-1529778873920-4da4926a72c2?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&fit=max&ixid=eyJhcHBfaWQiOjY4MTA0fQ"
                  },
                  links: {
                    self: "https://api.unsplash.com/photos/nKC772R_qog",
                    html: "https://unsplash.com/photos/nKC772R_qog",
                    download:
                      "https://unsplash.com/photos/nKC772R_qog/download",
                    download_location:
                      "https://api.unsplash.com/photos/nKC772R_qog/download"
                  },
                  categories: [],
                  sponsored: false,
                  sponsored_by: null,
                  sponsored_impressions_id: null,
                  likes: 112,
                  liked_by_user: false,
                  current_user_collections: [],
                  user: {
                    id: "oL6UyT-6pwA",
                    updated_at: "2019-06-06T03:12:06-04:00",
                    username: "edgaredgar",
                    name: "Edgar Edgar",
                    first_name: "Edgar",
                    last_name: "Edgar",
                    twitter_username: null,
                    portfolio_url: null,
                    bio: null,
                    location: null,
                    links: {
                      self: "https://api.unsplash.com/users/edgaredgar",
                      html: "https://unsplash.com/@edgaredgar",
                      photos:
                        "https://api.unsplash.com/users/edgaredgar/photos",
                      likes: "https://api.unsplash.com/users/edgaredgar/likes",
                      portfolio:
                        "https://api.unsplash.com/users/edgaredgar/portfolio",
                      following:
                        "https://api.unsplash.com/users/edgaredgar/following",
                      followers:
                        "https://api.unsplash.com/users/edgaredgar/followers"
                    },
                    profile_image: {
                      small:
                        "https://images.unsplash.com/profile-1530270598334-93244e0a01a0?ixlib=rb-1.2.1&q=80&fm=jpg&crop=faces&cs=tinysrgb&fit=crop&h=32&w=32",
                      medium:
                        "https://images.unsplash.com/profile-1530270598334-93244e0a01a0?ixlib=rb-1.2.1&q=80&fm=jpg&crop=faces&cs=tinysrgb&fit=crop&h=64&w=64",
                      large:
                        "https://images.unsplash.com/profile-1530270598334-93244e0a01a0?ixlib=rb-1.2.1&q=80&fm=jpg&crop=faces&cs=tinysrgb&fit=crop&h=128&w=128"
                    },
                    instagram_username: null,
                    total_collections: 0,
                    total_likes: 9,
                    total_photos: 3,
                    accepted_tos: true
                  }
                }
              ]
            })
          });
        }
      }
    };
    const fakeEnv = {
      get: envVar => envVar === "UNSPLASH_APP_ID" && "fake_app_id"
    };
    unsplashController = UnsplashController.init(fakeUnsplash, fakeEnv);
  });

  describe("search", () => {
    it("returns appropriately formatted data from the unsplash api", async () => {
      const fakeRequest = {
        query: { term: "some cool image" }
      };
      const fakeResponse = {
        send: sinon.spy(),
        status: sinon.stub().returnsThis()
      };

      await unsplashController.search(fakeRequest, fakeResponse);

      assert.ok(
        fakeResponse.send.calledWith({
          total_results: 2285,
          total_pages: 2285,
          results: [
            {
              urls: {
                link:
                  "https://images.unsplash.com/photo-1529778873920-4da4926a72c2?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjY4MTA0fQ",
                thumbnail:
                  "https://images.unsplash.com/photo-1529778873920-4da4926a72c2?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&fit=max&ixid=eyJhcHBfaWQiOjY4MTA0fQ"
              },
              id: "nKC772R_qog",
              alt_text: "brown tabby kitten sitting on floor",
              user: {
                name: "Edgar Edgar",
                avatar:
                  "https://images.unsplash.com/profile-1530270598334-93244e0a01a0?ixlib=rb-1.2.1&q=80&fm=jpg&crop=faces&cs=tinysrgb&fit=crop&h=32&w=32"
              }
            }
          ]
        })
      );
    });
  });

  describe("pingback", () => {
    it("calls the unsplash API download url with the proper id when called", async () => {
      const scope = nock("https://api.unsplash.com")
        .get("/photos/123/download")
        .reply(200, "success");
      const fakeRequest = {
        query: {
          id: 123
        }
      };
      const fakeResponse = {
        status: sinon.stub().returnsThis(),
        send: sinon.spy()
      };
      await unsplashController.pingback(fakeRequest, fakeResponse);
      assert.ok(scope.isDone(), "request was properly made to unsplash");
      assert.ok(
        fakeResponse.status.calledWith(200),
        "request sends back 200 status code"
      );
    });
  });
});
