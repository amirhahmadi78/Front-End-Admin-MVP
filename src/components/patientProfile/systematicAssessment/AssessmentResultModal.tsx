import React from "react";
import { 
  FiX, 
  FiUser, 
  FiActivity, 
  FiCalendar, 
  FiFileText, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiClipboard,
  FiBookOpen
} from "react-icons/fi";
import type { PopulatedAssessmentResult } from "../../../types/assessmentResult.types";

interface AssessmentResultModalProps {

  onClose: () => void;
  result: PopulatedAssessmentResult | null | undefined;
}

// نگاشت شدت به رنگ‌های هماهنگ بالینی
const severityStyles: Record<
  string, 
  { bg: string; text: string; border: string; label: string }
> = {
  normal: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "نرمال / طبیعی" },
  mild: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", label: "خفیف" },
  moderate: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-250", label: "متوسط" },
  severe: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", label: "شدید" },
  critical: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", label: "بحرانی / خیلی شدید" },
};

// نگاشت وضعیت کلی پرونده
const statusStyles = {
  "in-progress": { bg: "bg-amber-100 text-amber-800", label: "در حال انجام" },
  completed: { bg: "bg-emerald-100 text-emerald-800", label: "تکمیل شده" },
  cancelled: { bg: "bg-gray-150 text-gray-700", label: "لغو شده" },
};

