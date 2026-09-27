import { useQuery, useQueryClient } from "@tanstack/react-query"
import { DeleteDefAppointment, Get_Day_therapist_Def, PatchEditDefAppointment, PostAddDefAppointment } from "../services/DefAppointment"
import type { AtLeastOne, editDefAppDto, NewDefAppDto, TherapistQuery } from "../types/defAppointment"
import { QueryService } from "../utils/customHooks"

export const useDefapp_day_th_pa=(query: AtLeastOne<TherapistQuery>)=>{
    return useQuery({
         queryKey: [
      "defAppointment-d-t-p",
      {
        day: query?.day ?? null,
        therapist: query?.therapist ?? null,
        patient: query?.patient ?? null,
      }],
        queryFn:()=>Get_Day_therapist_Def(query),
        initialData:[]
    })
}


export const useCreateDefApp=()=>{
  const qc = useQueryClient();
  return QueryService.GetMutation(
    (payload:NewDefAppDto)=>PostAddDefAppointment(payload),
    {
      onSuccess:(data)=>{
            qc.setQueriesData({
                queryKey:["defAppointment-d-t-p"]
            },
        (oldData:[])=>{
       
            if(!oldData) return oldData
            return [...oldData,data]
        }
    
  )}
    }
  )
}


export const useEditDefApp=()=>{
  const qc = useQueryClient();
  return QueryService.GetMutation(
    (payload:editDefAppDto)=>PatchEditDefAppointment(payload),
    {
      onSuccess:(data)=>{
            qc.setQueriesData({
                queryKey:["defAppointment-d-t-p"]
            },
        (oldData:editDefAppDto[])=>{
             
            if(!oldData) return oldData
           return oldData.map(t=>t._id== data._id?data:t)
        }
    
  )}
    }
  )
}



export const useDeleteDefApp=()=>{
  const qc = useQueryClient();
  return QueryService.GetMutation(
    (_id:string)=>DeleteDefAppointment(_id),
    {
      onSuccess:(data)=>{
            qc.setQueriesData({
                queryKey:["defAppointment-d-t-p"]
            },
        (oldData:editDefAppDto[])=>{
            if(!oldData) return oldData
                 return oldData.filter(t=>t._id!=data._id)
        }
    
  )}
    }
  )
}



