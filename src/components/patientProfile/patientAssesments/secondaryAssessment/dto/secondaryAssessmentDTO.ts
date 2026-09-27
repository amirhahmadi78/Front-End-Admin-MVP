export enum AssessmentDomain {
  SLP = "گفتاردرمانی",
  OT = "کاردرمانی",
  PT = "فیزیوتراپی",
  PSY = "روانشناسی",
  OTHER = "سایر",
}
 

/**
 * DTO برای ایجاد ارزیابی ثانویه جدید
 */
export class CreateSecondaryAssessmentDTO {
 
  patientProfile!: string;
 
  assessedBy!: string;

 
  domain!: AssessmentDomain;

 
  result!: string;

 
  therapyGoals!: string;
 
  finished?: boolean;
}

/**
 * DTO برای ویرایش ارزیابی ثانویه (همه فیلدها اختیاری)
 */
export class UpdateSecondaryAssessmentDTO {
 
  _id!:string
 
  patientProfile?: string;
 
  assessedBy?: string;

 
  domain?: AssessmentDomain;

 
  result?: string;

 
  therapyGoals?: string;
 
  finished?: boolean;
}


export class SearchSecondaryAssessmentDTO {
 
  patientProfile?: string;

 
  assessedBy?: string;

 
  domain?: AssessmentDomain;

 
  finished?: string; // به صورت رشته دریافت میشود و بعداً تبدیل میشود

 
  page?: number = 1;
 
  limit?: number = 10;
 
  sortBy?: string = 'createdAt';
 
  order?: 'asc' | 'desc' = 'desc';
}


export class GetPatientSecondaryAssessmentDTO {
 
  patientProfile!: string;
page?:string
limit?:string
 
}

export class DeleteSecondryAssessmentDTO{

  id!:string
}

export interface ISecondaryAssessment extends Document {
    _id:string
  patientProfile: string; // ارجاع به PatientProfile
  assessedBy: string; // درمانگر ارزیاب (ارجاع به Therapist)
  domain: AssessmentDomain; // حیطه ارزیابی
  result: string; // نتیجه ارزیابی
  therapyGoals: string; // اهداف درمان
  createdAt: Date;
  updatedAt: Date;
  finished:boolean;
}