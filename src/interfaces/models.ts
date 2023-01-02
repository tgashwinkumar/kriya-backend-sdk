export interface IUser {
    email: string;
    firebaseUId: string;
    kriyaId?: string;
}

export interface IProfile {
    alternatePhone: string;
    college: string;
    department: string;
    dob: string;
    fullName: string;
    interestedSubject: string;
    isPSGStudent: string;
    kriyaId: string;
    phone: string;
    rollNo: string;
    year: number;
}

export interface IEvent {
    id: number;
    name: string;
    category: string;
    startTime: string;
    meetUrl: string;
    psgFee: number;
    nonPsgFee: number;
}

export interface IWorkshop {
    id: number;
    name: string;
    startTime: string;
    meetUrl: string;
    capacity: number;
    psgFee: number;
    nonPsgFee: number;
}

export interface IEventRegistration {
    eventId: number;
    kriyaId: string;
}

export interface IWorkshopRegistration {
    kriyaId: string;
    workshopId: number;
}

export interface ILogs {
    code: string;
    isError: boolean;
    message?: string;
    user: string;
}

export interface IPaymentTransaction {
    transactionId: string;
    kriyaId: string;
    name: string;
    email: string;
    type: string;
    eventId: number;
    fee: number;
    status: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ISchedule {
    eventId: number;
    startTime: string;
    endTime: string;
}
