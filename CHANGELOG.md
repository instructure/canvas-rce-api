# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.27]

Upgrade to Node 18

## [1.26]

Update mime types for files
Add media_attachment urls to api

## [1.25]

Remove unsplash code

## [1.24]

Fix malformed URI error for search

## [1.23]

Response for files list includes file category

## [1.21]

Rename Buttons & Icon text to Icon Maker

## [1.20]

### Added

- Responses from the documents API now include the file's media_entry_id. This ID corresponds to a Canvas MediaObject.
- The files API now accepts query params that communicate to Canvas the "replaced by" chain context

## [1.19]

### Added

- A changelog to make changes more clear

### Changed

- The canvas-rce-api Docker image now uses Node 16 and NPM 8
