import {  useQuery, useQueryClient } from "@tanstack/react-query"
import { DeleteAdminNote, GetAdminNotes, GetAllAdminNotes, PatchAdminNote, PostAdminNote } from "../services/notes"
import { QueryService } from "../utils/customHooks"

export const useFindNotes=(date:Date)=>{
    return useQuery({
        queryKey:["adminnotes",date],
        queryFn:()=>GetAdminNotes(date),
        initialData: [],
    })
}

export const useAllNotes=()=>{
    return useQuery({
        queryKey:["alladminnotes"],
        queryFn:()=>GetAllAdminNotes(),
        initialData: [],
        enabled:false
    })
}

export const useCreateNote=()=>{
    const qc=useQueryClient()
    return QueryService.GetMutation(
        (query)=>PostAdminNote(query),
            
        {onSuccess:(data)=>{
            qc.setQueriesData({
                queryKey:["adminnotes"]
                
            },
            (oldData:[])=>{
           
                
                if (!oldData) return oldData
                return [...oldData,data]
            }
    )
 qc.setQueriesData({
                queryKey:["alladminnotes"]
                
            },
            (oldData:[])=>{
           
                
                if (!oldData) return oldData
                return [...oldData,data]
            }
    )
}

}
    )
}


export const useUpdateNote=()=>{
    const qc=useQueryClient()
    return QueryService.GetMutation(
        (query)=>PatchAdminNote(query),
            
        {onSuccess:(data)=>{
            qc.setQueriesData({
                queryKey:["alladminnotes"]
                
            },
            (oldData:[])=>{
            
                
                if (!oldData) return oldData
                return oldData.map(t=> t._id==data._id?data:t)
            }
      )  }}
    )

    
}



export const useDeleteNote=()=>{
    const qc=useQueryClient()
    return QueryService.GetMutation(
        (query)=>DeleteAdminNote(query),
            
        {onSuccess:(data)=>{
            qc.setQueriesData({
                queryKey:["alladminnotes"]
                
            },
            (oldData:[])=>{
                if (!oldData) return oldData
                return oldData.filter(t=> t._id!=data._id)
            }
      )  }}
    )

    
}