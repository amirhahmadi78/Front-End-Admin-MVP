import apiClient from "../api/client";
import { AlertSwal } from "../utils/errorSwal";

  export const GetArchivePatients =async () => 
{
    try {
        const res= await apiClient.get("/archive/patient");
        return res.data
    } catch (error) {
        AlertSwal.backEndError(error,"خطا در دریافت لیست مراجعین آرشیو شده!")
        throw error
    }
}
export const PostPatientRestore =async (original_id) =>
    {
    try {
        const res= await   apiClient.post("/archive/patient", {original_id});
        AlertSwal.succes('مراجع با موفقیت بازیابی شد.')
        return res.data
    } catch (error) {
        AlertSwal.backEndError(error,"خطا در بازیابی مراجع!")
        throw error
    }
}




export const DeleteDestroyPatient = async(original_id) =>
      {
    try {
        const res= await  apiClient.delete("/archive/patient", {
     params:{original_id}});

        AlertSwal.succes('مراجع با موفقیت حذف شد.')
        return res.data
    } catch (error) {
        AlertSwal.backEndError(error,"خطا در حذف مراجع!")
        throw error
    }
}
 



export const GetArchiveTherapists = async() => 
{
    try {
        const res= await apiClient.get("/archive/therapists");
        return res.data
    } catch (error) {
        AlertSwal.backEndError(error,"خطا در دریافت لیست درمانگران!")
        throw error
    }
}
export const PostTherapistRestore = async(original_id) =>
      {
    try {
        const res= await   apiClient.post("/archive/therapist", {original_id});
        AlertSwal.succes('درمانگر با موفقیت بازیابی شد!')
        return res.data
    } catch (error) {
        AlertSwal.backEndError(error,"خطا در بازیابی درمانگر!")
        throw error
    }
}




export const DeleteDestroyTherapist = async(original_id) =>  {
    try {
        const res= await  apiClient.delete("/archive/therapist", {
     params:{original_id}});

        AlertSwal.succes('درمانگر با موفقیت حذف شد!')
        return res.data
    } catch (error) {
        AlertSwal.backEndError(error,"خطا در حذف درمانگر!")
        throw error
    }
}
 