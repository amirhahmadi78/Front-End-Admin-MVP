


import { PaymentType, SessionType, type AppointmentType, type ClinicAppointmentStatus, type TherapistAppointmentStatus } from "./enums";

export class DTOFindAppointments {
  
_id?: string;
  patient?: string
  therapist?:string
  patientName?: string;
  therapistName?: string 
  start?: Date;
  end?: Date;
  duration?: number;
  type?: AppointmentType;
  sessionType?: SessionType;
  status_clinic?: ClinicAppointmentStatus[];
  status_therapist?: TherapistAppointmentStatus;
  room?: string ;
  notes?: string ;
  report?: string  ;
  price?: number;
  localDay?: string ;
  patientConfirmed?: boolean;
  date?: string 
  time?: string 
  status?: string 
  assessmentLegacyId?: string 
    minAmount?: number;
  maxAmount?: number;
}




export class DTONewAppointment {
   therapist!:string;
      patient!:string
      start!:Date
      duration!:number
      type!:AppointmentType
      price!:number|null
      room?:string
      notes?:string
      sessionType!:SessionType
  time: any;
  date: any;
  useCustomPrice: any;
  priceNotFound: any;
      
}


export class DTOChangeStatus {
  appointmentId!: string
  status_clinic!: string
  payAt!: string
  pay_details!: any
  payment!: any
}



export class DTOEditAppointment {
  _id!:string
   therapist!:string;
      patient!:string
      start!:Date
      duration!:number
      type!:AppointmentType
      price!:number|null
      room?:string
      notes?:string
      sessionType!:SessionType
      
}


export class ChangeStatusDTO {
    appointmentId!:string
  status_clinic!:ClinicAppointmentStatus
  payAt!:string
  pay_details!:string|number
  payment!:PaymentType
  fee!:number
}