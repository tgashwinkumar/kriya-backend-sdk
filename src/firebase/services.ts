import Firebase from "firebase";
import Admin from "firebase-admin";

import { AuthExceptions, handleError } from "../exceptions";
import { ILoginResponse } from "../interfaces/http";

/**
 * Creates a new user in firebase using the email and add role as unverifiedParticipant (User who havent verified their email yet)
 * @param email Email address of the participant
 * @param password Password
 * @param displayName Display name to be used in firebase
 */
export const createFirebaseUserWithEmail = (email: string, password: string) => {

    const AdminAuth = Admin.app(process.env.FIREBASE_ADMIN_APP_NAME).auth();

    return AdminAuth.createUser({
        email,
        password,
        emailVerified: false,
    }).catch((err) => {
        throw handleError(AuthExceptions.SIGN_OUT_ERROR, "Error creating user", err, email);
    });

};

/**
 *
 * @param uid Firebase User Id
 * @param claims Key-value Object for firebase user claims
 */
export const setFirebaseUserClaims = (uid: string, claims: object) => {

    const AdminAuth = Admin.app(process.env.FIREBASE_ADMIN_APP_NAME).auth();

    return AdminAuth.setCustomUserClaims(uid, claims).catch((err) => {
        throw handleError(AuthExceptions.SET_USER_CLAIMS, "Error setting user claims", err, `FUID-${uid}`);
    });

};

/**
 * Deletes user from firebase
 * Used to roll back change if any db error occurs while signing up user
 * @param uid Firebase User Id
 */
export const deleteUserInFirebase = (uid: string) => {

    const AdminAuth = Admin.app(process.env.FIREBASE_ADMIN_APP_NAME).auth();

    return AdminAuth.deleteUser(uid)
        .catch((err) => {
            throw handleError(AuthExceptions.USER_DELETE_ERROR, "Error deleting user", err, `FUID-${uid}`);
        });

};

/**
 * Returns a firebase client User object
 * @param email Email Id
 * @param password Password
 */
export const getFirebaseUser = (email: string, password: string) => {

    const ClientAuth = Firebase.app(process.env.FIREBASE_APP_NAME).auth();

    return ClientAuth.signInWithEmailAndPassword(email, password).then((credential) => {
        if (credential.user) {
            return credential.user;
        } else {
            throw handleError(AuthExceptions.USER_NOT_FOUND, "", {}, email);
        }
    });
};

/**
 * Generate a Id token using email and password
 * and verify if the email is verified
 *  if not verified throws an error and sends verification email to the user
 * @param email User Email
 * @param password Password
 */
export const loginWithEmailAndPassword = (email: string, password: string) => {

    const ClientAuth = Firebase.app(process.env.FIREBASE_APP_NAME).auth();

    return getFirebaseUser(email, password)
        .then((user): Promise<ILoginResponse> =>
            user.getIdTokenResult().then((tokenResult) => {

                const accessToken: string = tokenResult.token;
                const exp: number = new Date(tokenResult.expirationTime).getTime() / 1000;
                const role = tokenResult.claims.role;
                const kriyaId = tokenResult.claims.kriyaId;

                if (ClientAuth.currentUser) {
                    if (!ClientAuth.currentUser.emailVerified) {
                        ClientAuth.currentUser.sendEmailVerification()
                            .catch((err) => handleError(AuthExceptions.EMAIL_NOT_VERIFIED, "Error sending verification mail", err, email));
                        ClientAuth.signOut()
                            .catch((err) => handleError(AuthExceptions.SIGN_OUT_ERROR, "Error signing out client", err, email));
                        throw handleError(AuthExceptions.EMAIL_NOT_VERIFIED, "Verify Email id before logging in", {}, email);
                    }
                    ClientAuth.signOut()
                        .catch((err) => handleError(AuthExceptions.SIGN_OUT_ERROR, "Error signing out client", err, email));
                }

                return { kriyaId, role, accessToken, exp };

            }).catch((err) => {
                throw handleError(AuthExceptions.USER_AUTH_ERROR, "", err, email);
            })).catch((err) => {
            throw handleError(AuthExceptions.USER_AUTH_ERROR, "", err, email);
        });
};

/**
 * Send password reset link to registered email
 * @param email User Email Id
 */
export const sendResetPasswordEmail = (email: string) => {

    const ClientAuth = Firebase.app(process.env.FIREBASE_APP_NAME).auth();

    return ClientAuth.sendPasswordResetEmail(email)
        .catch((err) => {
            throw handleError(AuthExceptions.PASSWORD_RESET, "Error sending password reset email", err, email);
        });

};

/**
 * Change password using code from password reset email
 * @param code Password Reset code
 * @param password New password
 */
export const changePasswordAfterReset = (code: string, password: string) => {

    const ClientAuth = Firebase.app(process.env.FIREBASE_APP_NAME).auth();

    return ClientAuth.confirmPasswordReset(code, password)
        .catch((err) => {
            throw handleError(AuthExceptions.PASSWORD_RESET, "Error setting new password", err);
        });

};

/**
 * Validated email verification code
 * @param code Email verification OOB Code
 */
export const verifyEmail = (code: string) => {

    const ClientAuth = Firebase.app(process.env.FIREBASE_APP_NAME).auth();

    return ClientAuth.checkActionCode(code).then((response) => {

        if (response.operation === "VERIFY_EMAIL") {
            const email: string = response.data.email as string;

            return ClientAuth.applyActionCode(code)
                .then(() => email)
                .catch((err) => {
                    throw handleError(AuthExceptions.ERROR_VERIFYING_EMAIL, "", err);
                });
        }

    }).catch((err) => {
        throw handleError(AuthExceptions.ERROR_VERIFYING_EMAIL, "", err);
    });

};

/**
 * Returns Admin user object
 * @param email Email Id
 */
export const getFirebaseUserByEmail = (email: string) => {

    const AdminAuth = Admin.app(process.env.FIREBASE_ADMIN_APP_NAME).auth();

    return AdminAuth.getUserByEmail(email).catch((err) => {
        throw handleError(AuthExceptions.ERROR_FETCHING_USER, "", err);
    });
};


export const generateEmailVerificationLink = (email: string) => {

    const AdminAuth = Admin.app(process.env.FIREBASE_ADMIN_APP_NAME).auth();

    return AdminAuth.generateEmailVerificationLink(email, {
        url: process.env.SERVER_BASEPATH+'/auth/verify-email'
    }).catch((err) => {
        throw handleError(AuthExceptions.GENERATING_VERIFICATION_LINK, "", err);
    });

};
