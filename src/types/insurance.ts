import type { insuranceCoverage, insuranceStatus } from "./enums";

export type newInsuranceContract = {
  name: string;
  code: string;
  contactPerson: string;

  phone: string;

  email: string;
  contractDate: Date;
  expiryDate: Date;

  status: insuranceStatus;

  coverage: insuranceCoverage[];
  discountRate: number;
};

export type editInsuranceContract = {
  _id: string;
  name: string;
  code: string;
  contactPerson: string;

  phone: string;

  email: string;
  contractDate: Date;
  expiryDate: Date;

  status: insuranceStatus;

  coverage: insuranceCoverage[];
  discountRate: number;
};

export type InsurancePaymentFormData = {
  amount: string; // اگر عدد باشه بگو تا اصلاح کنم
  date: Date | null; // یا مقدار تاریخ/DateObject بسته به کتابخانه تاریخ
  reference: string;
  description: string;
  status: "recorded" | "pending_verification" | "rejected";
  paymentType: "full" | "partial" | "advance";
  insuranceContractId: string; // شناسه انتخاب شرکت بیمه
};

export type getInsurancePaymentReports = {
   dateFrom: string,
    dateTo: string,
    status: string
}

export type InsurancePaymentTransactionsDTO ={
    insuranceContract: string;
    dateFrom: string;
    dateTo: string;
    minAmount: string;
    maxAmount: string;
    page:number
    limit:number
}

export type PatientInsuranceDebtsDTO={
    dateFrom: string;
    dateTo: string;
    insuranceContract: string;
    patientName: string;
    status: string;
    page: number;
    limit: number;
}