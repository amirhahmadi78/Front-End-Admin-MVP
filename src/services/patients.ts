import apiClient from "../api/client";
import type { DTOeditPatient, DTOFindPatient, DTOmakePatient } from "../types/patients";
import { AlertSwal } from "../utils/errorSwal";



 export const  GetFindPatients=async(query:DTOFindPatient)=>{
  try {

   
    
     const res=await apiClient.get("/patients",{
    params:query
  })


  
  return res.data
  } catch (error) {
    AlertSwal.backEndError(error,"خطا در دریافت لیست مراجعین!")
    throw error
  }

 }


export const PostMakePatient = async(payload: DTOmakePatient) =>{
  try {

    const res=await   apiClient.post("/patients/", payload);
    AlertSwal.succes("مراجع جدید با موفقیت ثبت نام شد.")
    return res.data
  } catch (error) {
    AlertSwal.backEndError(error,"خطا در ثبت نام مراجع جدید!")
    throw error
    
  }
}


export const PostEditPatient =async (payload:DTOeditPatient) =>{
try {
  
  const res=await   apiClient.patch("/patients/", payload);
      AlertSwal.succes("مراجع  با موفقیت ویرایش شد.")
  return res.data
} catch (error) {
   AlertSwal.backEndError(error,"خطا در ثبت نام مراجع جدید!")
    throw error
}
}


export const DeletePatient = async(id:string) =>{
try {
  const res= await   apiClient.delete("/patients/", {params:{id}});
      AlertSwal.succes("مراجع با موفقیت آرشیو شد.")
  return res.data
} catch (error) {
  AlertSwal.backEndError(error,"خطا در آرشیو مراجع !")
    throw error
}
}


export const Getcheckpatient = async(patientId,page) =>{
  try {
    const res=await apiClient.get("/patients/check", {
    params: {
      patientId,
      page
    },
  });
  return res.data
  } catch (error) {
    AlertSwal.backEndError(error,"خطا در دریافت مشصات تحلیلی مراجع!")
    throw error
  }
}

  export const GetOnePatient =async (_id) =>{
const res=await apiClient.get("/patients", {
    params: {
      _id,
    },
  })
  return res.data
  }
  


  export const GetTodayPatients=(day)=>
    apiClient.get("/admin/daypatients",{
      params:{
        day
      }
    })

    export const patientsForTherapist = async () => {
  try {
    const res = await apiClient.get(`/patients/fortherapist`);
 

    
    return res.data;
  } catch (error) {
    AlertSwal.backEndError(error, "خطا در دریافت لیست مراجعین !");
    throw error;
  }
};



