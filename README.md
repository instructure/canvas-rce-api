# Canvas RCE API

Canvas RCE API is a service that proxies all API requests needed for the Canvas
rich content editor and sidebar. Requests are authenticated via a JWT generated
by Canvas.

In the future running the Canvas RCE API service will be required for full
functionality of the rich content editor in Canvas.

## Running in Production

Canvas RCE API is a Node.js application. It can either be run with node directly
or in a Docker container. In either case be sure to properly configure the
application via environment variables and to have a web server or load balancer
in front of the application to terminate TLS connections. The application does
not handle `https` requests directly.

### Node.js

The application can be run directly with Node.js by either running `npm start`
or `node app.js`. It is designed to work with the current Node.js LTS (16.x)
release. Be sure to run `npm install --production` first to install all of the
package dependencies.

A Node.js process only runs on a single thread. To take full advantage of multiple
CPU cores on your application server, it is recommended that you use something
to manage and balance load between node processes such as [Passenger][1] or
[PM2][2].

### Docker

A Docker image is available on Docker Hub at `instructure/canvas-rce-api:latest`
or Starlord at `starlord.inscloudgate.net/jenkins/canvas-rce-api:latest`. The
container will run the application behind Nginx with Passenger listening on port
`80`. Please refer to the documentation for the [`instructure/node-passenger` base image][7]
for nginx and passenger configuration environment variables.

#### Example

```bash
docker run \
  -e ECOSYSTEM_KEY \
  -e ECOSYSTEM_SECRET \
  -e FLICKR_API_KEY \
  -e YOUTUBE_API_KEY \
  -e STATSD_PORT=8125 \
  -e STATSD_HOST=127.0.0.1 \
  instructure/canvas-rce-api
```

### TLS

To ensure that credentials and payloads are encrypted over the wire, `https`
should be used. `https` requests are not directly supported by the application.
Be sure to have a TLS termination proxy in front of the application. This can be
done with a load balancer such as [HAProxy][3] or [Amazon ELB/ALB][4]. It
can also be done with [Apache][5] or [Nginx][6] running on the same server if
you are only running a single server.

### Configuration

Configuration options are set via the following environment variables:

- `ECOSYSTEM_KEY`: _Required_ The encryption secret shared with Canvas.
- `ECOSYSTEM_SECRET`: _Required_ The signing secret shared with Canvas.
- `FLICKR_API_KEY`: Required to support Flickr image search.
- `YOUTUBE_API_KEY`: Required for querying titles of YouTube embeds.
- `NODE_ENV`: This should always be set to `production` when running in
  production.
- `PORT`: Defaults to port `3000`. This is not used when running with Docker
  since Node Passenger monkey patches node `http` to control the port each
  node process is listening on.
- `STATSD_HOST`: If you would like to collect metrics with statsd, this should
  be set to the host of your statsd server.
- `STATSD_PORT`: If you would like to collect metrics with statsd, this should
  be set to the port of your statsd server.

### Canvas

Canvas needs to be configured with the same secrets used to encrypt and sign the
JWTs used for authentication. If you are running Consul to manage dynamic
settings, the secrets and host should be added at the same paths as shown in the
`dynamic_settings.yml` example below. A `dynamic_settings.yml` file may be used
in place of managing configuration through Consul.

#### `dynamic_settings.yml`

```yml
production:
  config:
    canvas:
      canvas:
        encryption-secret: "astringthatisactually32byteslong"
        signing-secret: "astringthatisactually32byteslong"
      rich-content-service:
        app-host: "canvas-rce-api-host"
```

## Developing

### Dependencies

The only dependency needed to develop `canvas-rce-api` is a recent LTS release
of Node.js (16.x). All other dependencies are installed via `npm`. Alternatively
if you don't want to install Node.js on your machine you can run in `docker`
using the included `docker-compose` file.

### Configuration

Make a copy of the example `.env` file. Environment variables defined in this
file will be available when running the application. See the previous section
for configuring Canvas to setup a local Canvas environment to test with.

```
cp .env.example .env
```

Additionally, make a copy of the `docker-compose.override.yml.dev` file with
the following command:

```
cp docker-compose.override.yml.dev docker-compose.override.yml
```

### Serve the application

```
npm install
npm run start:dev # will automatically restart the app when you make changes
```

or can build docker locally:

```
docker-compose build
docker-compose up
```

Docker requires canvas to use rce.docker as the app-host in instead of whatever is being used by localhost.

### Formatting Code

This project uses `prettier` to automatically format source code. Code will be
automatically formatted via a `pre-commit` hook, but it is reccomended that you
configure your editor to format on save if possible.

### Linting

This project uses `eslint` to catch non-stylistic code issues. Linting errors
will cause the build to fail, so it is recommended that you configure your
editor to report `eslint` errors.

### Testing

All tests live under the top level `test` directory and have a `*.test.js`
filename. Tests are written using `mocha` and the standard `assert` package.
Sinon is availble for stubbing dependencies, but prefer injecting dependencies
over stubbing shared bindings where possible.

To run all tests, do `yarn test`

Example of running a single test file:

```
yarn test:one test/service/api/folders.test.js
```

### Releasing

For now releasing to NPM is a manual process.

We use a post-merge Jenkins job to auto-publish `:latest` Docker images to
Dockerhub and our internal registry, Starlord.

When preparing a release, make sure to tag the release commit with the `v1.2.3`
semantic release tagging convention. For example:

```bash
git tag "v1.2.3"
git push --tags origin
```

_Important: without the `v` in the git tag, the post-merge Jenkins job won't
publish a version-specific Docker image._

## License

This project is is released under the [MIT](LICENSE) license.

[1]: https://www.phusionpassenger.com/library/walkthroughs/basics/nodejs/
[2]: https://pm2.keymetrics.io/
[3]: https://www.haproxy.org/
[4]: https://aws.amazon.com/elasticloadbalancing/
[5]: https://httpd.apache.org/
[6]: https://www.nginx.com/
[7]: https://github.com/instructure/dockerfiles/blob/master/node-passenger/README.md
