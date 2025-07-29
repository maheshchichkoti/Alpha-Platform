import { Router } from "express";
import { peopleRouter } from "./people.routes";
import { enrichRouter } from "./enrich.routes";
import { progressRouter } from "./progress.routes";
import { companyRouter } from "./company.routes";
import { healthzRouter } from "./healthz.routes";

export const apiRouter = Router();

apiRouter.use("/people", peopleRouter);
apiRouter.use("/enrich", enrichRouter);
apiRouter.use("/progress", progressRouter);
apiRouter.use("/company", companyRouter);
apiRouter.use("/healthz", healthzRouter);
