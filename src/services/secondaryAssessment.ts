
import apiClient from "../api/client";

import type { CreateSecondaryAssessmentDTO, GetPatientSecondaryAssessmentDTO, SearchSecondaryAssessmentDTO, UpdateSecondaryAssessmentDTO } from "../components/patientprofile/patientAssesments/secondaryAssessment/dto/secondaryAssessmentDTO";


import { AlertSwal } from "../utils/errorSwal";


export const UpdateSecondaryAssessment = async (data:UpdateSecondaryAssessmentDTO) => {
  try {
    const res = await apiClient.patch(`/secondaryassessment/${data._id}`,data);
     AlertSwal.succes("ارزیابی ثانویه با موفقیت ویرایش شد!")
    
    return res.data;
  } catch (error) {
     AlertSwal.backEndError(error, "خطا در ویرایش ارزیابی!");
    throw error;
  }
};

export const CreataSecondaryAssessment = async (query:CreateSecondaryAssessmentDTO) => {
  try {
    const res = await apiClient.post(`/secondaryassessment`,query);
    AlertSwal.succes("ارزیابی ثانویه با موفقیت ثبت شد!")
    
    return res.data;
  } catch (error) {
    AlertSwal.backEndError(error, "خطا در ثبت ارزیابی!");
    throw error;
  }
};


export const FindSecondaryAssessment = async (data:SearchSecondaryAssessmentDTO) => {
  try {
    const res = await apiClient.get(`/secondaryassessment`,{params:data});
 
    
    return res.data;
  } catch (error) {
    AlertSwal.backEndError(error, "خطا در دریافت ارزیابی های مراجع!");
    throw error;
  }
};

export const GetPatientSecondaryAssessment = async (data:GetPatientSecondaryAssessmentDTO) => {
  try {
    const res = await apiClient.get(`/secondaryassessment/patient`,{params:data});
 
    
    return res.data;
  } catch (error) {
    AlertSwal.backEndError(error, "خطا در دریافت ارزیابی های مراجع!");
    throw error;
  }
};