import { readFileSync } from "fs";
import { join as joinPath } from "path";
import { google, gmail_v1 } from 'googleapis';
import { encode } from 'js-base64';
import { handleError, mailerExceptions } from "../../exceptions";
import { IEmailVerifiedMail } from "../../interfaces/mailer";
import { IEvent, IWorkshop } from '../../interfaces/models';
import { findUserByKriyaId } from "../../services/profile";
import { findEventById } from "../../database/services/event";
import { findWorkshopById } from "../../database/services/workshop";

const tempaltesBasePath = joinPath(__dirname, "templates");

const googleOAuthClient = new google.auth.OAuth2(process.env.SMTP_CLIENT_ID, process.env.SMTP_CLIENT_SECRET, process.env.SMTP_REDIRECT_URL);

googleOAuthClient.setCredentials({
    refresh_token: process.env.SMTP_REFRESH_TOKEN
})

const gmail = new gmail_v1.Gmail({
    auth: googleOAuthClient
});

const constructEmail = (to: string, from: string, subject: string, message: string) => {
    const str = [
        'Content-Type: text/html; charset="UTF-8"\n',
        'to: ', to,'\n',
        'from: ', from,'\n',
        'subject: =?utf-8?B?', encode(subject, true),'?=\n\n',
        message,
    ].join('');

    const encodedMail = encode(str, true);

    return encodedMail;
}

const sendEmail = (to: string, subject: string, message: string) => {
    gmail.users.messages.send({
        auth: googleOAuthClient,
        requestBody: {
            raw: constructEmail(to, process.env.SMTP_FROM as string, subject, message)
        },
        userId: 'me'
    }).catch((err) => {
        handleError(mailerExceptions.SEND_FAILED, "", err, to);
    })
}

const readTemplate = (fileName: string) => {
    return readFileSync(joinPath(tempaltesBasePath, fileName)).toString()
}

export const sendEmailVerifiedMail = (email: string, payload: IEmailVerifiedMail) => {

    let template: string = readTemplate("emailverificationsuccess.html");
    template = template.replace(/\{\{kriyaId\}\}/g, payload.kriyaId);

    sendEmail(email, "Kriya Email Verification", template);

};


export const sendEmailVerificationMail = (email: string, url: string) => {
    let template: string = readTemplate("emailverification.html");
    template = template.replace(/\{\{url\}\}/g, url);

    sendEmail(email, "Kriya Email Verification", template);
}


export const sendEventRegistrationMail = async (kriyaId: string, eventId: number) => {

    const email = await findUserByKriyaId(kriyaId).then((user) => user.getDataValue('email') as string);
    const event = await findEventById(eventId).then((_event) => _event.toJSON()) as IEvent;

    let template: string = readTemplate("eventRegistration.html");
    template = template.replace(new RegExp(`{{eventName}}`, 'g'), event.name)

    sendEmail(email, "Kriya Event Registration", template);
}

export const sendWorkshopRegistrationMail = async (kriyaId: string, workshopId: number) => {

    const email = await findUserByKriyaId(kriyaId).then((user) => user.getDataValue('email') as string);
    const workshop = await findWorkshopById(workshopId).then((wrkshop) => wrkshop.toJSON()) as IEvent;

    let template: string = readTemplate("eventRegistration.html");
    template = template.replace(new RegExp(`{{eventName}}`, 'g'), workshop.name)

    sendEmail(email, "Kriya Workshop Registration", template);

}

export const sendPaymentMail = async (kriyaId: string, eventId: number) => {

    const email = await findUserByKriyaId(kriyaId).then((user) => user.getDataValue('email') as string);
    let purpose = "GENERAL REGISTRATION"
    if(eventId !== -1) {
        const eventObj = await findWorkshopById(eventId).then((event) => event.toJSON()) as IWorkshop;
        purpose = eventObj.name;
    }

    let template: string = readTemplate("paymentConfirmation.html");
    template = template.replace(new RegExp(`{{purpose}}`, 'g'), purpose)

    sendEmail(email, "Kriya Payments", template);

}
