import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { DTOeditTherapist, DTOfindTherapists, DTOmakeTherapist } from "../types/therapists";
import { GetTherapists, DeleteTherapist, PostEditTherapist, PostMakeTherapist } from "../services/therapists";

export const useTherapists=(query?:DTOfindTherapists)=>{
    return  useQuery({
        queryKey:['therapists',query],
        queryFn:async()=>{
            
           const therapists=await GetTherapists(query)
    
            
           return therapists
        },
        initialData:[]
    })
}


export const useMakeTherapist=()=>{
    const qc=useQueryClient()
    return useMutation({
        
        mutationFn:(query:DTOmakeTherapist)=>PostMakeTherapist(query),
        onSuccess:(data)=>{
            qc.setQueriesData({
                queryKey:["therapists"]
            },
        (oldData:[])=>{
            if(!oldData) return oldData
            return [...oldData,data.newTherapist]
        }
    )
        }
    })
}

export const useEditTherapist=()=>{
    const qc=useQueryClient()
    return useMutation({
        mutationFn:(query:DTOeditTherapist)=>PostEditTherapist(query),
        onSuccess:(data)=>{
             qc.setQueriesData({
                queryKey:["therapists"]
            },
        (oldData:DTOeditTherapist[])=>{
            if(!oldData) return oldData

            
            return oldData.map(t=>t._id== data._id?data:t)
        }
    )
        }
    })
}

export const useDeleteTherapist=()=>{
    const qc=useQueryClient()
    return useMutation({
        mutationFn:(therapistId:string)=>DeleteTherapist(therapistId),
        onSuccess:(data)=>{
            qc.setQueriesData(
                { queryKey: ["therapists"] },
            (oldData:DTOeditTherapist[])=>{
                if(!oldData)return oldData
                return oldData.filter(t=>t._id!=data._id)
            }
            )
        }
    })
}

