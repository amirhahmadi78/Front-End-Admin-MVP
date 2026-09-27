



import { yupResolver } from "@hookform/resolvers/yup";

import { useFieldArray, useForm, useWatch } from "react-hook-form";


import {  useEffect } from "react";

import { useTherapists } from "../../hooks/therapist";
import { AddPatientschema } from "../../validation/patients/AddPatient";
import { useGetFintInsuranceContract } from "../../hooks/insurance";



export default function PatientForm({onSubmit,onCancel,editingPatient}){


  const {data:allInsurances,refetch:FindInsurances}=useGetFintInsuranceContract()
const {data:allTherapist}=useTherapists({})
  const { register, control, handleSubmit, formState: { errors }, reset, watch } = useForm({
    resolver: yupResolver(AddPatientschema),
    defaultValues: editingPatient
  });


  // watch کردن مقدار paymentType از فرم
  const watchedPaymentType = useWatch({
    control,
    name: "paymentType"
  });

  // وقتی editingPatient تغییر می‌کند، لیست بیمه‌ها را لود کن و فرم را ریست کن
useEffect(() => {
  if (editingPatient && allTherapist) {
    // 1. تبدیل آبجکت به ID (برای اینکه Select بفهمه)
    const formattedPatient = {
      ...editingPatient,
      // اگر آبجکت بود _id رو بردار، اگر نبود خودش رو بذار، اگر خالی بود ""
      introducedBy: typeof editingPatient.introducedBy === "object" 
        ? editingPatient.introducedBy?._id 
        : (editingPatient.introducedBy || ""),
        
      // بقیه فیلدها هم اگر نال بودند به مقدار خالی تبدیل بشن که با Yup تداخل نداشته باشن
      bimehKind: editingPatient.bimehKind || "",
    };

    // 2. هندل کردن وضعیت بیمه و ریست کردن نهایی
    if (editingPatient.paymentType === "bimeh" && allInsurances.length === 0) {
      FindInsurances().then(() => {
        reset(formattedPatient);
      });
    } else {
      reset(formattedPatient);
    }
  }
}, [editingPatient, reset, allTherapist?.length]); // حتما طول لیست درمانگرها رو اضافه کن

  // اگر نوع پرداخت بیمه است، لیست بیمه‌ها را بارگذاری کن
  useEffect(() => {
    if (watchedPaymentType === "bimeh" && allInsurances.length === 0) {
      FindInsurances();
    }
  }, [watchedPaymentType]);
 const { fields, append, remove } = useFieldArray({
    control,
    name: "workDays",
  });



  return(
     <form onSubmit={handleSubmit(onSubmit)} >
      
              <label>نام</label>
              <input type="text" placeholder="نام مراجع..." {...register("firstName")} />
                {errors.firstName && (
          <p className="error-message">{errors.firstName.message}</p>
        )}
               <label> نام خانوادگی</label>
              <input type="text" placeholder="نام خانوادگی مراجع..." {...register("lastName")}/>
                 {errors.lastName && (
          <p className="error-message">{errors.lastName.message}</p>
        )}
    

              <label>نوع پرداخت</label>
               <select id="mySelect" {...register("paymentType")} onChange={(e) => {
                 if (e.target.value === "bimeh" && allInsurances.length === 0) {
                   FindInsurances();
                 }
               }}>
        <option value="naghd">نقدی</option>
        <option value="bimeh">بیمه</option>
      </select>
       {errors.paymentType && (
          <p className="error-message">{errors.paymentType.message}</p>
        )}

      {watchedPaymentType === "bimeh" && (
        <>
          <label>نوع بیمه</label>
          <select {...register("bimehKind")}>
            <option value="">انتخاب بیمه</option>
            {allInsurances?.map(insurance => (
              <option key={insurance._id} value={insurance.name}>{insurance.name}</option>
            ))}
          </select>
          {errors.bimehKind && (
            <p className="error-message">{errors.bimehKind.message}</p>
          )}
        </>
        )}

              <label>شماره تماس</label>
              <input type="text" placeholder="0910..." {...register("phone")}/>
  {errors.phone && (
          <p className="error-message">{errors.phone.message}</p>
        )}
              <label>درصد تخفیف</label>
              <input type="number" placeholder="عدد وارد کنید"  {...register("discountPercent")}/>
  {errors.discountPercent && (
          <p className="error-message">{errors.discountPercent.message}</p>
        )}

     <h3>روزهای ویزیت مراجع</h3>
      {fields.map((field, index) => (
        <div key={field.id} className="workday-row">
        <div className="workday-row" key={field.id}>
  <select {...register(`workDays.${index}.day`)}>
    <option value="">انتخاب روز</option>
    <option value="Saturday">شنبه</option>
    <option value="Sunday">یکشنبه</option>
    <option value="Monday">دوشنبه</option>
    <option value="Tuesday">سه‌شنبه</option>
    <option value="Wednesday">چهارشنبه</option>
    <option value="Thursday">پنج‌شنبه</option>
    <option value="Friday">جمعه</option>
  </select>

  <div className="time-inputs">
    <div className="time-group">
      <label>شروع:</label>
      <input
        type="time"
        {...register(`workDays.${index}.startTime`)}
        placeholder="HH:MM"
      />
    </div>
    <div className="time-group">
      <label>پایان:</label>
      <input
        type="time"
        {...register(`workDays.${index}.endTime`)}
        placeholder="HH:MM"
      />
    </div>
  </div>

  <button type="button" onClick={() => remove(index)}>حذف</button>
</div>

          {errors.workDays?.[index] && (
            <p className="error-message">{errors.workDays[index].day?.message || errors.workDays[index].startTime?.message || errors.workDays[index].endTime?.message}</p>
          )}
        </div>
      ))}
      <button type="button" onClick={() => append({ day: "",  startTime: "08:00", endTime: "22:00"  })}>
        اضافه کردن روز ویزیت
      </button>
{errors.workDays && (
            <p className="error-message">لطفا روز های ویزیت را مشخص کیند!</p>
          )}

                      <label>درمانگر ارجاعی</label>
                       <select  {...register("introducedBy")}>
                         <option value="">
                           {allTherapist.length === 0 ? "در حال بارگذاری درمانگران..." : "انتخاب درمانگر"}
                         </option>
                        {allTherapist.map(item=>(
                           <option key={item._id} value={item._id}>{item.firstName} {item.lastName}</option>
                        ))}
  </select>
              
  {errors.introducedBy && (
          <p className="error-message">{errors.introducedBy.message}</p>
        )}
              <label>آدرس</label>
              <input type="text" placeholder="ادرس را وارد کنید" {...register("address")}/>
  {errors.address && (
          <p className="error-message">{errors.address.message}</p>
        )}
     
  

              <div className="modal-actions">
                <button type="submit">{editingPatient==null?"ذخیره":"ویرایش"}</button>
                <button type="button" onClick={() => {onCancel()}}>
                  لغو
                </button>
              </div>
            </form>
  )
}