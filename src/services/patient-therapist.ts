import apiClient from "../api/client";
import { AlertSwal } from "../utils/errorSwal";

export type payload_Relate = {
  patientId: string;
  therapistId: string;
};

export type Get_Relate = {
  patientId: string|number;
  therapistId: string|number;
};

export const Postaddpatienttotherapist = async (payload: payload_Relate) => {
  try {
    const res = await apiClient.post("/p-t/", payload);
    AlertSwal.succes("مراجع و درمانگر یه لیست یکدیگر افزوده شدند.");
    return res.data;
  } catch (error) {
    AlertSwal.backEndError(
      error,
      "خطا ی ناشناخته در افزودن درمانگر و مراجع به لیست یکدیگر!",
    );
    throw error;
  }
};

export const Deleteremovepatienttotherapist = async (payload: payload_Relate) => {
  try {
    const res = await apiClient.delete("/p-t/", {
      params: payload,
    });
  
    
    AlertSwal.succes("مراجع و درمانگر از لیست یکدیگر حذف شدند.");
    return res.data;
  } catch (error) {
    AlertSwal.backEndError(
      error,
      "خطا ی ناشناخته در حذف درمانگر و مراجع از لیست یکدیگر!",
    );
    throw error;
  }
};

export const GetCheckRelate = async (payload: Get_Relate) => {
  try {
 
    
    const res = await apiClient.get("/p-t/", { params: payload });
    return res.data;
  } catch (error) {
    AlertSwal.backEndError(
      error,
      "خطای نا شناخته در بررسی رابطه ی مراجع و درمانر!",
    );
    throw error;
  }
};
