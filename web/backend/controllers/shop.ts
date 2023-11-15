import { type Request, type Response } from "express";
import shops from "../prisma/db/shops";
export const getShopData = async (req: Request, res: Response) => {
  try {
    const session = res.locals.shopify.session;
    const shopsData: any = await shops.getShop(session.shop as string);
    res.status(200).send({
      shopsData,
    });
  } catch (err) {
    throw new Error(` Failed to get Shop Data : ${err}`);
  }
};
