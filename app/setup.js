import { middleware as withMiddleware } from "./middleware.js";
import appRoutes from "./routes.js";

function setup(app) {
  withMiddleware(app, (wrappedApp) => {
    appRoutes(wrappedApp);
  });
}

export { setup };
