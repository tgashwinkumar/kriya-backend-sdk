import { log } from "../logger";

export const handleError = (code: string, message?: string, err?: any, user: string = "system") => {
    if(!err) {
        err = {}
    }

    // Handle parent error if any
    if (err.code && err.message) {
        log(true, err.code, user, err.message);
        return {
            code: err.code,
            message: err.message,
        };
    }

    // No Parent error
    log(true, code, user, message || err.message);

    return { code, message };
};

export default {
    USER_NOT_FOUND: "USER_NOT_FOUND",
};

export const DatabaseExceptions = {
    ERROR: "database/error",
};

export const AuthExceptions = {
    MISSING_CREDENTIALS: "auth/missing-auth-token",
    INVALID_TOKEN: "auth/argument-error",
    TOKEN_EXPIRED: "auth/id-token-expired",
    USER_NOT_FOUND: "auth/user-not-found",
    USER_DUPLICATE_ENTRY: "auth/duplicate-entry",
    USER_CREATION_ERROR: "auth/error-creating-user",
    PROFILE_CREATION_ERROR: "auth/error-creating-profile",
    USER_READING_ERROR: "auth/error-fetching",
    USER_VERIFICATION_ERROR: "auth/error-verifying",
    USER_AUTH_ERROR: "auth/error-logging-in",
    EMAIL_NOT_VERIFIED: "auth/email-not-verified",
    SIGN_OUT_ERROR: "auth/sign-out-error",
    SIGN_UP_ERROR: "auth/sign-up-error",
    SET_USER_CLAIMS: "auth/user-claims-error",
    USER_DELETE_ERROR: "auth/delete-error",
    PASSWORD_RESET: "auth/password-reset",
    ERROR_VERIFYING_EMAIL: "auth/email-verify-error",
    ERROR_FETCHING_USER: "auth/error-fetching-user",
    GENERATING_VERIFICATION_LINK: "auth/error-generating-verification-link"
};

export const ProfileExceptions = {
    PROFILE_UPDATE_ERROR: "profile/error-updating",
    PROFILE_NOT_COMPLETED: "profile/profile-not-completed",
};

export const EventsExceptions = {
    NOT_FOUND: "event/not-found",
    ERROR_READING: "event/error-fetching",
};

export const WorkshopsException = {
    NOT_FOUND: "workshop/not-found",
    ERROR_READING: "workshop/error-fetching",
};

export const StorageExceptions = {
    UPLOAD_ERROR: "storage/upload-error",
    DOWNLOAD_ERROR: "storage/download-error",
    FILE_NOT_FOUND: "storage/file-not-found",
    INVALID_CONTENT: "storage/invalid-content",
};

export const registrationExceptions = {
    REGISTRATION_ERROR: "registration/failed",
    EVENT_ERROR: "registration/event-error",
    WORKSHOP_ERROR: "registration/workshop-error",
    EVENT_DUPLICATE: "registration/duplicate-event-registration",
    WORKSHOP_DUPLICATE: "registration/duplicate-workshop-registration",
    DUPLICATE_GENERAL_PAYMENT: "registration/duplicate-general-registration",
    GENERAL_FEE_NOT_PAID: "registration/general-fee-not-paid",
    WORKSHOP_FULL: "registration/no-seats-available",
    WORKSHOP_NOT_REGISTERED: "registration/workshop-not-registered"
};

export const joinExceptions = {
    EVENT_ERROR: "join/event-error",
    WORKSHOP_ERROR: "join/workshop-error",
    WORKHOP_NOT_STARTED: "join/workshop-not-started",
    EVENT_NOT_STARTED: "join/event-not-started",
};

export const mailerExceptions = {
    INIT: "mailer/init",
    SEND_FAILED: "mailer/sending-failed",
};

export const paymentExceptions = {
    INVALID_DATA: 'payment/invalid-data',
    TRANSACTION_ID_ERROR: 'payment/error-creating-transactionId',
    TRANSACTION_CREATION: 'payment/error-creating-transaction',
    INVALID_TRANSACTION: 'payment/invalid-transaction',
    NO_TRANSACTION: 'payment/no-transaction-found',
    TRANSACTION_SESSION_EXISTS: 'payment/pending-previous-payment',
    PAYMENT_FAILED: 'payment/failed',
    RECEIPT_ERROR: 'payment/receipt-error'
}
