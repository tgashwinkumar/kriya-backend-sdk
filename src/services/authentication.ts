import { emitWarning } from "process";
import { regexp } from "sequelize/types/lib/operators";
import { createUserInDatabase, findUserByKriyaId, authDetailsByEmail, findUserByEmail } from "../database/services/user";
import { AuthExceptions, handleError } from "../exceptions";
import { changePasswordAfterReset, createFirebaseUserWithEmail, deleteUserInFirebase, generateEmailVerificationLink, getFirebaseUser, getFirebaseUserByEmail, loginWithEmailAndPassword, sendResetPasswordEmail, verifyEmail } from "../firebase/services";
import { formatDisaplyName, isEmailFromPSG } from "../generators";
import { ILoginResponse, ISignUpRequest } from "../interfaces/http";
import { sendEmailVerificationMail, sendEmailVerifiedMail } from '../messaging/mailer';

/**
 * Creates a new user in database and in firebase
 * If the user already exists in DB check the database if the user is registered with kriya ID, If not send verfication link again
 * @param user Sign up request body
 * @param password password
 */
export const signUpWithEmail = (user: ISignUpRequest, password: string) => {

    return createFirebaseUserWithEmail(user.email, password)
        .then(() =>
            getFirebaseUser(user.email, password).then((fUser) =>
                fUser.sendEmailVerification())).catch((err) => {
            throw handleError(AuthExceptions.SIGN_UP_ERROR, "", err, user.email);
        }).catch((err) => {
            if(err.code === 'auth/email-already-exists'){
                findUserByEmail(user.email)
                    .catch((_err) => {
                        if(_err.code === AuthExceptions.USER_NOT_FOUND) {
                            sendEmailVerificationLink(user.email);
                        }
                    })
            }
            throw err;
        });

};

/**
 * Fetches user based on kriya ID and maps the email to generate ID Token
 * @param kriyaId Kriya ID
 * @param password Password
 */
export const loginWithKriyaId = (kriyaId: string, password: string) => {
    return findUserByKriyaId(kriyaId)
        .then((model: any): Promise<ILoginResponse> => {
            const email = model.getDataValue("email");

            return loginWithEmailAndPassword(email, password).then((cred) => {
                return ({...cred, profileCompleted: !!model.getDataValue("profile"), isPsg: isEmailFromPSG(email)})
            });
        }).catch((err) => {
            throw handleError(AuthExceptions.USER_AUTH_ERROR, "", err, kriyaId);
        });
};

/**
 * Confirms verification of email
 * @param oobCode Temporary code sent in mail for verification
 */
export const verifyEmailAndGenerateKriyaId = (oobCode: string) =>
    verifyEmail(oobCode).then((email) =>
        getFirebaseUserByEmail(email as string).then((fUser) =>
            createUserInDatabase({
                email: email as string,
                firebaseUId: fUser.uid,
            }).then((dUser) => {
                const kriyaId = dUser.getDataValue("kriyaId") as string;
                sendEmailVerifiedMail(email as string, {kriyaId});
                return kriyaId;
            })));


export const sendEmailVerificationLink = (email: string) => {
    return generateEmailVerificationLink(email).then((url) => {
        sendEmailVerificationMail(email, url);
    })
}

export {
    changePasswordAfterReset,
    sendResetPasswordEmail,
};
