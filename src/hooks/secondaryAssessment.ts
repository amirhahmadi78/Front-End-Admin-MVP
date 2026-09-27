import { useQueryClient } from "@tanstack/react-query"


import { QueryService } from "../utils/customHooks"
import { CreataSecondaryAssessment, FindSecondaryAssessment, GetPatientSecondaryAssessment, UpdateSecondaryAssessment } from "../services/secondaryAssessment"
import type { CreateSecondaryAssessmentDTO, GetPatientSecondaryAssessmentDTO, SearchSecondaryAssessmentDTO, UpdateSecondaryAssessmentDTO } from "../components/patientprofile/patientAssesments/secondaryAssessment/dto/secondaryAssessmentDTO"

export const useFindSecAsse=(data:SearchSecondaryAssessmentDTO)=>{
   return QueryService.GetQuery(
    ["secondary-assessments",data.patientProfile,data],
        ()=>FindSecondaryAssessment(data)
    )
}

export const useGetPatientSecAsse=(data:GetPatientSecondaryAssessmentDTO)=>{
   return QueryService.GetQuery(
    ["secondary-assessments",data.patientProfile,data],
        ()=>GetPatientSecondaryAssessment(data)
    )
}




export const useCreateSecAsse=()=>{
    const qc=useQueryClient()
   return QueryService.GetMutation(

        (query:CreateSecondaryAssessmentDTO)=>CreataSecondaryAssessment(query),
   {
     onSuccess: (data) => {
          qc.setQueriesData({ queryKey: ["secondary-assessments"] },
             (oldData: any) => {
   
          
          
                
                
              if (!oldData) return oldData;
              const list=oldData.data
              const newT=data.data

             if(Array.isArray(list) ) {
              
              const newList=[newT,...list]
          
              
              return {...oldData,data:newList}
             }

            },
          );
        },
   }
    )
}


export const useUpdateSecAsse=()=>{
    const qc=useQueryClient()
   return QueryService.GetMutation(

        (query:UpdateSecondaryAssessmentDTO)=>UpdateSecondaryAssessment(query),
   {
     onSuccess: (data) => {
          qc.setQueriesData({ queryKey: ["secondary-assessments"] },
             (oldData: UpdateSecondaryAssessmentDTO[]) => {
          
                
      
              if (!oldData) return oldData;
              const list=oldData.data
              const newT=data.data

             if(Array.isArray(list) ) {
              
           
               const newList =list.map(item=> item._id===newT._id?newT:item)
              
              return {...oldData,data:newList}
             }else return oldData;
              
            },
          );
        },
   }
    )
}