
import { useQueryClient } from "@tanstack/react-query"
import { GetTransactionList, PostWalletCancel, PostWalletDeposit, PostWalletPayment, PostWalletwithdraw } from "../services/transaction"
import { QueryService } from "../utils/customHooks"
import type { AppointmentPaymentDto, TransactionHistoryQueryDto, WalletTransactionDto } from "../types/transaction"

export const useTransactionsPatient=(payload:TransactionHistoryQueryDto)=>{
  return QueryService.GetQuery(
    ["transactionpatient",payload],
    ()=>GetTransactionList(payload),
    {enabled:false}
  )
}


export const useWalletDeposit =()=>{
  const qc=useQueryClient()
  return QueryService.GetMutation(
  (payload:WalletTransactionDto)=>PostWalletDeposit(payload),
  {
    onSuccess:(data)=>{
      qc.setQueriesData({
        queryKey:["transactionpatient"]
      },
    (oldData:[])=>{
        if(!oldData) return oldData
            return [...oldData,data]
    }
    )
    }
  }
  )
}

export const useWalletwithdraw =()=>{
  const qc=useQueryClient()
  return QueryService.GetMutation(
     (payload:WalletTransactionDto)=>PostWalletwithdraw(payload),
  {
    onSuccess:(data)=>{
      qc.setQueriesData({
        queryKey:["transactionpatient"]
      },
    (oldData:[])=>{
        if(!oldData) return oldData
            return [...oldData,data]
    }
    )
    }
  }
  )
}

export const useWalletPayment =()=>{
  const qc=useQueryClient()
  return QueryService.GetMutation(
     (payload:AppointmentPaymentDto)=>PostWalletPayment(payload),
  {
    onSuccess:(data)=>{
      qc.setQueriesData({
        queryKey:["transactionpatient"]
      },
    (oldData:[])=>{
        if(!oldData) return oldData
            return [...oldData,data]
    }
    )
    }
  }
  )
}


export const useWalletCancel =()=>{
  const qc=useQueryClient()
  return QueryService.GetMutation(
     (appointmentId:string)=>PostWalletCancel(appointmentId),
  {
    onSuccess:(data)=>{
      qc.setQueriesData({
        queryKey:["transactionpatient"]
      },
    (oldData:[])=>{
        if(!oldData) return oldData
            return [...oldData,data]
    }
    )
    }
  }
  )
}

