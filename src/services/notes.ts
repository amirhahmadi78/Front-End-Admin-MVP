import apiClient from "../api/client";
import { AlertSwal } from "../utils/errorSwal";

export const GetAdminNotes = async (date: Date) => {
    try {
         const res= await apiClient.get("/notes/find", { params: { date },});
         return res.data
    } catch (error) {
        AlertSwal.backEndError(error,"دریافت یادداشت ها با مشکل روبرو شد!")
        throw error
    }

};

export const GetAllAdminNotes = async () => {
    try {
         const res= await apiClient.get("/notes");
         return res.data
    } catch (error) {
        AlertSwal.backEndError(error,"دریافت یادداشت ها با مشکل روبرو شد!")
        throw error
    }

};




export const PostAdminNote = async(payload) => {
    
    try {
        const res=await    apiClient.post("/notes", payload);
        AlertSwal.succes("یادداشت با موفقیت ثبت شد.")
        return res.data
    } catch (error) {
        AlertSwal.backEndError(error,"خطا در ایجاد یادداشت!")
            throw error
    }



}
export const PatchAdminNote = async(payload) => {
    
    try {
        const res=await      apiClient.patch(`/notes`, payload);
        AlertSwal.succes("یادداشت با موفقیت ویرایش شد.")
        return res.data
    } catch (error) {
        AlertSwal.backEndError(error,"خطا در ویرایش یادداشت!")
            throw error
    }



}

export const DeleteAdminNote = async(id) => {
    
    try {
        const res=await      apiClient.delete(`/notes/`,{params:{id}});
        AlertSwal.succes("یادداشت با موفقیت حذف شد.")
        return res.data
    } catch (error) {
        AlertSwal.backEndError(error,"خطا در حذف یادداشت!")
        throw error
    }}

   
