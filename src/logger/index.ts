import { pushLogToDb } from "../database/services/logger";
import { formatLogs } from "../generators";

/**
 * Formats the log for console print and pushes the logs to database
 * @param isError error ?
 * @param code error code
 * @param user who raises it
 * @param message log message
 */
export const log = (isError: boolean, code: string, user: string = "system", message: string= "") => {
    if (isError) {
        console.error(formatLogs(user, code, message));
    } else {
        console.log(formatLogs(user, code, message));
    }
    pushLogToDb(isError, code.toString(), user.toString(), message.toString());
};

export const DatabaseLogCodes = {
    AUTHENTICATE: "database/authenticate",
    SYNC: "database/sync",
};
