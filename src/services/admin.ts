
import type { CreateAdminFormValues } from "../validation/admin/admin";
import apiClient from "../api/client";
import { AlertSwal } from "../utils/errorSwal";
import { logout } from "../api/auth/authAdmin";
import type { registerAppValues } from "../validation/RegisterApp";



export const PostcreateAdmin = async (data: CreateAdminFormValues) => {
  try {
    const response = await apiClient.post("/auth/admin/register", data);
    AlertSwal.succes("کارمند جدید با موفقیت ساخته شد!")
  return response.data;
  } catch (error) {
    
    AlertSwal.backEndError(error,"خطا در ساخت کارمند جدید!")
    throw error
  }
  
};

export const GetAdminsList = async () => {
  try {
     const response = await apiClient.get("/admin/", );
  return response.data;
  } catch (error) {
     AlertSwal.backEndError(error,"خطا در دریافت لیست کارکنان!")
     throw error
  }
 
};

export async function changePassWithPassword(oldPassword:string, newPassword:string) {
  try {
     const res=await apiClient.patch('/auth/admin/newpass',{oldPassword, newPassword});
     if(res.data.success==true){
      logout()
            AlertSwal.succes("رمز عبور با موفقیت تغییر یافت! لطفا مجدد وارد شوید!").then((x)=>{
       window.location.href = '/login';
            })


     
      return res.data
     }else {
          AlertSwal.backEndError(null,"خطا در تغییر رمز عبور")
     }
  } catch (error) {
    AlertSwal.backEndError(error,"خطا در تغییر رمز عبور")
    throw error
  }
 
}

export const DeleteAdmin = async (_id:string) => {
  try {
    const response = await apiClient.delete("/auth/admin", {params:{_id}});
    AlertSwal.succes("کارمند  با موفقیت حذف شد!")
  return response.data;
  } catch (error) {
    
    AlertSwal.backEndError(error,"خطا در حذف کارمند !")
    throw error
  }
  
};

export const PostRegsterAPP = async (data: registerAppValues) => {
  try {
    const response = await apiClient.post("/auth/register", data)
   await AlertSwal.succes("اپلیکیشن با موفقیت راه اندازی شد!")

        window.location.replace("/login");

          
           
        
          return response.data;
 
  
  } catch (error) {

    
    AlertSwal.backEndError(error,"خطا در راه اندازی اپ!!")
    throw error
  }
  
};

