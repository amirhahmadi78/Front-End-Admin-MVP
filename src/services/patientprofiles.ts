
import apiClient from "../api/client";
import type { CreatePatientProfileDto } from "../components/patientProfile/dto/CreatePatient.dto";



import { AlertSwal } from "../utils/errorSwal";

export const GetPatientProfileByPatient = async (patient:string) => {
  try {
    const res = await apiClient.get(`/patientprofile/${patient}`);
 
    
    return res.data;
  } catch (error) {
    AlertSwal.backEndError(error, "خطا در دریافت پرونده ی درمانی مراجع!");
    throw error;
  }
};

export const CreatePatientProfile = async (query:CreatePatientProfileDto) => {
  try {
    const res = await apiClient.post(`/patientprofile`,query);
    AlertSwal.succes("پرونده ی مراجع با موفقیت ویرایش یا ایجاد شد!")
    
    return res.data;
  } catch (error) {
    AlertSwal.backEndError(error, "خطا در تکمیل پرونده ی درمانی مراجع!");
    throw error;
  }
};