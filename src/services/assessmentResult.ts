
import type { AssessmentResult, AssessmentResultListResponse } from '../types/assessmentResult.types';
import type {
  CreateAssessmentResultPayload,
  SubmitAssessmentResultPayload,
  UpdateAssessmentResultPayload,
  ListAssessmentResultsParams,
} from '../types/assessmentResult.types';
import { AlertSwal } from '../utils/errorSwal';
import apiClient from '../api/client';

const ASSESSMENT_RESULTS_BASE = '/assessment-results';
export const AssessmentResultApi={

   list : async (
  params?: ListAssessmentResultsParams,
): Promise<AssessmentResultListResponse> => {
  try {
    const res = await apiClient.get<AssessmentResultListResponse>(
      ASSESSMENT_RESULTS_BASE,
      { params },
    );
    return res.data;
  } catch (error) {
    AlertSwal.backEndError(error, 'دریافت نتایج ارزیابی ناموفق بود.');
    throw error;
  }
},

 ById : async (
  id: string,
): Promise<AssessmentResult> => {
  try {
    const res = await apiClient.get<AssessmentResult>(
      `${ASSESSMENT_RESULTS_BASE}/${id}`,
    );
    return res.data;
  } catch (error) {
    AlertSwal.backEndError(error, 'دریافت جزئیات نتیجه ارزیابی ناموفق بود.');
    throw error;
  }
},

create: async (
  payload: CreateAssessmentResultPayload,
): Promise<AssessmentResult> => {
  try {
    const res = await apiClient.post<AssessmentResult>(
      ASSESSMENT_RESULTS_BASE,
      payload,
    );
    AlertSwal.succes('ارزیابی با موفقیت ایجاد شد.');
    return res.data;
  } catch (error) {
    AlertSwal.backEndError(error, 'ایجاد نتیجه ارزیابی ناموفق بود.');
    throw error;
  }
},

 update : async (
  id: string,
  payload: UpdateAssessmentResultPayload,
): Promise<AssessmentResult> => {
  try {
    const res = await apiClient.patch<AssessmentResult>(
      `${ASSESSMENT_RESULTS_BASE}/${id}`,
      payload,
    );
    AlertSwal.succes('نتیجه ارزیابی به‌روزرسانی شد.');
    return res.data;
  } catch (error) {
    AlertSwal.backEndError(error, 'به‌روزرسانی نتیجه ارزیابی ناموفق بود.');
    throw error;
  }
},

 submit : async (
  id: string,
  payload: SubmitAssessmentResultPayload,
): Promise<AssessmentResult> => {
  try {
    const res = await apiClient.post<AssessmentResult>(
      `${ASSESSMENT_RESULTS_BASE}/${id}/submit`,
      payload,
    );
    AlertSwal.succes('ارزیابی با موفقیت ثبت نهایی شد.');
    return res.data;
  } catch (error) {
    AlertSwal.backEndError(error, 'ثبت نهایی ارزیابی ناموفق بود.');
    throw error;
  }
},

cancel : async (
  id: string,
): Promise<AssessmentResult> => {
  try {
    const res = await apiClient.post<AssessmentResult>(
      `${ASSESSMENT_RESULTS_BASE}/${id}/cancel`,
    );
    AlertSwal.succes('ارزیابی لغو شد.');
    return res.data;
  } catch (error) {
    AlertSwal.backEndError(error, 'لغو ارزیابی ناموفق بود.');
    throw error;
  }
},

 delete: async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`${ASSESSMENT_RESULTS_BASE}/${id}`);
    AlertSwal.succes('نتیجه ارزیابی حذف شد.');
  } catch (error) {
    AlertSwal.backEndError(error, 'حذف نتیجه ارزیابی ناموفق بود.');
    throw error;
  }
},

details:async (id: string): Promise<void> => {
  try {
   const res= await apiClient.get(`${ASSESSMENT_RESULTS_BASE}/details/${id}`);
   return res.data
  } catch (error) {
    AlertSwal.backEndError(error, 'حذف نتیجه ارزیابی ناموفق بود.');
    throw error;
  }
}
}
