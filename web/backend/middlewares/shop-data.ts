import type { Session, HttpResponseError } from "@shopify/shopify-api";
import type { Express, Request, Response, NextFunction } from "express";
import type { ShopDataResponse } from "../../@types/shop";
import mixpanel from "../helpers/mixpanel";
import shops from "../prisma/db/shops";
import shopify from "../shopify";

const GET_SHOP_DATA = `{
  shop {
    id
    name
    ianaTimezone
    email
    url
    currencyCode
    primaryDomain {
      url
      sslEnabled
    }
    plan {
      displayName
      partnerDevelopment
      shopifyPlus
    }
    billingAddress {
      address1
      address2
      formatted
      company
      city
      country
      zip
      phone
    }
  }
}`;

export default function updateShopDataMiddleware(app: Express) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { session } = res.locals.shopify;

    // update db and mark shop as active
    await updateShopData(app, session);

    return next();
  }
}

async function updateShopData(app: Express, session: Session) {
  const existingShop = await shops.getShop(session.shop);
  const betaShops: string[] = [];

  let fetchShopData = true;

  if(!existingShop) {
    await shops.createShop({
      shop: session.shop,
      scopes: session.scope,
      isInstalled: true,
      installedAt: new Date(),
      uninstalledAt: null,
      installCount: 1,
      showOnboarding: true,
      settings: { beta: betaShops.includes(session.shop) ? true : false },
    });

    // Track install event
    mixpanel.track("App Install", {
      shop: session.shop,
      distinct_id: session.shop,
      installCount: 1,
    });
  } else {
    if (existingShop.shopData) {
      fetchShopData = false;
    }

    if (!existingShop.isInstalled) {
      // This is a REINSTALL
      await shops.updateShop({
        shop: session.shop,
        scopes: session.scope,
        isInstalled: true,
        installedAt: new Date(),
        uninstalledAt: null,
        installCount: existingShop.installCount + 1,
        showOnboarding: true,
        // settings: { beta: betaUsers.includes(shop) ? true : false },
        subscription: {
          update: {
            active: true,
            plan: "TRIAL",
            createdAt: new Date(),
            upgradedAt: null,
            currentPeriodEnd: null,
            chargeId: null,
          },
        },
      });

      // Track reinstall event
      mixpanel.track("App ReInstall", {
        shop: session.shop,
        distinct_id: session.shop,
        installCount: existingShop.installCount + 1,
      });
    }
  }

  if(fetchShopData) {
    try {
      const client = new shopify.api.clients.Graphql({ session });

      // Track reauth event
      mixpanel.track("App ReAuth", {
        shop: session.shop,
        distinct_id: session.shop,
      });

      const res = await client.query<ShopDataResponse>({ data: GET_SHOP_DATA });

      if (!res?.body?.data?.shop) {
        console.warn(`Missing shop data on ${session.shop}`);
      } else {
        const shopData = res.body.data.shop;
        console.log("Got shops data", shopData);

        await shops.updateShop({
          shop: session.shop,
          shopifyShopData: {
            upsert: {
              create: shopData,
              update: shopData,
            },
          },
        });
      }
    } catch(error) {
      console.log("Failed to fetch shop data:", error);
      console.log("Error Response:", (error as HttpResponseError).response);
    }
  }
}