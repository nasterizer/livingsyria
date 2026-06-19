import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import storageRouter from "./storage";
import categoriesRouter from "./categories";
import listingsRouter from "./listings";
import messagesRouter from "./messages";
import newsRouter from "./news";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(storageRouter);
router.use(categoriesRouter);
router.use(listingsRouter);
router.use(messagesRouter);
router.use(newsRouter);
router.use(adminRouter);

export default router;
