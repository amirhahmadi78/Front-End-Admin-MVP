import type { StatusLeavesTherapistType } from "./enums"

export interface DTOFindTherapistLeave {
    therapist?:string
    type?:string
    startDate?:Date
endDate?:Date
startTime?:string
endTime?:string
day?:Date
status?:StatusLeavesTherapistType[]
}


export interface Aprove_Reject_leaveR {
     requestId:string,
          status:StatusLeavesTherapistType,
          adminNotes?:string
}


// types/leave.ts

export type LeaveType = "daily" | "hourly";
export type LeaveStatus = "pending" | "approved" | "rejected";
export type UserType = "Therapist" | "Patient";

export interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  role?: "psychologist" | "psychiatrist" | "counselor" | "therapist";
}

export interface ITherapist {
  _id: string;
  firstName: string;
  lastName: string;
  role?: "psychologist" | "psychiatrist" | "counselor" | "therapist";
}

export interface ILeaveRequest {
  _id: string;
  user: IUser | string;
  userType: UserType;
  therapist: ITherapist | string;
  type: LeaveType;
  startDate: Date | string;
  endDate?: Date | string | null;
  startTime?: string | null;
  endTime?: string | null;
  reason: string;
  status: LeaveStatus;
  adminNotes?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  __v?: number;
}

export interface ICreateLeaveRequestDTO {
  user: string;
  userType: UserType;
  therapist: string;
  type: LeaveType;
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  reason: string;
}

export interface IUpdateLeaveRequestDTO {
  status?: LeaveStatus;
  adminNotes?: string;
}

export interface IFindLeavesQuery {
  therapist?: string | null;
  status?: LeaveStatus | LeaveStatus[] | "all";
  startDate?: string;
  endDate?: string;
}

export interface ILeaveRequestStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface IDayLeaveResponse {
  leaveRequests: ILeaveRequest[];
}

// types/enums.ts
export type StatusLeavesTherapistType = "pending" | "approved" | "rejected";