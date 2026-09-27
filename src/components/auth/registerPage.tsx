
import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { type CreateAdminFormValues } from "../../validation/admin/admin";
import {  useRegisterAPP } from "../../hooks/admin";
import { registerAppSchema, type registerAppValues } from "../../validation/RegisterApp";



const RegisterPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<registerAppValues>({
    resolver: yupResolver(registerAppSchema),
  });

  const {mutateAsync:createAdmin,isPending}=useRegisterAPP()

  const onSubmit = async(data: CreateAdminFormValues) => {
   await createAdmin(data);
    reset()
  };

 return (
   <div className="flex justify-center bg-gray-50 py-12">
    <div className="w-full max-w-xl bg-white p-8 rounded-2xl shadow-lg border border-gray-100 m-10!">
    <h2 className="text-2xl font-extrabold text-gray-800 mb-8 border-b pb-4">
      ایجاد یوزر جدید
    </h2>

    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5!">
      {[
      
        { id: "firstName", label: "نام", type: "text" },
        { id: "lastName", label: "نام خانوادگی", type: "text" },
        { id: "email", label: "ایمیل", type: "email" },
        { id: "phone", label: "شماره تماس", type: "tel" },
      ].map((field) => (
        <div key={field.id} className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">{field.label}</label>
          <input
            {...register(field.id as any)}
            type={field.type}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
          {errors[field.id as keyof typeof errors] && (
            <p className="text-red-500 text-xs mt-1">
              {errors[field.id as keyof typeof errors]?.message as string}
            </p>
          )}
        </div>
      ))}

      {/* Pass */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-700">کد راه اندازی</label>
        <input type="password" {...register("pass")} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white">
          
        </input>
        {errors.pass && <p className="text-red-500 text-xs mt-1">{errors.pass.message as string}</p>}
      </div>
<div className="flex justify-center">
      <button
        type="submit"
        disabled={isPending}
        className="w-[40%] p-2! mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-3 rounded transition-all shadow-md active:scale-[0.98]"
      >
        {isPending ? "در حال پردازش..." : "ثبت  یوزر جدید "}
      </button>
      
      <button className="w-[40%] p-2! mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-xs py-3! m-2! rounded transition-all shadow-md active:scale-[0.98]" onClick={()=>window.location.replace("/")} >رفتن به صفحه ی اصلی</button>
</div>
      {/* Feedback Messages */}
    
    </form>
  </div>
  </div>
  
);

};




export default RegisterPage;
