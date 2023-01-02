import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import helmet from "helmet";
import { AddressInfo } from "net";

import "./database";
import "./firebase";
import { formatLogs } from "./generators";
import { log } from "./logger";
import "./messaging/mailer";
import authorizationMiddleware from "./middlewares/authorization";
import { errorHandler } from "./middlewares/errorHandler";
import generalFeePaidCheck from "./middlewares/generalFeePaymentCheck";
import profileCompletionCheck from "./middlewares/isProfileCompleted";
import crossOriginMiddleware from './middlewares/crossOrigin';
import authorizationRoutes from "./routes/authentication";
import eventRoutes, { unAuthenticatedReqs as unAuthEventReqsRouter } from "./routes/event";
import paymentRoutes, {unAuthenticatedReqs as unAuthPaymentReqs} from "./routes/payments";
import profileRoutes from "./routes/profile";
import workshopRoutes, { unAuthenticatedReqs as unAuthWorkshopReqsRouter } from "./routes/workshop";

const app = express();

/** Template engine */
app.set('view engine', 'ejs');

/** Global middleware for security and data parsing */
app.use(crossOriginMiddleware);
app.use(helmet());
app.use(bodyParser.text({limit: '3MB'}));
app.use(bodyParser.json({limit: '3MB'}));
/** ------------------------------------------------------- */


/**    All the below request do not need any authorization */
app.use("/auth", authorizationRoutes());
app.use("/event", unAuthEventReqsRouter());
app.use("/workshop", unAuthWorkshopReqsRouter());
app.use("/payment", unAuthPaymentReqs());

/** ------------------------------------------------------- */


/**    All the below request needs any authorization and kriyaId, general payment status to be set before reaching the services */
app.use("/profile", authorizationMiddleware, profileRoutes());
app.use("/event", authorizationMiddleware, profileCompletionCheck, generalFeePaidCheck, eventRoutes());
app.use("/workshop", authorizationMiddleware, profileCompletionCheck, generalFeePaidCheck, workshopRoutes());
app.use("/payment", authorizationMiddleware, profileCompletionCheck, paymentRoutes());
/** ------------------------------------------------------- */

// Validation error handler
app.use(errorHandler);

// Default fall back listener
app.use((req, res) => { res.sendStatus(405); });

// Initialize express server
const serverPort = process.env.PORT || 3003;
const server = app.listen(serverPort, () => {
    const { port, address }: AddressInfo = server.address() as AddressInfo;
    log(false, "server/initialize", "system", `Server initialized at ${address}:${port}`);
});

// Global catch for rejected promisses
process.on("unhandledRejection", (reason) => {
    console.log(formatLogs("system", "critical/unhandled-rejections"));
    console.log(reason);
});

process.on("uncaughtException", (reason) => {
    console.log(formatLogs("system", "critical/uncaught-exception"));
    console.log(reason);
});
