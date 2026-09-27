import apiClient from "../api/client";
import type { DTOeditTherapist, DTOfindTherapists, DTOmakeTherapist } from "../types/therapists";
import { AlertSwal } from "../utils/errorSwal";

export const  GetTherapists=async (query?:DTOfindTherapists)=>{
  try {
    const res=await apiClient.get("/therapists",{
    params:query
})


return res.data
  } catch (error) {
    AlertSwal.backEndError(error,"خطا در دریافت لیست درمانگران!")
    throw error
  }


}

export const PostMakeTherapist = async(payload:DTOmakeTherapist) =>{
  try {
    const res=await apiClient.post("/therapists/addtherapist", payload);

  AlertSwal.succes("درمانگر جدید ثبت نام شد.")
    return res.data
  } catch (error) {

    
    AlertSwal.backEndError(error,"خطا در ثبت نام درمانگر جدید!")
    throw error
  }
  


}


export const PostEditTherapist = async(payload:DTOeditTherapist) =>{
try {

  
  const res=await   apiClient.patch("/therapists/edittherapist", payload);
   AlertSwal.succes("درمانگر ویرایش شد.")
  return res.data
} catch (error) {
  AlertSwal.backEndError(error,"خطا در ویرایش اطلاعات درمانگر!")
  throw error
}
}


export const DeleteTherapist = async(id:string) =>{
try {
  const res=await  apiClient.delete("/therapists/deletetherapist", {
    params:{id}
  });
  AlertSwal.succes("درمانگر حذف شد و به آرشیو رفت.")
  return res.data
} catch (error) {
    AlertSwal.backEndError(error,"خطا در آرشیو درمانگر!")
  throw error
}
}
 


