import  { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";



import { FiLoader, FiPlay, FiFileText, FiArrowRight } from "react-icons/fi";

import { AlertSwal } from "../../../utils/errorSwal";
import { useCreateAssessmentResult } from "../../../hooks/assessmentResult";
import { useAssessmentTemplates } from "../../../hooks/assessmentTemplate";



export const SystematicAssessmentSelector = () => {
  const navigate = useNavigate();

  const {Id}=useParams()
  const patientId = Id


  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

  // دریافت لیست قالب‌های ارزیابی فعال و منتشر شده

  const {data:templatesData,isLoading}=useAssessmentTemplates({status:"published"})


  

  const createResultMutation = useCreateAssessmentResult();

  const handleStart = async () => {
    if (!patientId) {
      AlertSwal.Error("شناسه بیمار یافت نشد!");
      return;
    }
    if (!selectedTemplateId) {
      AlertSwal.Error("لطفا یک قالب ارزیابی انتخاب کنید.");
      return;
    }

    try {
      // ایجاد یک ارزیابی جدید در حالت in-progress
      const newResult = await createResultMutation.mutateAsync({
        template: selectedTemplateId,
        patient: patientId,
        answers: [], // در ابتدا لیست پاسخ‌ها خالی است
      });

      // هدایت درمانگر به صفحه پاسخ‌دهی به سوالات
      navigate(`/patientprofile/assessments/run/${newResult._id}`);
    } catch (err) {
      // خطا توسط AlertSwal در هوک مدیریت می‌شود
    }
  };

  if (!patientId) {
    return (
      <div className="p-8! text-center text-red-500">
        پارامتر patientId در آدرس بار یافت نشد!
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto my-10! p-6! bg-white rounded-3xl shadow-xl border border-gray-100">
      <div className="flex items-center justify-between mb-8! pb-4! border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <FiFileText className="text-rose-500" />
          شروع ارزیابی سیستماتیک جدید
        </h1>
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-500 flex items-center gap-1! hover:text-gray-800"
        >
          <FiArrowRight /> بازگشت
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center py-12! text-rose-500 gap-2!">
          <FiLoader className="w-10 h-10 animate-spin" />
          <span>در حال بارگذاری لیست ارزیابی‌ها...</span>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              انتخاب نوع ارزیابی:
            </label>
            <div className="grid grid-cols-1 gap-3!">
              {templatesData?.map((template) => (
                <div
                  key={template._id}
                  onClick={() => setSelectedTemplateId(template._id)}
                  className={`p-4! rounded-2xl border-2 cursor-pointer transition-all flex justify-between items-center ${
                    selectedTemplateId === template._id
                      ? "border-rose-500 bg-rose-50/30"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div>
                    <h3 className="font-bold text-gray-800">{template.title}</h3>
                    <p className="text-xs text-gray-500 mt-1!">
                      کد: {template.code} | دسته‌بندی: {template.category || "عمومی"}
                    </p>
                    {template.description && (
                      <p className="text-xs text-gray-400 mt-2! line-clamp-1">
                        {template.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2!">
                    <span className="text-xs bg-gray-100 px-2.5! py-1! rounded-full text-gray-600">
                      سوالات
                    </span>
                    <input
                      type="radio"
                      name="templateRadio"
                      checked={selectedTemplateId === template._id}
                      onChange={() => setSelectedTemplateId(template._id)}
                      className="accent-rose-500 w-5 h-5"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={createResultMutation.isPending || !selectedTemplateId}
            className="w-full mt-6 bg-linear-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white py-4! px-6! rounded-xl font-medium shadow-lg shadow-rose-250 flex items-center justify-center gap-2! transition-all disabled:opacity-50"
          >
            {createResultMutation.isPending ? (
              <FiLoader className="animate-spin w-5 h-5" />
            ) : (
              <FiPlay className="w-5 h-5" />
            )}
            آغاز فرآیند ارزیابی
          </button>
        </div>
      )}
    </div>
  );
};
