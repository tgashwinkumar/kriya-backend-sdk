import moment from "moment-timezone";

/**
 * Generated display name for storing in firebase
 * @param firstName User First Name
 * @param lastName User Last Name
 */
export const formatDisaplyName = (firstName: string, lastName: string) => {
    return `${lastName}, ${firstName}`;
};

/**
 * Generated Kriya ID in specific format
 * @param currentCount Current number of users in database
 */
export const formatKriyaId = (sequence: number) => {
    return `KRI21${(sequence).toString().padStart(5, "0")}`;
};

export const formatTransactionId = (sequence: number) => {
    return `KR2021${(sequence).toString().padStart(6, "0")}`;
}

export const formatPaymentUrl = (encryptedData: string) => {
    return `${process.env.PAYMENTS_URL}?payment=${encryptedData}`;
}

/**
 *
 * @param format Timestamp format
 */
export const currentTimestamp = (format: string = "yyyy-MM-DDTHH:mm") => {
    return moment().tz("Asia/Kolkata").format(format);
};

/**
 * Generated console log texts in specific format
 * @param user Who is operating
 * @param code code
 * @param message message
 */
export const formatLogs = (user: string, code: string, message?: string) => {

    return `${currentTimestamp()} : ${user.toString().padEnd(10)} : ${code.toString().padEnd(20)} : ${message || ""}`;

};

export const isEmailFromPSG = (email: string) => {
    const psgEmailRegex = new RegExp('@psgtech.ac.in');
    return psgEmailRegex.test(email);
}
