import { useQueryClient } from "@tanstack/react-query"

import { GetPatientProfileByPatient } from "../services/patientprofiles"
import { QueryService } from "../utils/customHooks"
import type { CreatePatientProfileDto } from "../components/patientProfile/dto/CreatePatient.dto"
import { CreatePatientProfile } from "../services/patientprofiles"

export const useOnepatientProfile=(patient:string)=>{
   return QueryService.GetQuery(
    ["patientprofile",patient],
        ()=>GetPatientProfileByPatient(patient)
    )
}


export const useCreatePatientProfile=()=>{
    const qc=useQueryClient()
   return QueryService.GetMutation(

        (query:CreatePatientProfileDto)=>CreatePatientProfile(query),
   {
     onSuccess: (data) => {
          qc.setQueriesData({ queryKey: ["patientprofile"] },
             (oldData: CreatePatientProfileDto) => {
          
                
                
              if (!oldData) return oldData;
              return {...oldData,patientprofile:data.patientprofile}
            },
          );
        },
   }
    )
}