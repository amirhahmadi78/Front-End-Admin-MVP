import apiClient from "../api/client";
import { AlertSwal } from "../utils/errorSwal";

// Patient Leaves API
export const GetPatientLeaves = async (date?: Date) => {
  try {
    const res = await apiClient.get("/PAleaverequests", { params: { date } });
    return res.data;
  } catch (error) {
    AlertSwal.backEndError(error,"دریافت مرخصی های مراجعین با خطا روبرو شد!");
    throw error;
  }
};

export const PostPatientLeave = async (payload) => {
  try {
    const res = await apiClient.post("/PAleaverequests", payload);
    AlertSwal.succes("ثبت مرخصی مراجع جدید با موفقیت انجام شد!");
    return res.data;
  } catch (error) {
    AlertSwal.backEndError(error, "خطا در ثبت مرخصی جدید مراجع !");
    throw error;
  }
};
export const PutPatientLeave = async (payload) => {
  try {
    const res = await apiClient.put(`/PAleaverequests`, payload);
    AlertSwal.succes("ویرایش مرخصی مراجع با موفقیت انجام شد!");
    return res.data;
  } catch (error) {
    AlertSwal.backEndError(error, "خطا در ویرایش مرخصی مراجع !");
    throw error;
  }
};

export const DeletePatientLeave = async (id) => {
  try {
    const res = await apiClient.delete(`/PAleaverequests`,{params:{id}});
    AlertSwal.succes("حذف مرخصی مراجع با موفقیت انجام شد!");
    return res.data;
  } catch (error) {
    AlertSwal.backEndError(error, "خطا در حذف مرخصی مراجع !");
    throw error;
  }
};
