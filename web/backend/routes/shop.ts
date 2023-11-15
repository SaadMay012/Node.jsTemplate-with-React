import express from "express";
import {
    getShopData,
} from "../controllers/shop";

const router = express.Router();

router.get("/name", getShopData);

export default router;
