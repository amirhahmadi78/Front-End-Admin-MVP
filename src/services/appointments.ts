import Swal from "sweetalert2";
import apiClient from "../api/client";
import type {
  ChangeStatusDTO,
  DTOEditAppointment,
  DTOFindAppointments,
  DTONewAppointment,
} from "../types/appointment";

import { AlertSwal } from "../utils/errorSwal";

export const FindAppointment = async (query?: DTOFindAppointments) => {
  try {
    const res = await apiClient.get("/appointments", {
      params: query,
    });
    return res.data;
  } catch (error) {
    AlertSwal.backEndError(error, "خطا در دریافت لیست جلسات درمانی!");
    throw error;
  }
};

export const GetAppDetails = async (appointmentId: string) => {
  try {
    const res = await apiClient.get("/appointments/details", {
      params: {
        appointmentId,
      },
    });
    return res.data;
  } catch (error) {
    AlertSwal.backEndError(error, "خطا در دریافت جزئیات جلسه ی مورد نظر!");
  }
};

export const GetDailySchedule = () => {};

export const PostCreateAppointment = async (payload: DTONewAppointment) => {
  try {
    const res = await apiClient.post("/appointments", payload);
    AlertSwal.succes("جلسه ی درمانی با موفقیت ثبت شد.");
    return res.data;
  } catch (error) {

    
    AlertSwal.backEndError(error, "خطا در ثبت جلسه ی درمانی جدید!");
    throw error;
  }
};

export const PostDeleteAppointment = async (appointmentId: string) => {
  try {
    const res = await apiClient.delete("/appointments", {
      params: { appointmentId },
    });
    AlertSwal.succes("جلسه ی درمانی با موفقیت حذف شد.");
    return res.data;
  } catch (error) {

    
    AlertSwal.backEndError(error, "خطا در حذف جلسه ی درمانی !");
    throw error;
  }
};

export const PostChangeStatus = async (query: ChangeStatusDTO) => {
  try {
  const res= await apiClient.patch("/appointments/status", query);
  AlertSwal.succes("وضعیت جلسه ی درمانی با موفقیت تغییر یافت!")
   return  res.data
    
      
  } catch (error) {
    AlertSwal.backEndError(
      error,
      "خطا در تغییر وضعیت جلسه ی درمانی!",
    );
    throw error
  }
};

export const PatchEditAppointment = async (payload: DTOEditAppointment) => {
  try {
    const res = await apiClient.patch("/appointments", payload);

    AlertSwal.succes("جلسه ی درمانی با موفقیت ویرایش شد.");
   

    return res.data;
  } catch (error) {
    AlertSwal.backEndError(error, "خطا در ویرایش جلسه ی درمانی جدید!");
    throw error;
  }
};

export const PostPublishDef = async (date: Date) => {
  try {
    const res = await apiClient.post("/defappointment/publish", {
      date,
    });

    AlertSwal.succes("برنامه ثابت امروز با موفقیت ساخته شد..");
    return res.data;
  } catch (error) {
    AlertSwal.backEndError(error, "خطا در ایجاد برنامه ثابت!!");
    throw error;
  }
};
