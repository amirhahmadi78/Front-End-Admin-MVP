import { useQueryClient } from "@tanstack/react-query"
import { DeleteAdmin, GetAdminsList, PostcreateAdmin, PostRegsterAPP } from "../services/admin"
import { QueryService } from "../utils/customHooks"
import type { CreateAdminFormValues } from "../validation/admin/admin"
import type { registerAppValues } from "../validation/RegisterApp"


export const useRegisterAPP=()=>{

    return QueryService.GetMutation(
        (query:registerAppValues)=>PostRegsterAPP(query)
    ,

    

)}

export const useFindAdmins=()=>{
    return QueryService.GetQuery(
["admins-list"],
()=>GetAdminsList(),
{initialData:[]}
  
)  }


export const useMakeAdmin=()=>{
      const qc = useQueryClient();
    return QueryService.GetMutation(
        (query:CreateAdminFormValues)=>PostcreateAdmin(query)
    ,
{
    onSuccess:(data=>{
        qc.setQueriesData({
                queryKey:["admins-list"]
            },
        (oldData:[])=>{
            if(!oldData) return oldData
            return [...oldData,data]
        }
    )
}
)
})}



export const useDeleteAdmin=()=>{
      const qc = useQueryClient();
    return QueryService.GetMutation(
        (_id:string)=>DeleteAdmin(_id)
    ,
{
    onSuccess:(data=>{
        qc.setQueriesData({
                queryKey:["admins-list"]
            },
        (oldData:[])=>{
            if(!oldData) return oldData
            return oldData.filter(t=>t._id!=data._id)
        }
    )
}
)
})}