import apiClient from "../api/client";
import type { StatusLeavesTherapistType } from "../types/enums";
import type { Aprove_Reject_leaveR, DTOFindTherapistLeave, ICreateLeaveRequestDTO } from "../types/leaves";
import { AlertSwal } from "../utils/errorSwal";

export const GetFindLeaveRequestsTherapist = async(query:DTOFindTherapistLeave) =>{
  try {
     const res=await apiClient.get("/THleaverequests", { params:query });
     return res.data
  } catch (error) {
    AlertSwal.backEndError(error,"دریافت مرخصی های درمانگران نا موفق بود.")
    throw error
  }


}


export const PostApproveRejectLeaveRequest =async (payload:Aprove_Reject_leaveR) =>{
  try {
   const res=await apiClient.post("/THleaverequests/response", payload);
   AlertSwal.succes(`درخواست مرخصی با موفقیت ${
            payload?.status === "approved" ? "تایید" : "رد"
          } شد`)
   return res.data

} catch (error) {
  AlertSwal.backEndError(error,"رد یا تایید مرخصی با شکست رو برو شد!")
  throw error
}

}


export const GetPendingLeaveRequestsCount = async() =>{
  try {
     const res=await apiClient.get("/THleaverequests/pending-count");
     return res.data
  } catch (error) {
    AlertSwal.backEndError(error,"خطا در دریافت تعداد مرخصی های تایید نشده!")
    throw error
  }
}


export const GetDayLeaveRequests =async (date:string,status:StatusLeavesTherapistType[]) =>{
  try {
     const res=await apiClient.get("/THleaverequests/day", { params: { date,status } });
 return res.data
  } catch (error) {
        AlertSwal.backEndError(error,"دریافت مرخصی های درمانگران نا موفق بود.")
    throw error
  }

}
 
  
export const GetLeavesApproved = (query:Date) =>
  apiClient.get("/admin/approved", { params: { date } });



export const DeleteLeaveRequest=async(LeaveId)=>{
try {
  const res=await apiClient.delete("/THleaverequests",{params:{LeaveId}});
    AlertSwal.succes("مرخصی با موفقیت حذف شد.")
  return res.data

} catch (error) {
  AlertSwal.backEndError(error,"خطا در حذف مرخصی!")
  throw error
}
}

export const PostCreateLeaveRequestTH =async (payload:ICreateLeaveRequestDTO) =>{
  try {
   const res=await apiClient.post("/THleaverequests", payload);
   AlertSwal.succes("درخواست مرخصی با موفقیت ثبت شد.")
   return res.data

} catch (error) {
  AlertSwal.backEndError(error,"ثبت مرخصی با شکست رو برو شد!")
  throw error
}

}