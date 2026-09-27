import { useQuery, useQueryClient } from "@tanstack/react-query";

import { DeletePatientLeave, GetPatientLeaves, PostPatientLeave, PutPatientLeave } from "../services/leaves-patients";
import { QueryService } from "../utils/customHooks";

export const useFindeLeavesPatients = (date?: Date) => {
  return useQuery({
    queryKey: ["patient-leaves", date],
    queryFn: () => GetPatientLeaves(date),
    
  });
};

export const useRefetchFindeLeavesPatients = (date?: Date) => {
  return useQuery({
    queryKey: ["patient-leaves", date],
    queryFn: () => GetPatientLeaves(date),
    enabled:false,
    initialData:[]
  });
};

export const useCreateLeavePA=()=>{
    const qc=useQueryClient()
    return QueryService.GetMutation(
        (query)=>PostPatientLeave(query),
            
        {onSuccess:(data)=>{
            qc.setQueriesData({
                queryKey:["patient-leaves"]
                
            },
            (oldData:[])=>{
                if (!oldData) return oldData
                return [data,...oldData]
            }
    )}}
    )
}


export const useUpdateLeavePA=()=>{
    const qc=useQueryClient()
    return QueryService.GetMutation(
        (query)=>PutPatientLeave(query),
            
        {onSuccess:(data)=>{
            qc.setQueriesData({
                queryKey:["patient-leaves"]
                
            },
            (oldData:[])=>{
                if (!oldData) return oldData
                return oldData.map(t=> t._id==data._id?data:t)
            }
      )  }}
    )

    
}



export const useDeleteLeavePA=()=>{
    const qc=useQueryClient()
    return QueryService.GetMutation(
        (query)=>DeletePatientLeave(query),
            
        {onSuccess:(data)=>{
            qc.setQueriesData({
                queryKey:["patient-leaves"]
                
            },
            (oldData:[])=>{
                if (!oldData) return oldData
                return oldData.filter(t=> t._id!=data._id)
            }
      )  }}
    )

    
}