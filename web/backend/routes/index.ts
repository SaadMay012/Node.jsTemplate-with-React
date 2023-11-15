import type { Express } from "express";


import billingRoutes, { billingUnauthenticatedRoutes } from "./billing";
import shopRoutes from "./shop"

function mountRoutes(app: Express) {
  app.use("/api/billing", billingRoutes);

  app.use("/api/shop", shopRoutes);
}

export function mountUnAuthenticatedRoutes(app: Express) {
  app.use("/api/billing", billingUnauthenticatedRoutes);
}

export default mountRoutes;