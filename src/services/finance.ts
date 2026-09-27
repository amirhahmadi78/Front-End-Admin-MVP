import apiClient from "../api/client";
import type { DTOFindAppointments } from "../types/appointment";
import type {
  BatchPaymentRequest,

  BatchPaymentResult,
  DTOfinanceMonthSalaryTH,
  DTOget_finance_Patient,
  DTOget_finance_TH_PA,
  GetTherapiClientstBalanceDTO,
} from "../types/finance";
import type { AddSalary } from "../types/salary";
import { AlertSwal } from "../utils/errorSwal";

export const GetAppsSearch = async (payload: DTOFindAppointments) => {
  try {
    const res = await apiClient.get("/finance/appointment", {
      params: payload,
    });
    return res.data;
  } catch (error) {
    AlertSwal.backEndError(error, "خطا در دریافت خلاصه مالی جلسات!");
    throw error;
  }
};

export const GetAllfinancial = (params = {}) =>
  apiClient.get("/admin/GetAllfinancial", { params });

export const GetFinanceOfTherapiClientst = async (
  query: DTOget_finance_TH_PA,
) => {
  try {
    const res = await apiClient.get("/finance/therapistfinance", {
      params: query,
    });
    return res.data;
  } catch (error) {
    AlertSwal.backEndError(
      error,
      "خطای ناشناخته .  دریافت اطلاعات مالی یوزر مورد نظر ممکن نیست! ",
    );
    throw error;
  }
};

export const GetFinanceOfPatient = async (query: DTOget_finance_Patient) => {
  try {
    const res = await apiClient.get("/finance/patient", {
      params: query,
    });


    return res.data;
  } catch (error) {
    AlertSwal.backEndError(error, "خطا در دریافت اطلاعات مالی مراجع!");
    throw error;
  }
};

export const GetFinanceOfPatient_notpaid = async (query: DTOget_finance_Patient) => {
  try {
    const res = await apiClient.get("/finance/patient-notpaid", {
      params: query,
    });


    return res.data;
  } catch (error) {
    AlertSwal.backEndError(error, "خطا در دریافت اطلاعات مالی مراجع!");
    throw error;
  }
};

export const GetMonthlySalaries = async (YYYYMM: string) => {
  try {
    const res = await apiClient.get("/salary/monthreport", {
      params: {
        YYYYMM,
      },
    });
    return res.data;
  } catch (error) {
    AlertSwal.backEndError(
      error,
      "دریافت لیست حقوق ها و واریزی های ماه مورد نظر با مشکل روبرو شد!",
    );
    throw error;
  }
};

export const GetMonthlySalariesTherapiClientst = async (
  query: DTOfinanceMonthSalaryTH,
) => {
  try {
    const res = await apiClient.get("/finance/monthsalarytherapist", {
      params: query,
    });
    return res.data;
  } catch (error) {
    AlertSwal.backEndError(
      error,
      "خطا در دریافت اطلاعات درآمدی ماهانه درمانگر ها!",
    );
  }
};

export const GetTherapiClientstBalance = async (
  query: GetTherapiClientstBalanceDTO,
) => {
  try {
    const res = await apiClient.get("/salary/therapist-balance", {
      params: {
        therapistId: query.userId,
        yyyymm: query.YYYYMM,
      },
    });
    return res.data;
  } catch (error) {
    AlertSwal.backEndError(
      error,
      "دریافت وضعیت حقوق و واریز درمانگر مورد نظر با خطا رو برو شد!",
    );
    throw error;
  }
};

export const PostSalaryTransaction = async (payload: AddSalary) => {
  try {
    const res = await apiClient.post("/salary/", payload);
    AlertSwal.succes("ثبت تراکنش مربوط با حقوق با موفقیت انجام شد!");
    return res.data;
  } catch (error) {
    AlertSwal.backEndError(error, "ثبت تراکنش مربوط با حقوق با مشکل روبرو شد!");
    throw error;
  }
};

export const GetUnprocessedAppointments = async (params: {
  page: number;
  limit: number;
}) => {
  try {
    const res = await apiClient.get("/finance/unprocessedappointments", {
      params,
    });
    return res.data;
  } catch (error) {
    AlertSwal.backEndError(error, "خطا در دریافت جلسات نا هماهنگ از سرور!");
    throw error;
  }
};




export async function batchPaymentService(
  payload: BatchPaymentRequest
): Promise<BatchPaymentResult> {
  try {
      const { data } = await apiClient.post<BatchPaymentResult>(
    "/finance/batch-payment",
    payload
  );

  
  AlertSwal.succes(data?.result?.message ??"");
  
  return data;
  } catch (error) {
    AlertSwal.backEndError(error,"خطا در پرداخت انبوه")
    throw error
  }

}