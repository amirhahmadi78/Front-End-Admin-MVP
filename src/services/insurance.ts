import apiClient from "../api/client";
import type { editInsuranceContract, getInsurancePaymentReports, InsurancePaymentFormData, InsurancePaymentTransactionsDTO, newInsuranceContract, PatientInsuranceDebtsDTO } from "../types/insurance";
import { AlertSwal } from "../utils/errorSwal";



// Insurance Contracts API
export const getAllInsuranceContractsApi = async(id?:string) => {
    try {
        const res=await     apiClient.get("/insurance/contracts",{
            params:{id}
        })
        return res.data
    }
     catch (error) {
      AlertSwal.backEndError(error,"خطا در دریافت لیست قرارداد های بیمه!")  
      throw error
    }}


    

export const getInsuranceContractByIdApi = (id) => apiClient.get(`/api/insurance/contracts/${id}`);


export const PostcCeateInsuranceContractApi = async(payload:newInsuranceContract) => {

    try {
        const res= await  apiClient.post("/insurance/contracts", payload)
          AlertSwal.succes("قرارداد بیمه ی مورد نظر با موفقیت ایجاد شد!")
        return res.data
    } catch (error) {
        AlertSwal.backEndError(error,"خطا در ایجاد قرارداد بیمه ی جدید!")
        throw error
    }
   

}
export const PatchupdateInsuranceContractApi =async ( payload:editInsuranceContract) => {

    try {
        const res= await  apiClient.patch("/insurance/contracts", payload)
         AlertSwal.succes("قرارداد بیمه ی مورد نظر با موفقیت ویرایش شد!")
        return res.data
    } catch (error) {
        AlertSwal.backEndError(error,"خطا در ویرایش قرارداد بیمه ی جدید!")
        throw error
    }}
export const deleteInsuranceContractApi = async(_id:string) => {
    try {
        const res= await  apiClient.delete(`/insurance/contracts/${_id}`)
        AlertSwal.succes("قرارداد بیمه ی مورد نظر با موفقیت حذف شد!")
        
        return res.data
    } catch (error) {
        AlertSwal.backEndError(error,"خطا در حذف قرارداد مرد نظر!")
        throw error
    }
    
    
   };

// Insurance Payments API
export const getInsuranceContractsForPaymentApi = async() =>{ 
    try {
        const res=await 
    apiClient.get("/insurance/payments/contracts");
    return res.data

    } catch (error) {
    AlertSwal.backEndError(error,"لیست قرار داد های بیمه دریافت نشد!")    
    throw error
    }
}
export const recordInsurancePaymentApi = async(payload:InsurancePaymentFormData) =>{

    try {
        const res= await apiClient.post("/insurance/payments", payload);
        AlertSwal.succes("واریزی بیمه با موفقیت ثبت شد.")
       return res.data
    } catch (error) {
        AlertSwal.backEndError(error,"ثبت واریزی بیمه با خطا روبرو شد!")
        throw error
    }
}

// Insurance Reports API
export const getInsurancePaymentReportsApi =async (params:getInsurancePaymentReports) => {

try {
    const res=await apiClient.get("/insurance/reports", { params });
    return res.data
} catch (error) {
    AlertSwal.backEndError(error,"خطا در دریافت گزارش های قرارداد!")
    throw error
}

}

// Insurance Transactions API
export const getInsurancePaymentTransactionsApi =async (params:InsurancePaymentTransactionsDTO) => {
    
try {
    const res=await   apiClient.get("/insurance/transactions", { params })
    return res.data
} catch (error) {
    AlertSwal.backEndError(error,"خطا در دریافت تراکنش های بیمه ی مورد نظر!")
    throw error
}

  

}

// Insurance Sessions API
export const getInsuranceSessionsApi = (params) => apiClient.get("/api/insurance/sessions", { params });

// Insurance Patient Debts API
export const getPatientInsuranceDebtsApi =async (params:PatientInsuranceDebtsDTO) =>{
    try {
        const res= await apiClient.get("/insurance/patient-debts", { params });
        return res.data
    } catch (error) {
        AlertSwal.backEndError(error,"خطا در دریافت حساب مراجعین! ")
        throw error
    }

} 
