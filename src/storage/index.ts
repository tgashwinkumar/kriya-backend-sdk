import { File, Storage } from "@google-cloud/storage";

import { handleError, StorageExceptions } from "../exceptions";

const storage = new Storage();

/**
 * Uploads a file to Cloud Storage
 * @param key file key in cloud storage
 * @param contentType Mime type string
 * @param dataBuffer Buffer to write
 */
export const uploadFileToBucket = (key: string, contentType: string, dataBuffer: Buffer) => {

    const file = storage.bucket(process.env.BUCKET as string).file(key);

    return file.save(dataBuffer, {
        public: false,
        contentType,
    }).catch((err) => {
        throw handleError(StorageExceptions.UPLOAD_ERROR, "Error uploading file", err, `STORE-${key}`);
    });

};

/**
 * Reads a file from cloud storage
 * @param key Key of object to be read
 */
export const readFileFromBucket = (key: string) =>

    storage.bucket(process.env.BUCKET as string).getFiles({prefix: key}).then(([files]) => {
        if (files.length !== 0) {
            const file: File = files[0];

            return file.exists().then((exists) => {
                if (exists) {
                    return file.getMetadata()
                        .then(([metadata]) =>
                            file.download().then(([buffer]) =>
                                `data:${metadata.contentType};base64,${buffer.toString("base64")}`).catch((err) => {
                                throw handleError(StorageExceptions.DOWNLOAD_ERROR, "Error downloading contents", err, `STORE-${key}`);
                            })).catch((err) => {
                            throw handleError(StorageExceptions.DOWNLOAD_ERROR, "Error fetching metadata", err, `STORE-${key}`);
                        });
                } else {
                    throw handleError(StorageExceptions.FILE_NOT_FOUND, "", {}, `STORE-${key}`);
                }
            }).catch((err) => {
                throw handleError(StorageExceptions.DOWNLOAD_ERROR, "", err, `STORE-${key}`);
            });
        } else {
            throw handleError(StorageExceptions.FILE_NOT_FOUND, "", {}, `STORE-${key}`);
        }
    });
