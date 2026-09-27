
import {  deleteInsuranceContractApi, getAllInsuranceContractsApi, getInsuranceContractsForPaymentApi, getInsurancePaymentReportsApi, getInsurancePaymentTransactionsApi, getPatientInsuranceDebtsApi, PatchupdateInsuranceContractApi, PostcCeateInsuranceContractApi, recordInsurancePaymentApi } from "../services/insurance";
import type { editInsuranceContract, getInsurancePaymentReports, InsurancePaymentFormData, InsurancePaymentTransactionsDTO, newInsuranceContract, PatientInsuranceDebtsDTO } from "../types/insurance";
import { QueryService } from "../utils/customHooks";
import { useQueryClient } from "@tanstack/react-query";

export const useGetFintInsuranceContract = (id?: string) => {
  return QueryService.GetQuery(
    ["insurance_contracts", id],
    () => getAllInsuranceContractsApi(id),
    { enabled: false, initialData: [] },
  );
};

export const useCreateIncuranceContract=()=>{
  const qc=useQueryClient()
  return QueryService.GetMutation(
    (payload:newInsuranceContract)=>PostcCeateInsuranceContractApi(payload),
    {onSuccess:(data)=>{
      qc.setQueriesData({
        queryKey:["insurance_contracts"]
      },
    (oldData:newInsuranceContract[])=>{
      if(!oldData) return oldData
        return [...oldData,data]
    }
  
  )
    }}
  )
}

export const useEditIncuranceContract=()=>{
  const qc=useQueryClient()
  return QueryService.GetMutation(
    (payload:editInsuranceContract)=>PatchupdateInsuranceContractApi(payload),
    {onSuccess:(data)=>{
      qc.setQueriesData({
        queryKey:["insurance_contracts"]
      },
    (oldData:editInsuranceContract[])=>{
      if(!oldData) return oldData
         return oldData.map(t=>t._id== data._id?data:t)
    }
  
  )
    }}
  )
}


export const useDeleteIncuranceContract=()=>{
  const qc=useQueryClient()
  return QueryService.GetMutation(
    (_id:string)=>deleteInsuranceContractApi(_id),
    {onSuccess:(data)=>{
      qc.setQueriesData({
        queryKey:["insurance_contracts"]
      },
    (oldData:editInsuranceContract[])=>{
      if(!oldData) return oldData
         return oldData.filter(t=>t._id!= data._id)
    }
  
  )
    }}
  )
}

export const useGetSignInsurance=()=>{
return QueryService.GetQuery(
  ["insurance-sign"],
  ()=> getInsuranceContractsForPaymentApi(),
  {initialData:[],
    enabled:false
  }
)
}

export const useInsureRecord=()=>{
  return QueryService.GetMutation(
    (payload:InsurancePaymentFormData)=> recordInsurancePaymentApi(payload)
  )
}

export const useGetInsurancePaymentReports=(query:getInsurancePaymentReports)=>{
  return QueryService.GetQuery(
    ['payment-reports',query],
    ()=>getInsurancePaymentReportsApi(query),
    {enabled:false,
      initialData:null
    }
  )
}

export const useInsurancePaymentTransactions=(query:InsurancePaymentTransactionsDTO)=>{
  return QueryService.GetQuery(
    ["insurance-tracsaction",query],
    ()=>getInsurancePaymentTransactionsApi(query),
    {initialData:[],
      enabled:false
    }
  )
}

export const usePatientInsuranceDebts=(query:PatientInsuranceDebtsDTO)=>{
  return QueryService.GetQuery(
    ["patient-debts",query],
    ()=>getPatientInsuranceDebtsApi(query),
    {enabled:false}
  )
}