export type DTOget_finance_TH_PA={
      startDay:string
        endDay:string
        therapistId:string
        page:number
        limit:number
}


export type DTOfinanceMonthSalaryTH={
    YYYYMM:string, therapistId:string
}

export type DTOget_finance_Patient={
      startDay:string
        endDay:string
        patientId:string
}

export type GetTherapiClientstBalanceDTO={
  userId:string, YYYYMM:string
}

// src/types/finance.ts

export type PaymentMethod = "card" | "transfer" | "cash" | "wallet";

// export interface PaymentMethod{
//   paidAt?: string;
//   status_clinic?: string;
// }

export interface BatchPaymentValues {
  patientId: string;
  startDate: Date; // مقدار خام از والد (pickr or date input)
  endDate: Date;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  description:string
}

/// نوعی که از سرویس برمیگرده (پاسخ بک‌اند>
export interface BatchPaymentResponseItem {
  _id: string;
  patient?: string;
  therapistName?: string;
  start?: string | Date;
  sessionType?: "individual" | "group";
  payment?: PaymentMethod;
  paidAt?: string;
  status_clinic?: string;
}



export interface BatchPaymentResult {
  success: boolean;
  message: string;
  appointments: BatchPaymentResponseItem[];
  totalDebt: number;
  usedAmount: number;
  remainingInWallet: number;
  /// فیلدهای حالت خالی
  totalCost?: number;
}

export interface BatchPaymentRequest{      // ISO 8601
  totalAmount: number;
  paymentMethod: PaymentMethod;
}
