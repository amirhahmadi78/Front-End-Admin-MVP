import type { howDidYouKnowType } from "./UpdatePatient.dto";

export interface IBirthConditions {
  jaundice: boolean;
  seizure: boolean;
  vomitingDiarrhea: boolean;
  headInjury: boolean;
  metabolicDisease: boolean;
  other?: string;
}

export interface IChildProblems {
  blindness: boolean;
  deafness: boolean;
  intellectualDisability: boolean;
  speechProblems: boolean;
  feedingProblems: boolean;
  heartProblems: boolean;
  other?: string;
}

export interface IPatient extends Document {
  fullName: string;
  birthDate: string;
  gender: string;
  parentsJob: string;
finished:boolean;
  birthConditions: IBirthConditions;
  childProblems: IChildProblems;

  surgeryHistory: string;
  medicationHistory: string;
  rehabHistory: string;

  initialAssessmentResults: string;
  overallTherapyGoals: string;
suggested_classes:string;
  evaluatedBy: string;
  patient: string;
  editableBy: string[];
  visibleTo: string[];
   howDidYouKnow: howDidYouKnowType;


  attendingDoctorName: string;
  createdAt: Date;
  updatedAt: Date;
}
