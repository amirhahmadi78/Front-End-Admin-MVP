import { useMutation, useQueryClient } from "@tanstack/react-query";
import { batchPaymentService, GetAppsSearch, GetFinanceOfPatient, GetFinanceOfPatient_notpaid, GetFinanceOfTherapiClientst, GetMonthlySalaries, GetMonthlySalariesTherapiClientst, GetTherapiClientstBalance, GetUnprocessedAppointments, PostSalaryTransaction } from "../services/finance";

import type { DTOFindAppointments } from "../types/appointment";
import type { BatchPaymentRequest, DTOfinanceMonthSalaryTH, DTOget_finance_Patient, DTOget_finance_TH_PA, GetTherapiClientstBalanceDTO } from "../types/finance";
import type { AddSalary } from "../types/salary";
import { QueryService } from "../utils/customHooks";


export const useFinantialFindAppointments = (query:DTOFindAppointments) => {
 
  return QueryService.GetQuery(
    ["finance-apps",query],
    ()=>GetAppsSearch(query),
    // {enabled:false}
  )

  
};

export const use_REFETC_FinantialFindAppointments = (query:DTOFindAppointments) => {
 
  return QueryService.GetQuery(
    ["finance-apps",query],
    ()=>GetAppsSearch(query),
    {enabled:false}
  )

  
};

export const useFinanceTH_PA = (query:DTOget_finance_TH_PA) => {
 
  return QueryService.GetQuery(
    ["finance-th-pa",query],
    ()=>GetFinanceOfTherapiClientst(query),
    {enabled:false}
  )

  
};

export const useFinanceMounthSalary_TH = (query:DTOfinanceMonthSalaryTH) => {
 
  return QueryService.GetQuery(
    ["finance-th-pa2",query],
    ()=>GetMonthlySalariesTherapiClientst(query),
    {enabled:false}
  )

  
};


export const useFinancePatient=(query:DTOget_finance_Patient)=>{
  return QueryService.GetQuery(
    ["financepatient",query],
    ()=>GetFinanceOfPatient(query),
    {enabled:false,
   
      
    }
  )
}


export const useFinancePatient_notPaid=(query:DTOget_finance_Patient)=>{
  return QueryService.GetQuery(
    ["financepatient",query],
    ()=>GetFinanceOfPatient_notpaid(query),
    {enabled:false,
   
      
    }
  )
}

export const useGetMounthSalary=(YYYYMM:string)=>{
  return QueryService.GetQuery(
    ["month-salaies",YYYYMM],
    ()=>GetMonthlySalaries(YYYYMM),
    {initialData:[]}
  )
}

export const useGetTherapistBalance=(query:GetTherapiClientstBalanceDTO)=>{
  return QueryService.GetQuery(
    ["therapist-balance",query],
    ()=>GetTherapiClientstBalance(query),
 
  )
}


// export const usePostSalaryTransaction=()=>{
//   const qc=useQueryClient()
//   return QueryService.GetMutation(
//     (query:AddSalary)=>PostSalaryTransaction(query),
//     {onSuccess:(data)=>(



//       qc.setQueriesData({
//         queryKey:["month-salaies"]
//       },
//     (oldData:[])=>{
//       if(!oldData)return oldData
//       return [...oldData,data]
//     } 
//     ),
//     qc.getQueriesData({
//           queryKey: ["therapist-balance"],
       
//         })
//     )
    
//   }
//   )
// }

export const usePostSalaryTransaction = () => {
  const qc = useQueryClient();
  return QueryService.GetMutation(
    (query: AddSalary) => PostSalaryTransaction(query),
    {
      onSuccess: (data, variables) => {
        // 1. به‌روزرسانی کش لیست حقوق ماهانه (اگر می‌خواهید بدون رفرش انجام شود)
        // اما بهتر است فقط invalidate کنید تا داده‌ها با سرور هماهنگ شوند.
        // اگر می‌خواهید کش را به‌روز کنید، باید کلید دقیق داشته باشید.
        const { YYYYMM} = variables; // فرض کنید YYYYMM در variables وجود دارد
    
        qc.setQueryData(["month-salaies", YYYYMM], (oldData: any[] = []) => [...oldData, data]);

        // 2. invalidate کردن تراز درمانگر (برای تمام کوئری‌های balance با هر پارامتری)
        qc.invalidateQueries({
          queryKey: ["therapist-balance"],
          exact: false, // تمام کوئری‌هایی که با ["therapist-balance"] شروع می‌شوند
        });

        // همچنین اگر نیاز است لیست ماهانه دوباره دریافت شود (برای هماهنگی با سرور)
        qc.invalidateQueries({
          queryKey: ["month-salaies", YYYYMM],
          exact: true,
        });
      },
    }
  );
};

export const useUnproccessedApp=(params:{page:number,limit:number})=>{
  return QueryService.GetQuery(
  ["unproccessedapps",params.page],
  ()=>GetUnprocessedAppointments(params)
  )

}






export function useBatchPayment() {

const qc=useQueryClient()
  return useMutation({
    mutationFn: (payload: BatchPaymentRequest) => batchPaymentService(payload),
     onSuccess: () => {
          
         qc.invalidateQueries("appointmentslist")
        },
  })
}
