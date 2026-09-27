import React, { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import {
  FiLoader,
  FiCheckCircle,
  FiArrowRight,
  FiHelpCircle,

} from "react-icons/fi";

import type { AnswerPayload, SelectedOptionPayload } from "../../../types/assessmentResult.types";
import { useAssessmentResultById, useSubmitAssessmentResult } from "../../../hooks/assessmentResult";
import { useAssessmentTemplate } from "../../../hooks/assessmentTemplate";

// ساختار داده فرم برای React Hook Form
interface FormValues {
  answers: Record<string, {
    questionId: string;
    questionKey: string;
    questionTitle: string;
    questionType: string;
    selectedOptions: SelectedOptionPayload[];
    textValue?: string;
    numberValue?: number | "";
    booleanValue?: boolean;
    rawScore: number;
  }>;
  notes: string;
  isCompleted: boolean; // چک‌باکس وضعیت تکمیل نهایی ارزیابی
}

export const SystematicAssessmentRunner = () => {
  const { Id } = useParams<{ Id: string }>();
  const resultId = Id;
  const navigate = useNavigate();

  // ۱. دریافت مشخصات سند ارزیابی و اطلاعات الگو
  const { data: resultData, isLoading: isResultLoading } = useAssessmentResultById(resultId);
  const { data: templateDetails, isLoading: isTemplateLoading } = useAssessmentTemplate(resultData?.template?._id);

  const submitMutation = useSubmitAssessmentResult();

  // ۲. ساخت داینامیک اسکیمای ولیدیشن Yup
// ۲. ساخت داینامیک اسکیمای ولیدیشن Yup
const validationSchema = useMemo(() => {
  if (!templateDetails?.questions) return yup.object().shape({});

  const answersSchema: Record<string, yup.AnySchema> = {};

  templateDetails.questions.forEach((q) => {
    let fieldSchema = yup.object().shape({
      questionId: yup.string().required(),
      questionKey: yup.string().required(),
      questionTitle: yup.string().required(),
      questionType: yup.string().required(),
      rawScore: yup.number().required(),
      selectedOptions: yup.array().of(
        yup.object().shape({
          optionId: yup.string().required(),
          key: yup.string().required(),
          label: yup.string().required(),
          value: yup.mixed().required(),
          score: yup.number().required(),
        })
      ).default([]),
      textValue: yup.string().optional().nullable(),
      numberValue: yup.mixed().optional().nullable(),
      booleanValue: yup.boolean().optional().nullable(),
    });

    // اعمال قوانین شرطی: فقط اگر سوال اجباری باشد و ارزیابی در وضعیت "تکمیل شده" قرار بگیرد
    if (q.required) {
      fieldSchema = fieldSchema.test(
        "required-check",
        "پاسخ به این سوال برای ثبت نهایی الزامی است",
        function (value) {
          // دسترسی به مقدار isCompleted از ریشه فرم
          const { isCompleted } = this.options.context as { isCompleted: boolean };
          
          // اگر کاربر نخواهد ارزیابی را تکمیل کند، سخت‌گیری نمی‌کنیم
          if (!isCompleted) return true;

          // اگر قصد تکمیل دارد، چک کردن فیلدها الزامی است
          if (!value) return false;

          if (q.type === "boolean") {
            return typeof value.booleanValue === "boolean";
          }

          if (["single-choice", "multiple-choice"].includes(q.type)) {
            return Array.isArray(value.selectedOptions) && value.selectedOptions.length > 0;
          }

          if (q.type === "text") {
            return typeof value.textValue === "string" && value.textValue.trim() !== "";
          }

          if (q.type === "number") {
            return (
              value.numberValue !== undefined && 
              value.numberValue !== null && 
              value.numberValue !== ""
            );
          }

          return true;
        }
      ) as any;
    }

    answersSchema[q._id] = fieldSchema;
  });

  return yup.object().shape({
    answers: yup.object().shape(answersSchema),
    notes: yup.string().optional().default(""),
    isCompleted: yup.boolean().default(false),
  });
}, [templateDetails]);


  // ۳. کانفیگ React Hook Form
// ۳. کانفیگ React Hook Form
const {
  control,
  handleSubmit,
  reset,
  watch, // اضافه کردن watch
  formState: { errors },
} = useForm<FormValues>({
  resolver: (values, context, options) => {
    // پاس دادن مقادیر فعلی فرم به عنوان context به Yup
    return yupResolver(validationSchema)(values, values, options);
  },
  defaultValues: {
    answers: {},
    notes: "",
    isCompleted: false,
  },
});

  // ۴. پر کردن مقادیر اولیه فرم به محض لود شدن داده‌ها از دیتابیس
  useEffect(() => {
    if (templateDetails?.questions && resultData) {
      const initialAnswers: FormValues["answers"] = {};

      // پر کردن مقادیر ثبت شده قبلی
      resultData.answers?.forEach((ans) => {
        // تبدیل نوع داده برای فیلدهای خاص جهت هماهنگی کامل با Yup
        let parsedBoolean: boolean | undefined = undefined;
        if (ans.questionType === "boolean") {
          if (typeof ans.booleanValue === "boolean") {
            parsedBoolean = ans.booleanValue;
          } else if (ans.booleanValue === "true") {
            parsedBoolean = true;
          } else if (ans.booleanValue === "false") {
            parsedBoolean = false;
          }
        }

        initialAnswers[ans.questionId] = {
          questionId: ans.questionId,
          questionKey: ans.questionKey,
          questionTitle: ans.questionTitle,
          questionType: ans.questionType,
          selectedOptions: (ans.selectedOptions || []).map(opt => ({
            optionId: opt.optionId,
            key: opt.key,
            label: opt.label,
            value: opt.value,
            score: opt.score
          })) as SelectedOptionPayload[],
          textValue: ans.textValue || "",
          numberValue: ans.numberValue ?? "",
          booleanValue: parsedBoolean,
          rawScore: ans.rawScore || 0,
        };
      });

      // مقداردهی اولیه برای سوالاتی که هنوز پاسخی برای آن‌ها ثبت نشده است
      templateDetails.questions.forEach((q) => {
        if (!initialAnswers[q._id]) {
          initialAnswers[q._id] = {
            questionId: q._id,
            questionKey: q.key,
            questionTitle: q.title,
            questionType: q.type,
            selectedOptions: [],
            textValue: "",
            numberValue: "",
            booleanValue: undefined,
            rawScore: 0,
          };
        }
      });

      reset({
        answers: initialAnswers,
        notes: resultData.notes || "",
        isCompleted: resultData.status === "completed",
      });
    }
  }, [templateDetails, resultData, reset]);

  // ۵. سابمیت نهایی فرم
  const onSubmit = async (data: FormValues) => {
    try {
      // تبدیل آبجکت پاسخ‌ها به ساختار تمیز آرایه‌ای برای بک‌اند
      const formattedAnswers = Object.values(data.answers).map((ans) => ({
        ...ans,
        numberValue: ans.numberValue === "" ? undefined : Number(ans.numberValue),
        booleanValue: typeof ans.booleanValue === "boolean" ? ans.booleanValue : undefined,
      })) as AnswerPayload[];

      await submitMutation.mutateAsync({
        id: resultId!,
        payload: {
          answers: formattedAnswers,
          notes: data.notes,
          status: data.isCompleted ? "completed" : "in-progress", // ارسال وضعیت با توجه به مقدار چک‌باکس
        },
      });

      if (resultData?.patient) {
        navigate(`/patientprofile/${resultData.patient._id}/assessments`);
      } else {
        navigate(-1);
      }
    } catch (e) {
      // مدیریت خطا توسط Axios Interceptor و AlertSwal انجام می‌شود
    }
  };

  if (isResultLoading || isTemplateLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3! text-rose-500">
          <FiLoader className="w-10 h-10 animate-spin" />
          <span className="text-sm font-medium">در حال بارگذاری ساختار ارزیابی...</span>
        </div>
      </div>
    );
  }

  const questions = templateDetails?.questions || [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto my-8! p-4! md:p-8! bg-white rounded-3xl shadow-xl border border-gray-100" dir="rtl">
      {/* هدر */}
      <div className="flex items-center justify-between pb-6! border-b border-gray-150 mb-8!">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {resultData?.templateSnapshot?.title}
          </h1>
          <p className="text-xs text-gray-500 mt-1!">
            کد الگو: {resultData?.templateSnapshot?.code} | نسخه: {resultData?.templateSnapshot?.version}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4! py-2! rounded-xl text-sm transition-colors flex items-center gap-1!"
        >
          <FiArrowRight /> انصراف و بازگشت
        </button>
      </div>

      {/* فرم سوالات */}
      <div className="space-y-8!">
        {questions
          .sort((a, b) => a.order - b.order)
          .map((question, index) => {
            const questionError = errors.answers?.[question._id];

            return (
              <div
                key={question._id}
                className={`p-6! rounded-2xl border bg-gray-50/40 relative hover:border-rose-100 transition-all duration-250 ${
                  questionError ? "border-red-300 bg-red-50/10 shadow-xs" : "border-gray-150"
                }`}
              >
                {/* شماره و عنوان سوال */}
                <div className="flex items-start gap-2.5 mb-4!">
                  <span className="bg-rose-100 text-rose-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5!">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-bold text-gray-800 flex items-center gap-1.5!">
                      {question.title}
                      {question.required && (
                        <span className="text-red-500 text-xs" title="اجباری">*</span>
                      )}
                    </h3>
                    {question.description && (
                      <p className="text-xs text-gray-500 mt-1! flex items-center gap-1!">
                        <FiHelpCircle className="shrink-0 text-gray-400" />
                        {question.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* رندر فیلدها با استفاده از Controller */}
                <div className="mt-4!">
                  <Controller
                    name={`answers.${question._id}`}
                    control={control}
                    render={({ field: { value, onChange } }) => {
                      const selectedOpts = value?.selectedOptions || [];

                      // تک انتخابی (single-choice)
                      if (question.type === "single-choice") {
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5!">
                            {question.options.map((opt) => {
                              const isSelected = selectedOpts.some((o) => o.optionId === opt._id);
                              return (
                                <div
                                  key={opt._id}
                                  onClick={() => {
                                    onChange({
                                      ...value,
                                      selectedOptions: [{
                                        optionId: opt._id,
                                        key: opt.key,
                                        label: opt.label,
                                        value: opt.value,
                                        score: opt.score,
                                      }],
                                      rawScore: opt.score,
                                    });
                                  }}
                                  className={`p-3.5! rounded-xl border cursor-pointer transition-all flex items-center justify-between text-sm ${
                                    isSelected
                                      ? "border-rose-500 bg-rose-50/20 text-rose-900 font-medium shadow-xs"
                                      : "border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
                                  }`}
                                >
                                  <span>{opt.label}</span>
                                  <span className="text-xs text-gray-400">({opt.score} امتیاز)</span>
                                </div>
                              );
                            })}
                          </div>
                        );
                      }

                      // چند انتخابی (multiple-choice)
                      if (question.type === "multiple-choice") {
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5!">
                            {question.options.map((opt) => {
                              const isSelected = selectedOpts.some((o) => o.optionId === opt._id);
                              return (
                                <label
                                  key={opt._id}
                                  className={`p-3.5! rounded-xl border cursor-pointer transition-all flex items-center justify-between text-sm ${
                                    isSelected
                                      ? "border-rose-500 bg-rose-50/20 text-rose-900 font-medium shadow-xs"
                                      : "border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
                                  }`}
                                >
                                  <span className="flex items-center gap-2!">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      className="accent-rose-500 w-4 h-4"
                                      onChange={(e) => {
                                        let updatedOpts: SelectedOptionPayload[] = [];
                                        if (e.target.checked) {
                                          updatedOpts = [
                                            ...selectedOpts,
                                            {
                                              optionId: opt._id,
                                              key: opt.key,
                                              label: opt.label,
                                              value: opt.value,
                                              score: opt.score,
                                            },
                                          ];
                                        } else {
                                          updatedOpts = selectedOpts.filter((o) => o.optionId !== opt._id);
                                        }
                                        const sumScore = updatedOpts.reduce((acc, o) => acc + (o.score || 0), 0);
                                        onChange({
                                          ...value,
                                          selectedOptions: updatedOpts,
                                          rawScore: sumScore,
                                        });
                                      }}
                                    />
                                    {opt.label}
                                  </span>
                                  <span className="text-xs text-gray-400">({opt.score} امتیاز)</span>
                                </label>
                              );
                            })}
                          </div>
                        );
                      }

                      // بلی / خیر (boolean)
                      if (question.type === "boolean") {
                        const booleanOptions = Array.isArray(question?.options) && question.options.length > 0
                          ? question.options
                          : [
                              { _id: "true", label: "بله / صحیح", value: true, score: 1 },
                              { _id: "false", label: "خیر / غلط", value: false, score: 0 },
                            ];

                        return (
                          <div className="flex gap-4!">
                            {booleanOptions.map((opt) => {
                              // چک کردن بر اساس booleanValue یا optionId قبلی
                              const isSelected = value?.booleanValue === (opt.value === true || opt.value === "true") ||
                                selectedOpts.some(o => o.optionId === opt._id);

                              return (
                                <button
                                  key={opt._id}
                                  type="button"
                                  onClick={() => {
                                    const valBool = opt.value === true || opt.value === "true";
                                    onChange({
                                      ...value,
                                      selectedOptions: [{
                                        optionId: opt._id,
                                        key: String(opt.value),
                                        label: opt.label,
                                        value: String(opt.value),
                                        score: opt.score,
                                      }],
                                      booleanValue: valBool,
                                      rawScore: opt.score,
                                    });
                                  }}
                                  className={`flex-1 p-3.5! rounded-xl border font-medium text-sm transition-all ${
                                    isSelected
                                      ? "border-rose-500 bg-rose-50/20 text-rose-900 shadow-xs"
                                      : "border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
                                  }`}
                                >
                                  {opt.label}
                                </button>
                              );
                            })}
                          </div>
                        );
                      }

                      // متنی (text)
                      if (question.type === "text") {
                        return (
                          <textarea
                            value={value?.textValue || ""}
                            onChange={(e) => {
                              onChange({
                                ...value,
                                textValue: e.target.value,
                              });
                            }}
                            rows={3}
                            placeholder="پاسخ تشریحی خود را اینجا بنویسید..."
                            className="w-full p-3! rounded-xl border border-gray-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-hidden text-sm resize-none bg-white"
                          />
                        );
                      }

                      // عددی (number)
                      if (question.type === "number") {
                        return (
                          <input
                            type="number"
                            value={value?.numberValue ?? ""}
                            onChange={(e) => {
                              const val = e.target.value === "" ? "" : Number(e.target.value);
                              onChange({
                                ...value,
                                numberValue: val,
                                rawScore: typeof val === "number" ? val : 0,
                              });
                            }}
                            placeholder="مقدار عددی وارد کنید..."
                            className="w-full sm:w-64 p-3! rounded-xl border border-gray-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-hidden text-sm bg-white"
                          />
                        );
                      }

                      return null;
                    }}
                  />
                </div>

                {/* نمایش خطای اعتبار سنجی برای این سوال خاص */}
                {questionError && (
                  <p className="text-red-500 text-xs mt-2! font-medium">
                    {questionError.message || (questionError as any).root?.message || "تکمیل این فیلد اجباری است."}
                  </p>
                )}
              </div>
            );
          })}
      </div>

      {/* یادداشت نهایی درمانگر */}
      <div className="mt-10 p-6! rounded-2xl bg-gray-50 border border-gray-150">
        <label className="block text-sm font-semibold text-gray-700 mb-2!">
          یادداشت یا توضیحات تکمیلی درمانگر:
        </label>
        <Controller
          name="notes"
          control={control}
          render={({ field }) => (
            <textarea
              {...field}
              placeholder="هرگونه یادداشت یا مشاهده بالینی در طول انجام ارزیابی را در اینجا یادداشت کنید..."
              rows={3}
              className="w-full p-3! rounded-xl border border-gray-200 focus:border-rose-500 outline-hidden text-sm bg-white"
            />
          )}
        />
      </div>

      {/* بخش وضعیت نهایی ارزیابی */}
      <div className="mt-6! p-5! rounded-2xl border border-emerald-100 bg-emerald-50/15 flex items-center justify-between">
        <div className="flex flex-col gap-1!">
          <span className="text-sm font-bold text-gray-800">تکمیل فرآیند ارزیابی؟</span>
          <span className="text-xs text-gray-500">در صورت علامت‌گذاری، پرونده قفل شده و نتایج نهایی (با توجه به محدوده‌های امتیاز) محاسبه خواهد شد.</span>
        </div>
        <Controller
          name="isCompleted"
          control={control}
          render={({ field }) => (
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={field.value}
                onChange={field.onChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:inset-s-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          )}
        />
      </div>

      {/* دکمه‌های عملیات نهایی */}
      <div className="flex flex-col sm:flex-row gap-4! mt-8!">
        <button
          type="submit"
          disabled={submitMutation.isPending}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-4! rounded-xl flex items-center justify-center gap-2! shadow-lg shadow-emerald-100/50 disabled:opacity-50 transition-all"
        >
          {submitMutation.isPending ? (
            <FiLoader className="animate-spin w-5 h-5" />
          ) : (
            <FiCheckCircle className="w-5 h-5" />
          )}
          ثبت نهایی و ثبت نتایج
        </button>
      </div>
    </form>
  );
};
