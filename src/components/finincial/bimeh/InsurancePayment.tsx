import "./InsurancePayment.css";
import DatePicker from "react-multi-date-picker";

import { useGetSignInsurance, useInsureRecord } from "../../../hooks/insurance";

import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { insurancePaymentSchema } from "../../../validation/insurance/insuranceContract";

import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { useEffect } from "react";

const InsurancePayment = () => {
  const {
    data: insurances = [],
    isLoading,
    refetch,
  } = useGetSignInsurance();
const {mutate:recosdeInsure}=useInsureRecord()
  // -----------------  FORM -----------------
  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(insurancePaymentSchema),
    defaultValues: {
      insuranceContractId: "",
      amount: "",
      date: null,
      reference: "",
      description: "",
      paymentType: "full",
      status: "recorded",
    },
  });
useEffect(()=>{refetch()},[])
  const selectedInsuranceId = watch("insuranceContractId");

  const selectedInsuranceDetails =Array.isArray(insurances)&& insurances?.find(
    (i) => i._id === selectedInsuranceId
  )||[]

  // -----------------  SUBMIT -----------------
  const onSubmit = async (formData) => {
    const payload = {
      ...formData,
      date: formData.date?.toISOString(),
      amount: Number(formData.amount),
    };

    recosdeInsure(payload);
refetch()
    reset();
  
  };

  return (
    <div className="insurance-payment">
      <h2>ثبت واریزی از بیمه</h2>

      <div className="payment-form-container">
        {isLoading && (
          <div className="loading-overlay">در حال بارگذاری...</div>
        )}

        <div className="payment-form-card">

          {/* ----------------- انتخاب شرکت بیمه ----------------- */}
          <div className="form-section">
            <h3><i className="fas fa-hospital"></i> انتخاب شرکت بیمه</h3>

            <label>شرکت بیمه *</label>
            <select
              {...register("insuranceContractId")}
              className="insurance-select"
              disabled={isLoading}
            >
              <option value="">-- انتخاب شرکت بیمه --</option>

              {Array.isArray(insurances)&& insurances.map((insurance) => (
                <option key={insurance._id} value={insurance._id}>
                  {insurance.name} - کد: {insurance.code}
                </option>
              ))}
            </select>
            <p className="error">{errors.insuranceContractId?.message}</p>

            {selectedInsuranceDetails && (
              <div className="insurance-summary">
                <h4>اطلاعات حساب</h4>

                <div className="summary-grid">

                  <div className="summary-item">
                    <span>مجموع بدهی:</span>
                    <strong>{(selectedInsuranceDetails.totalDebtAmount || 0).toLocaleString("fa-IR")} تومان</strong>
                  </div>

                  <div className="summary-item">
                    <span>مجموع واریزی:</span>
                    <strong>{(selectedInsuranceDetails.totalPaidAmount || 0).toLocaleString("fa-IR")} تومان</strong>
                  </div>

                  <div className="summary-item">
                    <span>مانده حساب:</span>
                    <strong className={(selectedInsuranceDetails.currentBalance || 0) >= 0 ? "positive" : "negative"}>
                      {(selectedInsuranceDetails.currentBalance || 0).toLocaleString("fa-IR")} تومان
                    </strong>
                  </div>

                </div>
              </div>
            )}
          </div>

          {/* ----------------- فرم واریزی ----------------- */}
          <div className="form-section">
            <h3><i className="fas fa-credit-card"></i> مشخصات واریز</h3>

            <form onSubmit={handleSubmit(onSubmit)}>

              <label>مبلغ:</label>
              <input type="number" {...register("amount")} placeholder="مبلغ" />
              <p className="error">{errors.amount?.message}</p>

              <label>تاریخ واریز:</label>
              <Controller
                control={control}
                name="date"
                render={({ field }) => (
                  <DatePicker
                    value={field.value}
                    onChange={(v) => field.onChange(v ? v.toDate() : null)}
                    calendar={persian}
                    locale={persian_fa}
                    format="YYYY/MM/DD"
                  />
                )}
              />
              <p className="error">{errors.date?.message}</p>

              <label>نوع پرداخت:</label>
              <select {...register("paymentType")}>
                <option value="full">پرداخت کامل</option>
                <option value="partial">پرداخت جزئی</option>
                <option value="advance">پیش پرداخت</option>
              </select>
              <p className="error">{errors.paymentType?.message}</p>

              <label>وضعیت:</label>
              <select {...register("status")}>
                <option value="recorded">پرداخت شده</option>
                <option value="pending_verification">در انتظار تایید</option>
                <option value="rejected">رد شده</option>
              </select>
              <p className="error">{errors.status?.message}</p>

              <label>شماره ارجاع:</label>
              <input {...register("reference")} placeholder="شماره ارجاع" />
              <p className="error">{errors.reference?.message}</p>

              <label>توضیحات (اختیاری):</label>
              <textarea {...register("description")} placeholder="توضیحات" />
              <p className="error">{errors.description?.message}</p>

              <button type="submit">ثبت واریزی</button>

            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default InsurancePayment;
