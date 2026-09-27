import apiClient from "../api/client";
import { AlertSwal } from "../utils/errorSwal";

export const PatchUpdateGroup =async ( payload) =>{
  try {
    const res=await  apiClient.patch(`/appointments/group`, { ...payload });
    AlertSwal.succes("جلسه ی گروهی با موفقیت ویرایش شد!")
    return res.data
  } catch (error) {
    AlertSwal.backEndError(error,"خطا در ویرایش جلسه ی درمانی!")
    throw error
  }
}
 

export const PostGroupPayment =async (payload) =>{
  try {
    const res=await apiClient.post("/appointments/paygroup", payload);
    AlertSwal.succes("پرداخت مراجع با موفقیت ثبت شد!")
    return res.data
  } catch (error) {
    AlertSwal.backEndError(error,"خطا در ثبت پرداخت درمانگر!")
    throw error
  }
}
  

export const PostRemoveGroupPayment = async (payload) =>{
  try {
    const res=await apiClient.post("/appointments/unpaygroup", payload);
    AlertSwal.succes("پرداخت مراجع با موفقیت حذف شد!")
    return res.data
  } catch (error) {
    AlertSwal.backEndError(error,"خطا در حذف پرداخت درمانگر!")
    throw error
  }
}
  

export const PostAddGroup = async (payload) => {
  try {
  
    
    const res = await apiClient.post("/appointments/group", payload);
    AlertSwal.succes("افزودن جلسه ی گروهی با موفقیت انجام شد!");
    return res.data;
  } catch (error) {
  
    
    AlertSwal.backEndError(error,"ایجاد کلاس گروهی با خطا روبرو شد!")
    throw error
  }
};

export const PatchChangegroupStatus = async(payload) =>{
  try {
    const res=await   apiClient.patch("/appointments/status-group", { ...payload });
    AlertSwal.succes("تغییر وضعیت جلسه ی گروهی با موفقیت انجام شد!")
    return res.data
  } catch (error) {
    AlertSwal.backEndError(error,"تغییر وضعیت جلسه ی گروهی با شکست روبرو شد!")
    throw error
  }
}

