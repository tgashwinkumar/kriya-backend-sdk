import { Log } from "..";
import { formatLogs } from "../../generators";

/**
 * Pushes logs to database
 * @param isError Is the log an error ?
 * @param code error code
 * @param user who raised it
 * @param message Log message
 */
export const pushLogToDb = (isError: boolean, code: string, user: string = "system", message?: string) => {
    Log.create({
        user,
        code,
        isError,
        message,
    }).catch((err) => formatLogs("system", "logger/error", err.message));
};
