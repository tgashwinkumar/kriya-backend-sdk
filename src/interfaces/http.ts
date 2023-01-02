export interface IResLocals {
    email: string;
    generalFeePaid: boolean;
    kriyaId: string;
    ProfileCompleted: boolean;
    PSGStudent: boolean;
    uid: string;
}

export interface ILoginRequest {
    kriyaId: string;
    password: string;
}

export interface ILoginResponse {
    accessToken: string;
    // RefreshToken: string,
    exp: number;
    kriyaId: string;
    role: string;
}

export interface ISignUpRequest {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
}

export interface IResetPasswordRequest {
    email: string;
}

export interface IConfirmResetPasswordRequest {
    code: string;
    password: string;
}

export interface IPaymentData {
    transactionid: string;
    kriyaid: string;
    email: string;
    name: string;
    categoryid: number;
    fees: number;
}

export interface IPaymentResponseData {
    transactionid: string;
    kriyaid: string;
    categoryid: number;
    status: number;
}

export interface IPaymentEmailData {
    transactionId: string;
    date: Date;
    kriyaId: string;
    eventId: number;
    fee: number;
    status: number;
}

export interface IPaymentReceiptData {
    kriyaId: string;
    transactionId: string;
    name: string;
    fee: number;
    transactionDate: string;
    feeInWords: string;
    purpose?: string;
}
