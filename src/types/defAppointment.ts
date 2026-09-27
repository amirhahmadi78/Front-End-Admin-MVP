import { AppointmentType, DayOfWeek } from "./enums";

export type AtLeastOne<T> = {
  [K in keyof T]: Required<Pick<T, K>> & Partial<Omit<T, K>>
}[keyof T];


export type TherapistQuery = {
  day?: DayOfWeek[];
  therapist?: string;
  patient?: string;
};




export type NewDefAppDto= {



  therapist: string;


  patient: string;


  date: DayOfWeek;


  time: string;

  duration: number;

  type: AppointmentType;


  room?: string;


  notes?: string;


  patientFee?: number;
}


export type editDefAppDto= {

_id:string

  therapist: string;


  patient: string;


  date: DayOfWeek;


  time: string;

  duration: number;

  type: AppointmentType;


  room?: string;


  notes?: string;


  patientFee?: number;
}

