// components/showAssessment.tsx

import React from "react";
import {
  FiX,
  FiUser,
  FiBriefcase,
  FiHeart,
  FiActivity,
  FiCheckCircle,
  FiClipboard,
  FiClock,
  FiInfo,
} from "react-icons/fi";
import moment from "moment-jalaali";
const howDidYouKnowMap: Record<string, string> = {
  instagram: 'اینستاگرام',
  google: 'جستجوی گوگل',
  doctor_referral: 'معرفی پزشک',
  friend_family: 'معرفی دوستان و آشنایان',
  clinic_website: 'وب‌سایت کلینیک',
  social_media_other: 'سایر شبکه‌های اجتماعی',
  advertisement: 'تبلیغات',
  other: 'سایر',
};
interface ViewAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}

const ViewAssessmentModal: React.FC<ViewAssessmentModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  if (!isOpen || !data) return null;

  const {
    fullName,
    gender,
    birthDate,
    parentsJob,
    birthConditions = {},
    childProblems = {},
    surgeryHistory,
    suggested_classes,
    medicationHistory,
    rehabHistory,
    initialAssessmentResults,
    overallTherapyGoals,
    finished,
    evaluatedBy,
    createdAt,
    updatedAt,
    howDidYouKnow,
    attendingDoctorName,
  } = data;

  const formatDate = (date: string) => {
    if (!date) return "نامشخص";
    return moment(date, "YYYY-MM-DD").format("jYYYY/jMM/jDD");
  };

  const formatFullDate = (date: string) => {
    if (!date) return "نامشخص";
    return moment(date).format("jYYYY/jMM/jDD HH:mm");
  };

  const therapistName = evaluatedBy
    ? `${evaluatedBy.firstName} ${evaluatedBy.lastName}`
    : "نامشخص";

  const genderMap: Record<string, string> = {
    male: "مرد",
    female: "زن",
    other: "سایر",
  };

  const conditionLabels: Record<string, string> = {
    jaundice: "زردی",
    seizure: "تشنج",
    vomitingDiarrhea: "استفراغ/اسهال",
    headInjury: "ضربه به سر",
    metabolicDisease: "بیماری متابولیک",
  };

  const problemLabels: Record<string, string> = {
    blindness: "نابینایی",
    deafness: "ناشنوایی",
    intellectualDisability: "ناتوانی ذهنی",
    speechProblems: "مشکلات گفتاری",
    feedingProblems: "مشکلات تغذیه",
    heartProblems: "مشکلات قلبی",
  };

  // استخراج آیتم‌های انتخاب شده
  const selectedConditions = Object.keys(conditionLabels).filter(
    (key) => birthConditions[key] === true,
  );
  const selectedProblems = Object.keys(problemLabels).filter(
    (key) => childProblems[key] === true,
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all duration-300 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white p-3! m-1! rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* هدر مودال */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-10 rounded-t-3xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-linear-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg shadow-emerald-200">
              <FiClipboard className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">ارزیابی اولیه</h2>
            {finished ? (
              <span className="flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">
                <FiCheckCircle className="w-3 h-3" /> تکمیل شده
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full">
                <FiClock className="w-3 h-3" /> ارزیابی تکمیل نشده!
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* محتوای مودال */}
        <div className="p-6 space-y-4!">
          {/* کارت اطلاعات شخصی */}
          <div className="bg-linear-to-br from-indigo-50/80 to-purple-50/80 rounded-2xl p-5 border border-indigo-100/60 shadow-sm">
            <div className="flex items-center gap-2 text-gray-700 mb-4">
              <FiUser className="w-5 h-5 text-indigo-500" />
              <h3 className="font-semibold text-gray-800">اطلاعات شخصی</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col">
                <span className="text-gray-500 text-xs">نام کامل</span>
                <span className="font-medium text-gray-800 mt-0.5">
                  {fullName || "نامشخص"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 text-xs">جنسیت</span>
                <span className="font-medium text-gray-800 mt-0.5">
                  {genderMap[gender] || "نامشخص"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 text-xs">تاریخ تولد</span>
                <span className="font-medium text-gray-800 mt-0.5">
                  {formatDate(birthDate)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 text-xs">شغل والدین</span>
                <span className="font-medium text-gray-800 mt-0.5">
                  {parentsJob || "ثبت نشده"}
                </span>
              </div>
              <div className="flex flex-col sm:col-span-2">
                <span className="text-gray-500 text-xs">درمانگر ارزیاب</span>
                <span className="font-medium text-gray-800 mt-0.5">
                  {therapistName}
                </span>
              </div>
            </div>
          </div>


{/* ===== اطلاعات تکمیلی ===== */}
<div className="bg-cyan-50/60 rounded-2xl p-5 border border-cyan-100/60 shadow-sm">
  <div className="flex items-center gap-2 text-gray-700 mb-3">
    <FiInfo className="w-5 h-5 text-cyan-500" />
    <h3 className="font-semibold text-gray-800">اطلاعات تکمیلی</h3>
  </div>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
    <div className="flex flex-col">
      <span className="text-gray-500 text-xs">نحوه آشنایی با کلینیک</span>
      <span className="font-medium text-gray-800 mt-0.5">
        {howDidYouKnow ? howDidYouKnowMap[howDidYouKnow] || howDidYouKnow : 'ثبت نشده'}
      </span>
    </div>
    <div className="flex flex-col">
      <span className="text-gray-500 text-xs">نام پزشک تحت نظر</span>
      <span className="font-medium text-gray-800 mt-0.5">{attendingDoctorName || 'ثبت نشده'}</span>
    </div>
  </div>
</div>


          {/* شرایط تولد */}
          <div className="bg-rose-50/60 rounded-2xl p-5 border border-rose-100/60 shadow-sm">
            <div className="flex items-center gap-2 text-gray-700 mb-3">
              <FiHeart className="w-5 h-5 text-rose-500" />
              <h3 className="font-semibold text-gray-800">شرایط تولد</h3>
            </div>
            {selectedConditions.length === 0 && !birthConditions.other ? (
              <p className="text-sm text-gray-400 italic">موردی ثبت نشده</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedConditions.map((key) => (
                  <span
                    key={key}
                    className="px-3 py-1.5 bg-rose-100 text-rose-700 rounded-xl text-sm font-medium border border-rose-200"
                  >
                    {conditionLabels[key]}
                  </span>
                ))}
                {birthConditions.other && (
                  <span className="px-3 py-1.5 bg-rose-100 text-rose-700 rounded-xl text-sm font-medium border border-rose-200">
                    سایر: {birthConditions.other}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* مشکلات کودکی */}
          <div className="bg-amber-50/60 rounded-2xl p-5 border border-amber-100/60 shadow-sm">
            <div className="flex items-center gap-2 text-gray-700 mb-3">
              <FiActivity className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-gray-800">
                مشکلات دوران کودکی
              </h3>
            </div>
            {selectedProblems.length === 0 && !childProblems.other ? (
              <p className="text-sm text-gray-400 italic">موردی ثبت نشده</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedProblems.map((key) => (
                  <span
                    key={key}
                    className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-xl text-sm font-medium border border-amber-200"
                  >
                    {problemLabels[key]}
                  </span>
                ))}
                {childProblems.other && (
                  <span className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-xl text-sm font-medium border border-amber-200">
                    سایر: {childProblems.other}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* سوابق پزشکی */}
          <div className="bg-emerald-50/60 rounded-2xl p-5 border border-emerald-100/60 shadow-sm">
            <div className="flex items-center gap-2 text-gray-700 mb-3">
              <FiBriefcase className="w-5 h-5 text-emerald-500" />
              <h3 className="font-semibold text-gray-800">
                سوابق پزشکی و درمانی
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col">
                <span className="text-gray-500 text-xs">سابقه جراحی</span>
                <span className="font-medium text-gray-800 mt-0.5">
                  {surgeryHistory || "ثبت نشده"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 text-xs">سابقه مصرف دارو</span>
                <span className="font-medium text-gray-800 mt-0.5">
                  {medicationHistory || "ثبت نشده"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 text-xs">سابقه توانبخشی</span>
                <span className="font-medium text-gray-800 mt-0.5">
                  {rehabHistory || "ثبت نشده"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 text-xs">کلاس‌های پیشنهادی</span>
                <span className="font-medium text-gray-800 mt-0.5">
                  {suggested_classes || "ثبت نشده"}
                </span>
              </div>
            </div>
          </div>

          {/* نتایج و اهداف */}
          <div className="bg-violet-50/60 rounded-2xl p-5 border border-violet-100/60 shadow-sm">
            <div className="flex items-center gap-2 text-gray-700 mb-3">
              <FiCheckCircle className="w-5 h-5 text-violet-500" />
              <h3 className="font-semibold text-gray-800">
                نتایج و اهداف درمانی
              </h3>
            </div>
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-gray-500 text-xs">
                  نتایج ارزیابی اولیه
                </span>
                <div className="mt-1 p-3 bg-white rounded-xl border border-gray-200 text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {initialAssessmentResults || "ثبت نشده"}
                </div>
              </div>
              <div>
                <span className="text-gray-500 text-xs">اهداف کلی درمان</span>
                <div className="mt-1 p-3 bg-white rounded-xl border border-gray-200 text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {overallTherapyGoals || "ثبت نشده"}
                </div>
              </div>
            </div>
          </div>

          {/* تاریخ‌ها */}
          <div className="text-center text-xs text-gray-400 border-t border-gray-200 pt-4 mt-2">
            <span>تاریخ ایجاد: {formatFullDate(createdAt)}</span>
            <span className="mx-2">•</span>
            <span>آخرین به‌روزرسانی: {formatFullDate(updatedAt)}</span>
          </div>
        </div>

        {/* دکمه بستن */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 px-6 py-4 rounded-b-3xl flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-200 text-sm"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewAssessmentModal;
