import React from 'react';
import {
  FiX,
  FiUser,
  FiCalendar,
  FiTag,
  FiCheckCircle,
  FiClock,
  FiEdit,
  FiTrendingUp,
} from 'react-icons/fi';

// تایپ‌های مربوط به ارزیابی (در صورت نیاز می‌توانید دقیق‌تر تعریف کنید)
interface Assessment {
  _id: string;
  patientProfile?: {
    _id: string;
    fullName?: string;
    birthDate?: string;
  };
  assessedBy?: {
    _id: string;
    firstName?: string;
    lastName?: string;
  };
  domain?: string;
  result?: string;
  therapyGoals?: string;
  finished?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface AssessmentModalProps {

  onClose: () => void;
  assessment: Assessment | null;
  onEdit?: () => void;
}

const SecAssessmentModal: React.FC<AssessmentModalProps> = ({

  onClose,
  assessment,
  onEdit,
}) => {
  if ( !assessment ||assessment===null||assessment===undefined) return null;

  // توابع کمکی برای فرمت تاریخ
  const formatDate = (date?: string) => {
    if (!date) return 'نامشخص';
    return new Date(date).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (date?: string) => {
    if (!date) return 'نامشخص';
    return new Date(date).toLocaleString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // استخراج داده‌ها با مقدار پیش‌فرض
  const patientFullName = assessment.patientProfile?.fullName || 'نامشخص';
  const patientBirthDate = assessment.patientProfile?.birthDate
    ? formatDate(assessment.patientProfile.birthDate)
    : 'نامشخص';
  const assessedByName =
    assessment.assessedBy?.firstName || assessment.assessedBy?.lastName
      ? `${assessment.assessedBy?.firstName || ''} ${assessment.assessedBy?.lastName || ''}`.trim()
      : 'نامشخص';
  const domain = assessment.domain || 'نامشخص';
  const result = assessment.result || 'ثبت نشده';
  const therapyGoals = assessment.therapyGoals || 'ثبت نشده';
  const finished = assessment.finished ?? false;
  const createdAt = formatDateTime(assessment.createdAt);
  const updatedAt = formatDateTime(assessment.updatedAt);

return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-2!">
    <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] p-1!  flex flex-col max-h-[90vh]">
      
      {/* هدر - ثابت */}
      <div className="relative flex items-center rounded-t-xl justify-between px-2! py-2! bg-linear-to-l from-purple-600 via-purple-500 to-pink-500 shrink-0">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-white/20 p-2! backdrop-blur-sm">
            <FiTrendingUp className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white drop-shadow-sm">
            جزئیات ارزیابی ثانویه
          </h3>
        </div>
        <button
          onClick={onClose}
          className="rounded-full bg-white/20 p-2! text-white backdrop-blur-sm transition-all hover:bg-white/30 hover:scale-110"
        >
          <FiX className="h-5 w-5" />
        </button>
      </div>

      {/* بدنه - اسکرول‌پذیر */}
      <div className="p-6 space-y-6 bg-linear-to-b from-white to-purple-50/30 overflow-y-auto flex-1">
        
        {/* اطلاعات بیمار و ارزیاب - با کارت‌های رنگی */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-linear-to-br from-blue-50 to-indigo-50/50 p-2! border border-blue-100/50 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
              <FiUser className="h-4 w-4" />
              <span>بیمار</span>
            </div>
            <p className="mt-1 text-base font-semibold text-gray-800">
              {patientFullName}
            </p>
            <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
              <FiCalendar className="h-3 w-3" />
              <span>تولد: {patientBirthDate}</span>
            </div>
          </div>
          <div className="rounded-2xl bg-linear-to-br from-emerald-50 to-teal-50/50 p-2! border border-emerald-100/50 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
              <FiUser className="h-4 w-4" />
              <span>درمانگر</span>
            </div>
            <p className="mt-1 text-base font-semibold text-gray-800">
              {assessedByName}
            </p>
          </div>
        </div>

        {/* حوزه با نشان رنگی */}
        <div className="flex items-center gap-3 rounded-2xl bg-linear-to-r from-amber-50 to-orange-50/60 p-2! border border-amber-100/60">
          <div className="rounded-full bg-amber-100 p-2 text-amber-600">
            <FiTag className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-amber-600">حیطه</span>
            <p className="text-base font-bold text-gray-800">{domain}</p>
          </div>
        </div>

        {/* نتیجه - کارت با حاشیه رنگی */}
        <div className="rounded-2xl border-r-4 border-r-purple-500 bg-white/70 p-2! shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-2 text-sm font-medium text-purple-700">
            <FiCheckCircle className="h-4 w-4" />
            <span>نتیجه</span>
          </div>
          <p className="mt-2 text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
            {result}
          </p>
        </div>

        {/* اهداف درمانی - کارت با حاشیه رنگی */}
        <div className="rounded-2xl border-r-4 border-r-pink-500 bg-white/70 p-2! shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-2 text-sm font-medium text-pink-700">
            <FiCheckCircle className="h-4 w-4" />
            <span>اهداف درمانی</span>
          </div>
          <p className="mt-2 text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
            {therapyGoals}
          </p>
        </div>

        {/* وضعیت و تاریخ‌ها - با بک‌گراند شیشه‌ای */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/60 p-2! backdrop-blur-sm border border-gray-100/80">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">وضعیت:</span>
            <span
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm ${
                finished
                  ? 'bg-linear-to-r from-green-400 to-emerald-500 text-white'
                  : 'bg-linear-to-r from-amber-400 to-orange-500 text-white'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-white/80 animate-pulse" />
              {finished ? 'تکمیل شده' : 'در حال انجام'}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <FiClock className="h-3.5 w-3.5 text-purple-400" />
              <span>ایجاد: {createdAt}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FiClock className="h-3.5 w-3.5 text-pink-400" />
              <span>بروزرسانی: {updatedAt}</span>
            </div>
          </div>
        </div>
      </div>

      {/* فوتر - ثابت */}
      <div className="border-t border-gray-100/80 px-6 py-4 bg-linear-to-r from-purple-50/50 to-pink-50/50 flex flex-col sm:flex-row gap-3 justify-end shrink-0 rounded-b-xl">
        {onEdit && (
          <button
            onClick={onEdit}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-purple-600 to-pink-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-200 transition-all hover:scale-105 hover:shadow-xl active:scale-95"
          >
            <FiEdit className="h-4 w-4" />
            ویرایش
          </button>
        )}
        <button
          onClick={onClose}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-300 bg-red-700 px-6 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all active:scale-95"
        >
          بستن
        </button>
      </div>
    </div>
  </div>
);
};

export default SecAssessmentModal;