import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { type CreateAdminFormValues,createAdminSchema } from "../../validation/admin/admin";
import { useMakeAdmin } from "../../hooks/admin";


const roles = 
  
  {"Admin":"مدیریت",
"internalManager":"مدیر داخلی",
  "secretary":"منشی",
  "accountant":"حساب دار"}


const CreateAdminForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateAdminFormValues>({
    resolver: yupResolver(createAdminSchema),
  });

  const {mutateAsync:createAdmin,isPending,isError}=useMakeAdmin()

  const onSubmit = async(data: CreateAdminFormValues) => {
   await createAdmin(data);
    reset()
  };

 return (
   <div className="flex justify-center bg-gray-50 py-12">
    <div className="w-full max-w-xl bg-white p-8 rounded-2xl shadow-lg border border-gray-100 mx-4">
    <h2 className="text-2xl font-extrabold text-gray-800 mb-8 border-b pb-4">
      ایجاد کارمند جدید
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

      {/* Role */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-700">نقش سازمانی</label>
        <select {...register("role")} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white">
          <option value="">انتخاب کنید...</option>
          
          {Object.entries(roles).map(([key, value]) => (
    <option key={key} value={key}>
      {value}
    </option>
     ))}
        </select>
        {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message as string}</p>}
      </div>
<div className="flex justify-center">
      <button
        type="submit"
        disabled={isPending}
        className="w-[40%] p-2! mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-3 rounded transition-all shadow-md active:scale-[0.98]"
      >
        {isPending ? "در حال پردازش..." : "ثبت  کارمند جدید "}
      </button>
</div>
      {/* Feedback Messages */}
    
    </form>
  </div>
  </div>
  
);

};

export default CreateAdminForm;