export const AssessmentResultModal: React.FC<AssessmentResultModalProps> = ({

  onClose,
  result,
}) => {
  if ( !result) return null;

  const severityInfo = result.template?.scoreRanges ?? null;
  const statusInfo = statusStyles[result.status];


  // متد کمکی برای نمایش تمیز پاسخ‌ها بر اساس نوع سوال
  const renderAnswerContent = (ans: typeof result.answers[0]) => {
    switch (ans.questionType) {
      case "single-choice":
        return (
          <div className="flex flex-wrap gap-2!">
            {ans.selectedOptions.map((opt) => (
              <span key={opt.key} className="px-3! py-1! bg-rose-50 text-rose-900 border border-rose-100 rounded-lg text-xs font-medium">
                {opt.label} <span className="text-rose-450 mr-1!">({opt.score} امتیاز)</span>
              </span>
            ))}
          </div>
        );
      case "multiple-choice":
        return (
          <div className="flex flex-wrap gap-2!">
            {ans.selectedOptions.map((opt) => (
              <span key={opt.key} className="px-3! py-1! bg-rose-50 text-rose-900 border border-rose-100 rounded-lg text-xs font-medium">
                {opt.label} <span className="text-rose-450 mr-1!">({opt.score} امتیاز)</span>
              </span>
            ))}
          </div>
        );
      case "boolean":
        { const isTrue = ans.booleanValue === true;
        return (
          <div className="flex items-center gap-2!">
            <span className={`px-4! py-1.5! rounded-lg text-xs font-semibold border ${
              isTrue 
                ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                : "bg-red-50 text-red-700 border-red-100"
            }`}>
              {isTrue ? "بله / صحیح" : "خیر / غلط"}
            </span>
            <span className="text-xs text-gray-400">({ans.rawScore} امتیاز)</span>
          </div>
        ); }
      case "number":
        return (
          <div className="flex items-center gap-2!">
            <span className="text-sm font-semibold text-gray-800 bg-gray-100 px-3! py-1! rounded-lg">
              {ans.numberValue ?? "بدون مقدار"}
            </span>
            <span className="text-xs text-gray-400">({ans.rawScore} امتیاز)</span>
          </div>
        );
      case "text":
        return (
          <p className="text-sm text-gray-700 bg-white p-3! rounded-xl border border-gray-150 leading-relaxed whitespace-pre-wrap">
            {ans.textValue || <span className="text-gray-450 italic">پاسخ متنی ثبت نشده است.</span>}
          </p>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4! overflow-hidden" dir="rtl">
      {/* بک‌دراپ تاریک و مات */}
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* باکس مودال با قابلیت اسکرول محتوا */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* هدر مودال */}
        <div className="flex items-center justify-between p-6! border-b border-gray-150 bg-gray-50/50">
          <div className="flex items-center gap-3!">
            <div className="p-2.5! bg-rose-50 text-rose-600 rounded-2xl">
              <FiBookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                بررسی نتایج ارزیابی {result.templateSnapshot?.title}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5!">
                کد الگو: {result.templateSnapshot?.code} | نسخه: {result.templateSnapshot?.version}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2! text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* محتوای مودال (دارای اسکرول) */}
        <div className="flex-1 overflow-y-auto p-6! space-y-6! scrollbar-thin">
          
          {/* کارت وضعیت کلی ارزیابی و امتیاز بیمار */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4!">
            
            {/* اطلاعات بیمار و کاردرمانگر */}
            <div className="p-4! bg-gray-50 rounded-2xl border border-gray-150 space-y-3!">
              <span className="text-xs font-bold text-gray-400 block border-b border-gray-200 pb-1.5!">مشخصات پرونده</span>
              <div className="flex items-center gap-2! text-sm text-gray-700">
                <FiUser className="text-gray-400 shrink-0" />
                <span className="font-semibold">بیمار:</span>
                <span>{result.patient?.firstName} {result.patient?.lastName}</span>
              </div>
              {result.therapist && (
                <div className="flex items-center gap-2! text-sm text-gray-700">
                  <FiActivity className="text-gray-400 shrink-0" />
                  <span className="font-semibold">درمانگر:</span>
                  <span>{result.therapist.firstName} {result.therapist.lastName}</span>
                </div>
              )}
              <div className="flex items-center gap-2! text-sm text-gray-700">
                <FiCalendar className="text-gray-400 shrink-0" />
                <span className="font-semibold">تاریخ ثبت:</span>
                <span>{new Date(result.createdAt).toLocaleDateString("fa-IR")}</span>
              </div>
            </div>

            {/* کارت امتیازدهی */}
            {/* <div className="p-4! bg-gray-50 rounded-2xl border border-gray-150 flex flex-col justify-between">
              <span className="text-xs font-bold text-gray-400 block border-b border-gray-200 pb-1.5!">امتیاز نهایی ارزیابی</span>
              <div className="flex items-baseline gap-2! mt-2!">
                <span className="text-3xl font-extrabold text-gray-800">
                  {result.score?.final ?? 0}
                </span>
                <span className="text-sm text-gray-400">امتیاز خام</span>
              </div>
              <div className="text-xs text-gray-500 mt-2!">
                {result.score?.percentage !== null && result.score?.percentage !== undefined ? (
                  <span>درصد پاسخ‌دهی: <strong className="text-gray-750 font-bold">{result.score.percentage}٪</strong></span>
                ) : (
                  <span>فاقد درصدبندی امتیاز</span>
                )}
              </div>
            </div> */}

            {/* بخش وضعیت شدت (Severity Range) */}
 {/* بخش وضعیت شدت (Severity Range) */}
<div className="flex flex-col gap-3!">
  <span className="text-xs font-bold text-gray-400 block border-b border-gray-200 pb-1.5!">
    محدوده‌های شدت بیماری
  </span>

  {Array.isArray(severityInfo) && severityInfo.length > 0 ? (
    <div className="space-y-2.5!">
      {severityInfo.map((range: any, idx: number) => {
        // نگاشت نوع بازه به استایل بالینی
        const style =
          severityStyles[range.severity] ??
          severityStyles[range.level] ??
          severityStyles["normal"];

        // بررسی آیا امتیاز فعلی داخل این بازه قرار می‌گیرد
        const currentScore = result?.score?.raw ?? null;
        const isActive =
          currentScore !== null &&
          typeof range.minScore === "number" &&
          typeof range.maxScore === "number" &&
          currentScore >= range.minScore &&
          currentScore <= range.maxScore;

        return (
          <div
            key={range._id ?? idx}
            className={`
              relative p-3.5! rounded-2xl border transition-all
              ${style.bg} ${style.border} ${style.text}
              ${isActive ? "ring-2! ring-offset-1! ring-current shadow-md scale-[1.02]" : "opacity-90"}
            `}
          >
            {isActive && (
              <span className="absolute top-2! left-2! text-[10px] font-bold bg-white/70 px-1.5! py-0.5! rounded-md">
                بازه فعلی
              </span>
            )}

            <h4 className="text-sm font-bold flex items-center gap-1.5!">
              <FiAlertCircle className="w-4 h-4 shrink-0" />
              {range.title || style.label}
            </h4>

            <p className="text-[11px] font-medium mt-1.5! flex items-center gap-1! opacity-80">
              <span>از امتیاز</span>
              <span className="font-bold">{range.minScore ?? "—"}</span>
              <span>تا</span>
              <span className="font-bold">{range.maxScore ?? "—"}</span>
            </p>
          </div>
        );
      })}
    </div>
  ) : (
    <div className="p-4! bg-gray-50 rounded-2xl border border-gray-150 flex-1 flex flex-col justify-center">
      <div className="text-sm text-gray-500 py-3! italic text-center">
        محدوده‌ای تعریف نشده است
      </div>
    </div>
  )}
</div>

          </div>

          {/* وضعیت پرونده در یک نوار باریک */}
          <div className="flex items-center gap-2! text-sm bg-gray-50 p-3! rounded-xl border border-gray-150">
            <span className="font-semibold text-gray-600">وضعیت سند ارزیابی:</span>
            <span className={`px-2.5! py-0.5! rounded-full text-xs font-bold ${statusInfo.bg}`}>
              
              {statusInfo.label}
            </span>
              <span className="font-semibold text-gray-600">امتیاز ارزیابی:</span>
            <span className={`px-2.5! py-0.5! rounded-full text-xs font-bold ${statusInfo.bg}`}>
              
              {result?.score?.raw ?? "فاقد امتیاز مشخص"}
            </span>
          </div>

          {/* بخش پاسخ‌ها و سوالات ثبت‌شده */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2! border-b border-gray-100 pb-2!">
              <FiClipboard className="text-rose-500" />
              پاسخ‌ها و بررسی پاسخ‌های ثبت شده:
            </h3>
            
            <div className="space-y-4!">
              {result.answers && result.answers.length > 0 ? (
                result.answers.map((ans, idx) => (
                  <div key={ans.questionId} className="p-4! bg-gray-50/50 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-4! mb-2.5!">
                      <div className="flex items-start gap-2.5">
                        <span className="bg-gray-200/80 text-gray-700 w-5.5 h-5.5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5!">
                          {idx + 1}
                        </span>
                        <h4 className="font-bold text-gray-800 text-sm leading-relaxed">
                          {ans.questionTitle}
                        </h4>
                      </div>
                      
                      {ans.questionType !== "text" && ans.questionType !== "number" && ans.questionType !== "boolean" && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2! py-0.5! rounded-md shrink-0">
                          {ans.rawScore} امتیاز
                        </span>
                      )}
                    </div>

                    {/* بدنه و مقدار پاسخ */}
                    <div className="pr-8!">
                      {renderAnswerContent(ans)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8! text-gray-400 text-sm">
                  هیچ پاسخی برای این سند ارزیابی ثبت نشده است.
                </div>
              )}
            </div>
          </div>

          {/* یادداشت بالینی کاردرمانگر */}
          <div className="p-5! bg-amber-50/20 border border-amber-100 rounded-2xl">
            <h4 className="text-sm font-bold text-amber-900 flex items-center gap-1.5! mb-2!">
              <FiFileText className="text-amber-600" />
              یادداشت بالینی و توضیحات درمانگر:
            </h4>
            <p className="text-sm text-amber-950 leading-relaxed whitespace-pre-wrap">
              {result.notes || <span className="italic text-gray-450">یادداشتی ثبت نشده است.</span>}
            </p>
          </div>

        </div>

        {/* فوتر مودال */}
        <div className="p-4! border-t border-gray-150 bg-gray-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6! py-2.5! bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-xl text-sm transition-all flex items-center gap-2!"
          >
            <FiCheckCircle className="w-4 h-4" />
            بستن و خروج
          </button>
        </div>

      </div>
    </div>
  );
};
