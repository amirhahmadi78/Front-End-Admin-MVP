export const howDidYouKnowType =[
        "instagram",
        "google",
        "doctor_referral",
        "friend_family",
        "clinic_website",
        "social_media_other",
        "advertisement",
        "other",
      ]
export type howDidYouKnowType=(typeof howDidYouKnowType)[number]



export class BirthConditionsDto {
  jaundice?: boolean;

  seizure?: boolean;

  vomitingDiarrhea?: boolean;

  headInjury?: boolean;

  metabolicDisease?: boolean;

  other?: string;
}

export class ChildProblemsDto {
  blindness?: boolean;

  deafness?: boolean;

  intellectualDisability?: boolean;

  speechProblems?: boolean;

  feedingProblems?: boolean;

  heartProblems?: boolean;

  other?: string;
}

export class UpdatePatientProfileDto {
  _id!: string;

  fullName?: string;

  birthDate?: string;

  gender?: string;

  parentsJob?: string;

  birthConditions?: BirthConditionsDto;

  childProblems?: ChildProblemsDto;

  surgeryHistory?: string;

  finished!: boolean;

  suggested_classes!: string;

  medicationHistory?: string;

  rehabHistory?: string;

  initialAssessmentResults?: string;

  overallTherapyGoals?: string;

  evaluatedBy?: string;

  patient?: string;

  editableBy?: string[];

  visibleTo?: string[];

   howDidYouKnow?: howDidYouKnowType;


  attendingDoctorName?: string;

}
