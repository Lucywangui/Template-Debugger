import { Router, type IRouter } from "express";
import healthRouter from "./health";
import questionsRouter from "./questions";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/questions", questionsRouter);

export default router;
