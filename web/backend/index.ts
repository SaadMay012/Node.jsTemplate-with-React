// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";

import shopify from "./shopify";

// Import Webhooks
import GDPRWebhookHandlers from "./webhooks/gdpr";
import addUninstallWebhookHandler from "./webhooks/uninstall";

// Import Routes
import mountRoutes, { mountUnAuthenticatedRoutes } from "./routes";

const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT || "8081", 10);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/../frontend/dist`
    : `${process.cwd()}/../frontend/`;

const app = express();

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);

// Set up Shopify webhooks
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: GDPRWebhookHandlers })
);
await addUninstallWebhookHandler();

// Unauthenticated routes
app.use(express.json());
mountUnAuthenticatedRoutes(app);

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Authenticated routes
mountRoutes(app);

app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.listen(PORT);
console.log(`App running on port: ${PORT} ...`);
