import apiClient from "../api/client";
import type { AtLeastOne, editDefAppDto, NewDefAppDto, TherapistQuery } from "../types/defAppointment";
import { AlertSwal } from "../utils/errorSwal";


export const GetDailyDefAppointmets = (day) =>
  apiClient.get("/defappointment/dailydef", {
    params: {
      day,
    },
  });

export const Get_Day_therapist_Def = async (
  params: AtLeastOne<TherapistQuery>,
) => {

  try {
    const res = await apiClient.get("/defappointment/dailydef", {
      params,
    })
    return res.data;
  } catch (error) {
    AlertSwal.backEndError(error,"خطا در دریافت برنامه ثابت!")
    throw error;
  }
};

export const PostAddDefAppointment = async(payload:NewDefAppDto) =>{
try {
  const res=await apiClient.post("/defappointment/", payload);

  
  AlertSwal.succes("افزودن یک جلسه ثابت با موفقیت انجام شد.")
  return res.data
} catch (error) {

  
  AlertSwal.backEndError(error,"خطای ناشناخته سرور در ایجاد جلسه ی ثابت جدید!!")
  throw error
}

}
  

export const PatchEditDefAppointment = async(payload:editDefAppDto) =>{
  try {
    const res=await apiClient.patch("/defappointment/", payload);

    AlertSwal.succes("ویرایش جلسه ی ثابت مورد نظر با موفقیت انجام شد.")
        return res.data
  } catch (error) {
    AlertSwal.backEndError(error,"ویرایش جلسه ی ثابت مورد نظر با شکست روبرو شد!")
    throw error
  }
  
}
 

export const DeleteDefAppointment =async (_id:string) =>{
  try {
   const res=await  apiClient.delete("/defappointment/", {params:{
    _id
   }});
   AlertSwal.succes("حذف جلسه ی ثابت با موفقیت انجام شد.")
   return res.data
  } catch (error) {
    AlertSwal.backEndError(error,"حذف با خطای سرور روبرو شد!")
  }
}
 

export const Getdailydefpatient = (patientId) =>
  apiClient.get("/defappointment/getdailydefpatient", {
    params: {
      patientId,
    },
  });

export const GetWeeklydeftherapist = (therapistId) =>
  apiClient.get("/defappointment/getdailydeftherapist", {
    params: {
      therapistId,
    },
  });
