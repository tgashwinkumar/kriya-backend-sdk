export interface IFirebaseAdminError {
    codePrefix: string;
    errorInfo: {
        code: string;
        message: string;
    };
}
