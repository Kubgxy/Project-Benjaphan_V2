import { Router } from "express";
import { pageUpload } from "../middlewares/pageUpload.middleware";
import {
  updateHomepageContent,
  getHomepageContent,
  updateCheckoutContent,
  getCheckoutContent,
} from "../controllers/setting.controller";
import { verifyAdmin } from "../middlewares/verifyAdmin";
import { verifyToken } from "../middlewares/verifyToken";

const setting = Router();

setting.post(
  "/updateHomepage",
  verifyToken,
  verifyAdmin,
  pageUpload.single("bannerImage"),
  updateHomepageContent
);
setting.get("/getHomepage", getHomepageContent);

setting.post(
  "/updateCheckout",
  verifyToken,
  verifyAdmin,
  pageUpload.single("QrImage"),
  updateCheckoutContent
);
setting.get("/getCheckout", getCheckoutContent);

export default setting;
