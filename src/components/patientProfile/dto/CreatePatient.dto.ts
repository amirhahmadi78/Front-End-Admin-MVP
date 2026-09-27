



export class CreatePatientProfileDto {






  evaluatedBy!: string; // هم string و هم ObjectId قبول شود

  patient!:  string;

  editableBy!:  string[];


  visibleTo!: string[];
  patientProfile: any;
}
