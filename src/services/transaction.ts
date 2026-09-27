import apiClient from "../api/client";
import type { AppointmentPaymentDto, TransactionHistoryQueryDto, WalletTransactionDto } from "../types/transaction";
import { AlertSwal } from "../utils/errorSwal";

export const PostWalletDeposit = async(payload:WalletTransactionDto) =>{
  try {
    const res=await apiClient.post("/transaction/wallet/deposit", payload);
  AlertSwal.succes("تراکنش با موفقیت ثبت شد!")
  return res.data
  } catch (error) {
    AlertSwal.backEndError(error,"خطا در ثبت تراکنش!")
    throw error
  }
}
  

export const PostWalletwithdraw = async(payload:WalletTransactionDto) =>{
  try {
    const res=await  apiClient.post("/transaction/wallet/withdraw", payload);

  AlertSwal.succes("تراکنش با موفقیت ثبت شد!")
  return res.data
  } catch (error) {
    AlertSwal.backEndError(error,"خطا در ثبت تراکنش!")
    throw error
  }
}


export const PostWalletPayment =async (payload:AppointmentPaymentDto) =>{
  try {
    const res=await  apiClient.post("/transaction/appointment/payment", payload);
  AlertSwal.succes("تراکنش با موفقیت ثبت شد!")
  return res.data
  } catch (error) {
    AlertSwal.backEndError(error,"خطا در ثبت تراکنش!")
    throw error
  }
}


export const PostWalletCancel = async(appointmentId:string) =>{
  try {
    const res=await  apiClient.post("/transaction/appointment/cancel", appointmentId);
  AlertSwal.succes("تراکنش با موفقیت ثبت شد!")
  return res.data
  } catch (error) {
    AlertSwal.backEndError(error,"خطا در ثبت تراکنش!")
    throw error
  }
}


export const GetTransactionList = async(payload:TransactionHistoryQueryDto) =>{
  try {

    
    const res=await   apiClient.get("/transaction/history",{params:payload});


    
    return res.data
  } catch (error) {

    
    AlertSwal.backEndError(error,"حطا در دریافت تراکنش های مراجع!")
    throw error
  }
}


export const GetRefrshWallet = async(patientId:string) =>{
  try {
    const res=await   apiClient.get("/transaction/wallet/balance",{params:{patientId}});

    
    return res.data
  } catch (error) {
    AlertSwal.backEndError(error,"حطا در بروزرسانی کیف پول  مراجع!")
    throw error
  }
}


