import crypto from 'crypto';

const ENCRYPTION_KEY = "31a4135318fb765bb037aa53ee1ed3ed";
const IVString = "4690ed68f7b720fcbe2b820d8307cb67";
const IV =  Buffer.from(IVString, "hex");

const hashsha = (text: string) => {
    return crypto.createHash('sha256').update(text).digest("base64");
}

export const encryptData = (rawData: string) => {
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, IV);
    let encrypted = cipher.update(rawData.concat(hashsha(rawData)));
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString('base64')
}

export const decryptData = (encryptedData: string) => {
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, IV);
    let data: string = decipher.update(encryptedData, 'base64', 'ascii');
    data += decipher.final();
    return data.substring(0, data.length-44);
}