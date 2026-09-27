import apiClient from "../api/client";
import { AlertSwal } from "../utils/errorSwal";

export const PostPriceUpdate = async(payload) =>
{
    try {
        const res=await  apiClient.post("/defaults", payload);
        AlertSwal.succes("قیمت پیش فرض با موفقیت ثبت شد.") 
        return res.data
    } catch (error) {
        AlertSwal.backEndError(error,"خطا در ثبت قیمت پیش فرض!")
        throw error
    }
}

export const GetPriceAll =async() => {
  
    try {
        const res=await apiClient.get("/defaults/")


    return res.data
    } catch (error) {
        AlertSwal.backEndError(error,"دریافت قیمت های پیش فرض از سرور با شکست روبرو شد.")
        throw error
    }
    
}

// export const GetPricePartial =async () => apiClient.get("/defaults/get");
// {
//     try {
//         const res=await
//         AlertSwal.succes() 
//         return res.data
//     } catch (error) {
//         AlertSwal.backEndError(error,)
//         throw error
//     }
// }

export const DeletePrice = async(priceId:string) => 
{
    try {
        const res=await apiClient.delete(`/defaults`,{params:{priceId}});
        AlertSwal.succes("قیمت پیش فرض با موفقیت حذف گردید.") 
        return res.data
    } catch (error) {
        AlertSwal.backEndError(error,"خطا در حذف قیمت پیش فرض!")
        throw error
    }
}

export const PostRefresh = async() => 
{
    try {
        const res=await apiClient.post("/defaults/refresh-cache");
      
        return res.data
    } catch (error) {
        AlertSwal.backEndError(error,"خطا در بروزرسانی لیست قیمت ها!")
        throw error
    }
}