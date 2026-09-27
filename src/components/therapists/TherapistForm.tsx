import { schema } from "../../validation/therapists/AddTherapistSchema";



import { yupResolver } from "@hookform/resolvers/yup";

import { useFieldArray, useForm } from "react-hook-form";


export default function TherapistForm({onSubmit,onCancel,editingTherapist}){
       const { register,control, handleSubmit, formState: { errors }} = useForm({
    resolver: yupResolver(schema),
    defaultValues:editingTherapist
  });

    const { fields, append, remove } = useFieldArray({
    control,
    name: "workDays",
  });

  return(
     <form onSubmit={handleSubmit(onSubmit) } >
      
              <label>نام</label>
              <input type="text" placeholder="نام درمانگر..." {...register("firstName")} />
                {errors.firstName && (
          <p className="error-message">{errors.firstName.message}</p>
        )}
               <label> نام خانوادگی</label>
              <input type="text" placeholder="نام خانوادگی درمانگر..." {...register("lastName")}/>
                 {errors.lastName && (
          <p className="error-message">{errors.lastName.message}</p>
        )}
    

              <label>تخصص</label>
               <select id="mySelect"  {...register("role")}>
        <option value="">--انتخاب کنید--</option>
        <option value="SLP">گفتاردرمانگر</option>
        <option value="OT">کاردرمانگر</option>
        <option value="PT">فیزیوتراپیست</option>
        <option value="PSY">روانشناس</option>
      </select>
       {errors.role && (
          <p className="error-message">{errors.role.message}</p>
        )}

              <label>شماره تماس</label>
              <input type="number" placeholder="0910..." {...register("phone")}/>
  {errors.phone && (
          <p className="error-message">{errors.phone.message}</p>
        )}
              <label>درصد پیش‌فرض</label>
              <input type="number" placeholder="عدد وارد کنید"  {...register("percentDefault")}/>
  {errors.percentDefault && (
          <p className="error-message">{errors.percentDefault.message}</p>
        )}
              <label>درصد معرفی</label>
              <input type="number" placeholder="عدد وارد کنید" {...register("percentIntroduced")}/>
  {errors.percentIntroduced && (
          <p className="error-message">{errors.percentIntroduced.message}</p>
        )}
      <h3>روزهای کاری درمانگر</h3>
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
        اضافه کردن روز کاری
      </button>
      {errors.workDays && (
            <p className="error-message">لطفا روز های کاری را مشخص کیند!</p>
          )}
                 <label>مهارت‌ها</label>
     <div className="skills-container">
  <label>
    <input type="checkbox" value="mental" {...register("skills")} />
    ذهنی
  </label>
  <label>
    <input type="checkbox" value="physical" {...register("skills")} />
    جسمی
  </label>
  <label>
    <input type="checkbox" value="SI-PM" {...register("skills")} />
    حسی و حرکتی
  </label>
  <label>
    <input type="checkbox" value="SLP" {...register("skills")} />
    گفتاردرمانی
  </label>
  <label>
    <input type="checkbox" value="education" {...register("skills")} />
    آموزش
  </label>
  <label>
    <input type="checkbox" value="psychologist" {...register("skills")} />
    روانشناسی/مشاوره
  </label>
  <label>
    <input type="checkbox" value="LD" {...register("skills")} />
    اختلال یادگیری
  </label>
  <label>
    <input type="checkbox" value="massage" {...register("skills")} />
    ماساژ
  </label>
</div>


              <div className="modal-actions">
                <button type="submit">{editingTherapist==null?"ذخیره":"ویرایش"}</button>
                <button type="button" onClick={() => {onCancel()}}>
                  لغو
                </button>
              </div>
            </form>
  )
}