// components/SecondaryAssessmentModal.tsx

import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  FiX,
  FiSave,
  FiFileText,
  FiCheckCircle,

} from "react-icons/fi";
import { AssessmentDomain, UpdateSecondaryAssessmentDTO } from "./dto/secondaryAssessmentDTO";

import { useAuth } from "../../../../context/AuthContext";


// ==================== انواع Props ====================


export interface SecondaryAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?:   UpdateSecondaryAssessmentDTO|null; // برای ویرایش (داده‌های کامل از API)

  onSubmit: (data: any) => void | Promise<void>;
  isLoading?: boolean;
}

// ==================== تایپ فرم ====================
interface FormValues {

  domain: AssessmentDomain;
  result: string;
  therapyGoals: string;
  finished?: boolean;
}

// ==================== اسکیما اعتبارسنجی ====================
const validationSchema = yup.object().shape({
  domain: yup
    .mixed<AssessmentDomain>()
    .oneOf(Object.values(AssessmentDomain), "حیطه ارزیابی نامعتبر است")
    .required("حیطه ارزیابی الزامی است"),
  result: yup
    .string()
    .required("نتیجه ارزیابی الزامی است")
    .min(10, "نتیجه ارزیابی حداقل ۱۰ کاراکتر باید باشد")
    .max(2000, "نتیجه ارزیابی حداکثر ۲۰۰۰ کاراکتر مجاز است"),
  therapyGoals: yup
    .string()
    .required("اهداف درمان الزامی است")
    .min(10, "اهداف درمان حداقل ۱۰ کاراکتر باید باشد")
    .max(2000, "اهداف درمان حداکثر ۲۰۰۰ کاراکتر مجاز است"),
  finished: yup.boolean().optional(),
});
const roleToDomainMap: Record<string, AssessmentDomain> = {
  OT: AssessmentDomain.OT,
  SLP: AssessmentDomain.SLP,
  PT: AssessmentDomain.PT,
  PSY: AssessmentDomain.PSY,
};
// ==================== کامپوننت اصلی (مودال + فرم) ====================
const SecondaryAssessmentModal: React.FC<SecondaryAssessmentModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSubmit,
  
  isLoading = false,
}) => {
  const{user}=useAuth()
  const userRole = user?.role as keyof typeof roleToDomainMap; // 'OT' | 'SLP' | 'PT' | 'PSY' | undefined
const defaultDomain = userRole && roleToDomainMap[userRole]
  ? roleToDomainMap[userRole]
  : AssessmentDomain.SLP; // fallback

  const {
    getValues,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      domain:defaultDomain|| AssessmentDomain.SLP,
      result: "",
      therapyGoals: "",
      finished: false,
    },
  });


  // مقداردهی اولیه در حالت ویرایش
  useEffect(() => {
    if (initialData) {
      reset({

        domain: initialData?.domain ||defaultDomain|| AssessmentDomain.SLP,
        result: initialData?.result || "",
        therapyGoals: initialData?.therapyGoals || "",
        finished: initialData?.finished ?? false,
      });
    } 
   
  }, [initialData, reset,defaultDomain]);

  // بستن مودال و ریست فرم (اختیاری)
  const handleClose = () => {

  
    if(initialData!==null){
       onClose();
      reset({
        domain: defaultDomain|| AssessmentDomain.SLP,
        result:  "",
        therapyGoals:  "",
        finished:  false,
      })
      return
    }
    onClose();
  };

  const onFormSubmit = async (data: FormValues) => {
    await onSubmit(data);
    onClose()
    reset()
  };

  if (!isOpen) return null;

  // نگاشت domain برای آپشن‌های سلکت
  const domainOptions = Object.values(AssessmentDomain).map((value) => ({
    value,
    label: value,
  }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-1! bg-black/40 backdrop-blur-sm transition-all duration-300 animate-fadeIn "
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative animate-slideUp p-2!"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ====== هدر مودال ====== */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-10 rounded-t-3xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500 rounded-xl shadow-lg shadow-indigo-200">
              <FiFileText className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              {initialData ? "ویرایش ارزیابی ثانویه" : "ارزیابی ثانویه جدید"}
            </h2>
            {initialData?.finished && (
              <span className="flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">
                <FiCheckCircle className="w-3 h-3" /> تکمیل شده
              </span>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* ====== محتوای فرم ====== */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-5">
        

     

          {/* حیطه ارزیابی */}
      <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    حیطه ارزیابی <span className="text-red-500">*</span>
  </label>
  <Controller
    name="domain"
    control={control}
    render={({ field }) => (
      <select
        {...field}
        disabled={true} // ← غیرفعال کردن
        className={`w-full px-4 py-2.5 rounded-xl border ${
          errors.domain ? "border-red-500" : "border-gray-300"
        } bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none cursor-not-allowed opacity-75`}
      >
        {domainOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    )}
  />
  {errors.domain && (
    <p className="mt-1 text-sm text-red-500">{errors.domain.message}</p>
  )}
  {/* پیام راهنما (اختیاری) */}
  <p className="mt-1 text-xs text-gray-400">* حیطه بر اساس نقش کاربر تعیین شده است</p>
</div>

          {/* نتیجه ارزیابی */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              نتیجه ارزیابی <span className="text-red-500">*</span>
            </label>
            <Controller
              name="result"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  rows={4}
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    errors.result ? "border-red-500" : "border-gray-300"
                  } bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none resize-y`}
                  placeholder="نتیجه ارزیابی را وارد کنید..."
                />
              )}
            />
            {errors.result && (
              <p className="mt-1 text-sm text-red-500">{errors.result.message}</p>
            )}
          </div>

          {/* اهداف درمان */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              اهداف درمان <span className="text-red-500">*</span>
            </label>
            <Controller
              name="therapyGoals"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  rows={4}
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    errors.therapyGoals ? "border-red-500" : "border-gray-300"
                  } bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none resize-y`}
                  placeholder="اهداف درمانی را وارد کنید..."
                />
              )}
            />
            {errors.therapyGoals && (
              <p className="mt-1 text-sm text-red-500">{errors.therapyGoals.message}</p>
            )}
          </div>

          {/* وضعیت تکمیل */}
          <div className="flex items-center gap-3">
            <Controller
              name="finished"
              control={control}
              render={({ field }) => (
                <input
                  type="checkbox"
                  id="finished"
                  checked={field.value || false}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
              )}
            />
            <label htmlFor="finished" className="text-sm text-gray-700 cursor-pointer">
              تکمیل شده
            </label>
          </div>

          {/* دکمه‌های اقدام */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
            >
              <FiX className="w-4 h-4" /> انصراف
            </button>
            <button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <FiSave className="w-4 h-4" />
              {isLoading || isSubmitting ? "در حال ذخیره..." : "ذخیره"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SecondaryAssessmentModal;