import {  useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { AddSalaryschema } from "../../../validation/salary/AddSalary";



import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import moment from "moment-jalaali";

import { AlertSwal } from "../../../utils/errorSwal";
import { usePostSalaryTransaction } from "../../../hooks/finance";

export default function AddSalaryForm({
  
  therapists = [],
  employees = [],
  loading = false,
  editingSalary = null,
  month,year,transactions
}) {
  const [userType, setUserType] = useState("Therapist"); // درمانگر، کارمند یا ادمین
  const [selectedUser, setSelectedUser] = useState("");
 const[date,setDate]=useState(moment().format("jYYYY-jMM-jDD"))
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(AddSalaryschema),
    defaultValues: editingSalary || {
      type: "payment",
      fee: "",
      payment: "havale",
      coderahgiri: "",
      note: "",
    },
  });
const {mutateAsync:createSalaryTC}=usePostSalaryTransaction()

  useEffect(() => {
    if (editingSalary) reset(editingSalary);
  }, [editingSalary, reset]);


const handleChange=(d)=>{

  const year=d.year
  const month=d.month.number
  const day=d.day
  setDate(year+"/"+month+"/"+day)
  

}


  const handleFormSubmit =async (data) => {
   
  
        if (!selectedUser) return alert("لطفاً دریافت‌کننده را انتخاب کنید.");

    const selectedList = userType === "Therapist" ? therapists : employees;
    const person = selectedList.find((u) => u._id === selectedUser);
if (!person) return alert("فرد انتخاب‌شده معتبر نیست.");
if(!date) return AlertSwal.Error("لطفا تاریخ واریز را انتخاب کنید!")
    const payload = {
      ...data,
      payAt: {
        userId: selectedUser,
        fullName: `${person.firstName} ${person.lastName}`,
      },
         ATModel: userType,
        YYYYMM: `${year}-${month.toString().padStart(2, "0")}`,
        payDate:date
    };

    const res=await createSalaryTC(payload)

    
    


      reset(); // پاک‌کردن فرم بعد از ارسال
      setSelectedUser("");
   
    
  };

  return (
    <div className="transaction-box">
      <h4>ثبت تراکنش حقوق / پرداخت</h4>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="form-grid">

          {/* انتخاب نوع فرد */}

          <select value={userType} onChange={(e) => {
            setUserType(e.target.value);
            setSelectedUser("");
          }}>
            <option value="Therapist">در وجه درمانگر</option>
            <option value="employee">در وجه کارمند / منشی</option>
            <option value="Admin">در وجه ادمین</option>
          </select>

          {/* انتخاب فرد بر اساس نوع */}
  
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            <option value="">انتخاب فرد...</option>
            {(userType === "Therapist" ? (Array.isArray(therapists)? therapists:[]) : (Array.isArray(employees)? employees:[])).map((u) => (
              <option key={u._id} value={u._id}>
                {u.firstName} {u.lastName}
              </option>
            ))}
          </select>

<DatePicker
              value={date}
              onChange={handleChange}
              calendar={persian}
              locale={persian_fa}
              format="YYYY/MM/DD"
              calendarPosition="bottom-right"
              style={{
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                padding: "6px 10px",
              }}
            />

          {/* نوع تراکنش */}
          <select {...register("type")}>
            <option value="payment">واریز حقوق</option>
            <option value="refund">بازپرداخت</option>
          </select>
          {errors.type && <p className="error-text">{errors.type.message}</p>}

          {/* مبلغ */}
          <input
            type="number"
            placeholder="مبلغ (تومان)"
            {...register("fee")}
          />
          {errors.fee && <p className="error-text">{errors.fee.message}</p>}

          {/* روش پرداخت */}
          <select {...register("payment")}>
            <option value="cash">نقدی</option>
            <option value="sheba">شبا</option>
            <option value="cart">کارت</option>
            <option value="satna">ساتنا</option>
            <option value="havale">حواله</option>
          </select>
          {errors.payment && (
            <p className="error-text">{errors.payment.message}</p>
          )}

          {/* کد رهگیری */}
          <input
            type="number"
            placeholder="کد رهگیری"
            {...register("coderahgiri")}
          />
          {errors.coderahgiri && (
            <p className="error-text">{errors.coderahgiri.message}</p>
          )}

          {/* توضیحات */}
          <input type="text" placeholder="توضیحات" {...register("note")} />
        </div>

        <button type="submit" className="submit-btn" disabled={loading} onClick={(e) => e.stopPropagation()}>
          {loading ? "در حال ثبت..." : "ثبت تراکنش"}
        </button>
      </form>
    </div>
  );
}
