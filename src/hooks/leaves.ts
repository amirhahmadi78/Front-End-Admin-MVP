import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DeleteLeaveRequest,
  GetDayLeaveRequests,
  GetFindLeaveRequestsTherapist,
  GetPendingLeaveRequestsCount,
  PostApproveRejectLeaveRequest,
  PostCreateLeaveRequestTH,
} from "../services/leaves";
import type { Aprove_Reject_leaveR, DTOFindTherapistLeave, ICreateLeaveRequestDTO } from "../types/leaves";
import type { StatusLeavesTherapistType } from "../types/enums";
import { QueryService } from "../utils/customHooks";

export const useFindeLeavesTherapist = (query: DTOFindTherapistLeave) => {
  return useQuery({
    queryKey: ["leavesfind", query],
    queryFn: () => GetFindLeaveRequestsTherapist(query),
    enabled:false,
    initialData:[]
  });
};

export const useDayLeaveRequest_TH = (
  date: string,
  status: StatusLeavesTherapistType[],
) => {
  return useQuery({
    queryKey: ["leaves-therapist", { date, status }],
    queryFn: () => GetDayLeaveRequests(date, status),
    enabled:false,

  });
};


export const useResToLeaveR=()=>{
  const qc=useQueryClient()
  return QueryService.GetMutation(
    (query:Aprove_Reject_leaveR)=> PostApproveRejectLeaveRequest(query)
   , {
      onSuccess:(data)=>{
        qc.setQueriesData({
          queryKey:["leavesfind"]
        },
        (oldData:[])=>{
          if (!oldData)return oldData
          return oldData.map(t=>t._id== data._id?data:t)
        }
      
      )
      qc.setQueriesData({
        queryKey:["leaves-therapist"]
      },
       (oldData:{leaveRequests:[]})=>{
          if (!oldData|| !oldData?.leaveRequests)return oldData
          return oldData.leaveRequests.map(t=>t._id== data._id?data:t)
        }
    
    
    )
       qc.refetchQueries({queryKey:["leavescount"]})
 
     
      }
    }
  )
  
}

export const useDeleteLeaveTh=()=>{
    const qc=useQueryClient()
    return QueryService.GetMutation(
      (LeaveId)=>DeleteLeaveRequest(LeaveId)
      ,
      {
      onSuccess:(data)=>{
        qc.setQueriesData({
          queryKey:["leavesfind"]
        },
        (oldData:[])=>{
          if (!oldData)return oldData
          return oldData.filter(t=>t._id!= data._id)
        }
      
      )
      
     
      
      qc.refetchQueries({queryKey:["leavescount"]})}
    }
    )
  
  
}

export const useMakeLeaveTH=()=>{
   const qc=useQueryClient()
    return QueryService.GetMutation(
      (payload:ICreateLeaveRequestDTO)=>PostCreateLeaveRequestTH(payload)
      ,
      {
      onSuccess:(data)=>{
        qc.setQueriesData({
          queryKey:["leavesfind"]
        },
        (oldData:[])=>{
       
          
          if (!oldData)return oldData
          return [data,...oldData]
        }
      
      )
       qc.refetchQueries({queryKey:["leavescount"]})
      
      
      
     
      }
    }
    )
}

export const useLeavesCount=()=>{
 
   return useQuery({
    queryKey: ["leavescount"],
    queryFn: () => GetPendingLeaveRequestsCount(),

    initialData:0
  });
  
} 