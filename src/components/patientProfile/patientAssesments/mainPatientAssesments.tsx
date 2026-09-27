import { useNavigate, useParams } from "react-router-dom";
import {
  FiUser,
  FiClock,
  FiCheckCircle,
  FiPlus,
  FiList,
  FiTrendingUp,
  FiCalendar,
  FiLoader,
  FiEdit,
  FiAlertTriangle,
  FiEye,
} from "react-icons/fi";
import {
  useOnepatientProfile,
  
} from "../../../hooks/patientprofiles";

import {  useEffect, useState } from "react";

import ViewAssessmentModal from "./showAssessment";

import {
  useCreateSecAsse,
  
  useGetPatientSecAsse,
  useUpdateSecAsse,
} from "../../../hooks/secondaryAssessment";
import type { CreateSecondaryAssessmentDTO } from "./secondaryAssessment/dto/secondaryAssessmentDTO";
import { useAuth } from "../../../context/AuthContext";
import { AlertSwal } from "../../../utils/errorSwal";
// import Pagination from "../../util.componenet/pagination";

import SecAssessmentModal from "./secondaryAssessment/showSecAssessment";
import Pagination from "../../util/pagination";
import { useAssessmentResultsDetails, useAssessmentResultsList } from "../../../hooks/assessmentResult";
import { AssessmentResultModal } from "../systematicAssessment/AssessmentResultModal";
 const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
            <FiCheckCircle className="w-3 h-3" /> تکمیل شده
          </span>
        );
      case "in-progress":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            <FiClock className="w-3 h-3" /> در حال انجام
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-850 text-gray-600">
            <FiAlertTriangle className="w-3 h-3" /> لغو شده
          </span>
        );
      default:
        return null;
    }
  };
  
export const MainOnePatientAssessments = () => {
  const { user } = useAuth();

  const navigate=useNavigate()
  const { Id } = useParams<{ Id: string }>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSecAss, setShowSecAss] = useState(null);
  if (!Id) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700 max-w-md text-center">
          <FiUser className="w-12 h-12 mx-auto mb-3 text-red-400" />
          <p className="font-bold">مراجع انتخاب نشده است!</p>
          <p className="text-sm mt-1">
            لطفاً از صفحه اصلی یک بیمار را انتخاب کنید.
          </p>
        </div>
      </div>
    );
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [secondaryModal, setSecondaryModal] = useState(false);
  const [editSecondary, setEditSecondary] = useState(null);
  const handleOpenViewModal = () => setIsViewModalOpen(true);

  const { data: ProfileData, isLoading, error } = useOnepatientProfile(Id);
  const [secPage, setSecPage] = useState(1);
  const { data: SecondryData } = useGetPatientSecAsse({
    patientProfile: ProfileData?.patientprofile?._id ?? null,
    page: secPage,
    limit: 10,
  });
  const secondaryAssessments = SecondryData?.data ?? [];
const[assessmentResultID,setAssessmentResultId]=useState(null)

  // دریافت ارزیابی‌های سیستماتیک بیمار
  const { data: SystematicData, isLoading: isSystematicLoading } = useAssessmentResultsList({
    patient: Id,
  });
  const systematicAssessments = SystematicData?.data ?? [];
 
  const { mutateAsync: CreateSecAsse, isPending: createSecAssLoading } =
    useCreateSecAsse();
  const { mutateAsync: UpdateSecAss, isPending: updateSecAssLoading } =
    useUpdateSecAsse();
const{data:assessmentResulrDetails,refetch:getDetailsResult}=useAssessmentResultsDetails(assessmentResultID)

useEffect(()=>{
if(assessmentResultID&&assessmentResultID!==null&&assessmentResultID!==undefined)
  getDetailsResult()
},[assessmentResultID, getDetailsResult])

  const isPending = createSecAssLoading || updateSecAssLoading;
  const handleSubmitSecondaryAssessment = async (
    data: CreateSecondaryAssessmentDTO,
  ) => {
    try {
      const userLogin = user?._id;
      if (!userLogin) {
        AlertSwal.Error("شما لاگین نیستید!");
        return;
      }
      data.assessedBy = userLogin;
      data.patientProfile = ProfileData?.patientprofile._id;
      if (editSecondary) {
        await UpdateSecAss({ ...data, _id: editSecondary._id });
        setSecondaryModal(false);
        setEditSecondary(null);
      } else {
        await CreateSecAsse(data);
        setSecondaryModal(false);
      }
    } catch (error) {
      setSecondaryModal(false);
   
    }
  };
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-indigo-600">
          <FiLoader className="w-10 h-10 animate-spin" />
          <span className="text-sm font-medium">
            در حال بارگذاری اطلاعات...
          </span>
        </div>
      </div>
    );
  }

  if (error || !ProfileData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-rose-700 max-w-md text-center">
          <FiTrendingUp className="w-12 h-12 mx-auto mb-3 text-rose-400" />
          <p className="font-bold">خطا در دریافت اطلاعات</p>
          <p className="text-sm mt-1">
            لطفاً دوباره تلاش کنید یا با پشتیبانی تماس بگیرید.
          </p>
        </div>
      </div>
    );
  }

  const {
    fullName = "",
    finished = false,
    evaluatedBy = null,
    createdAt = "",
    updatedAt = "",
  } = ProfileData.patientprofile || {};
  const therapistName = evaluatedBy
    ? `${evaluatedBy.firstName} ${evaluatedBy.lastName}`
    : "نامشخص";

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-8 font-sans">
      <div className="max-w mx-auto space-y-8">
        {/* هدر پروفایل */}
        <div className="relative overflow-hidden bg-white rounded-3xl shadow-xl border border-white/20 backdrop-blur-sm p-6 md:p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-bl from-indigo-200/30 to-purple-200/30 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-linear-to-tr from-rose-200/20 to-amber-200/20 rounded-full translate-y-1/2 -translate-x-1/3" />

          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                <FiUser className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  مراجع: {fullName}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <FiCalendar className="w-4 h-4" />
                    {(new Date(createdAt), "yyyy/MM/dd")}
                  </span>
                </div>
              </div>
                   <button onClick={()=> navigate(-1)} className="bg-blue-600  text-white rounded-xl m-1! p-2!">بازگشت</button>
            </div>
            
          </div>
     
        </div>

        {/* ===== بخش ارزیابی اولیه (بازطراحی شده) ===== */}
        <section className="bg-white rounded-3xl shadow-xl m-1! border border-black-100/80 p-2! md:p-8 transition-all hover:shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
              <FiCheckCircle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">ارزیابی اولیه</h2>

            {finished ? (
              <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full flex items-center gap-1">
                <FiCheckCircle className="w-3 h-3" /> تکمیل شده
              </span>
            ) : (
              <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full flex items-center gap-1">
                <FiClock className="w-3 h-3" /> در انتظار تکمیل
              </span>
            )}
          </div>

          {/* کارت مشخصات اولیه */}
          <div className="bg-gray-50/70 rounded-2xl p-5 md:p-6 border border-gray-200/60 mb-6">
            <div className="flex items-center gap-2 text-gray-700 mb-4"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">درمانگر ارزیاب:</span>
                <span className="mr-2 font-medium text-gray-800">
                  {therapistName}
                </span>
              </div>

              <div>
                <span className="text-gray-500">وضعیت:</span>
                <span
                  className={`mr-2 font-medium ${finished ? "text-emerald-600" : "text-amber-600"}`}
                >
                  {finished ? "تکمیل شده" : " در انتظار تکمیل"}
                </span>
              </div>
            </div>
          </div>
          <div>
            <button
              onClick={handleOpenViewModal}
              className="flex-1 bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 p-1! m-1! hover:to-emerald-700 text-white py-3.5 px-6 rounded-xl font-medium shadow-lg shadow-emerald-200 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <FiCheckCircle className="w-5 h-5" />
              مشاهده ارزیابی اولیه
            </button>
          </div>

         
        </section>

        {/* ارزیابی‌های ثانویه */}
        <section className="rounded-3xl border border-black-100/80 m-1! bg-white p-2! shadow-xl transition-all hover:shadow-2xl md:p-8">
          {/* عنوان بخش */}
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-purple-50 p-2.5 text-purple-600">
              <FiTrendingUp className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              ارزیابی‌های ثانویه ({SecondryData?.pagination?.total ?? 0} مورد)
            </h2>
          </div>

          {/* جدول */}
          <div
            className="overflow-hidden rounded-2xl border border-gray-200"
            dir="rtl"
          >
            {/* سربرگ جدول */}
            <div className="grid grid-cols-[1fr_1.5fr_1fr_auto] bg-gray-100 px-4 py-3 text-sm font-bold text-gray-700 p-1! m-1!">
              <div>حیطه</div>
              <div>درمانگر</div>
              <div>تاریخ</div>
              <div className="text-center">ویرایش</div> {/* ستون جدید */}
            </div>

            {/* ردیف‌های جدول */}
            {secondaryAssessments.length > 0 ? (
              <div className="divide-y divide-gray-200 p-1! m-1!">
                {secondaryAssessments.map((assessment) => {
                  const therapistName =
                    [
                      assessment.assessedBy?.firstName,
                      assessment.assessedBy?.lastName,
                    ]
                      .filter(Boolean)
                      .join(" ") || "نامشخص";

                  return (
                    <div
                      key={assessment._id}
                      className="grid grid-cols-[1fr_1.5fr_1fr_auto] items-center bg-white px-1! py-2! text-sm text-gray-700 transition-colors hover:bg-purple-50/40"
                    >
                      {/* حیطه */}
                      <div    onClick={() => {
                        setShowSecAss(assessment);
                      }} className="font-medium text-gray-800">
                        {assessment.domain || "نامشخص"}
                      </div>

                      {/* درمانگر */}
                      <div    onClick={() => {
                        setShowSecAss(assessment);
                      }} className="text-gray-700">{therapistName}</div>

                      {/* تاریخ */}
                      <div    onClick={() => {
                        setShowSecAss(assessment);
                      }} className="text-gray-500">
                        {assessment.createdAt
                          ? new Date(assessment.createdAt).toLocaleDateString(
                              "fa-IR",
                            )
                          : "نامشخص"}
                      </div>

                      {/* ستون ویرایش */}
                      <div className="flex justify-center">
                        {
                        
                        assessment?.assessedBy?._id?.toString() !==
                        user?._id?.toString() ?(
                          <button className="rounded-lg p-2 text-purple-600 transition-colors hover:bg-purple-100 hover:text-purple-800">
                            *
                          </button>
                        ) :
                        assessment?.finished===true?
                         <button
                            onClick={() => {
                             AlertSwal.Error("این ارزیابی تکمیل شده و قابل ویرایش نیست!")
                            }}
                            className="bg-green-600 rounded-lg text-white p-1! "
                            aria-label="تکمیل شده"
                          >
                            تکمیل
                          </button>
                         : (
                          <button
                            onClick={() => {
                              setEditSecondary(assessment);
                              setSecondaryModal(true);
                            }}
                            className="rounded-lg p-2 text-purple-600 transition-colors hover:bg-purple-100 hover:text-purple-800"
                            aria-label="ویرایش ارزیابی"
                          >
                            <FiEdit className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                هنوز ارزیابی ثانویه‌ای ثبت نشده است.
              </div>
            )}
          </div>
          <Pagination
            setPage={setSecPage}
            page={secPage}
            totalPages={SecondryData?.pagination?.totalPages ?? 0}
          />
         
        </section>

        {/* ===== بخش ارزیابی سیستماتیک (داینامیک شده با دیتای واقعی) ===== */}
        <section className="bg-white rounded-3xl shadow-xl m-1! border border-black-100/80 p-2! md:p-8 transition-all hover:shadow-2xl">
          <div className="flex items-center gap-3! mb-6!">
            <div className="p-2.5! bg-rose-50 rounded-xl text-rose-600">
              <FiList className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              ارزیابی سیستماتیک ({systematicAssessments.length} مورد)
            </h2>
          </div>

          <div className="space-y-4">
            {isSystematicLoading ? (
              <div className="flex items-center justify-center py-8! text-rose-600 gap-2!">
                <FiLoader className="w-6 h-6 animate-spin" />
                <span className="text-sm">در حال بارگذاری ارزیابی‌های سیستماتیک...</span>
              </div>
            ) : systematicAssessments.length > 0 ? (
              <div
                className="overflow-hidden rounded-2xl border border-gray-200"
                dir="rtl"
              >
                {/* سربرگ جدول سیستماتیک */}
                <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_auto] bg-gray-150/80 px-4! py-3! text-sm font-bold text-gray-700 bg-gray-50 border-b">
                  <div>عنوان ارزیابی</div>
                  <div>کد ارزیابی</div>
                  <div>وضعیت</div>
                  <div>تاریخ</div>
                  <div className="text-center">مشاهده </div>
                </div>

                {/* ردیف‌های جدول سیستماتیک */}
                <div className="divide-y divide-gray-200">
                  {systematicAssessments.map((result) => (
                    <div
                      key={result._id}
                      className="grid grid-cols-[1.5fr_1fr_1fr_1fr_auto] items-center bg-white px-4! py-3.5! text-sm text-gray-700 transition-colors hover:bg-rose-50/20"
                    >
                      {/* عنوان الگو */}
                      <div className="font-medium text-gray-800"  onClick={() => setAssessmentResultId(result?._id?.toString() ?? null)}>
                        {result.templateSnapshot?.title || "ارزیابی بدون نام"}
                      </div>

                      {/* کد الگو */}
                      <div className="text-gray-500 font-mono"  onClick={() => setAssessmentResultId(result?._id?.toString() ?? null)}>
                        {result.templateSnapshot?.code || "-"}
                      </div>

                      {/* وضعیت ارزیابی */}
                      <div  onClick={() => setAssessmentResultId(result?._id?.toString() ?? null)}>{getStatusBadge(result.status)}</div>

                      {/* تاریخ */}
                      <div className="font-semibold text-gray-800"  onClick={() => setAssessmentResultId(result?._id?.toString() ?? null)}>
                        {
                         `${ new Date(result.startedAt).toLocaleDateString(
                              "fa-IR",
                            )?? 0}`
                         }
                      </div>

                      {/* دکمه‌های عملیاتی */}
                      <div className="flex justify-center gap-2!">
       
                          <button
                            onClick={() => setAssessmentResultId(result?._id?.toString() ?? null)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3! py-1.5! rounded-lg flex items-center gap-1! transition-colors"
                          >
                            <FiEye className="w-3.5 h-3.5" />
                            مشاهده نتیجه
                          </button>
                        
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // باکس نمایش حالت خالی
              <div className="w-full border-2 border-dashed border-gray-200 rounded-2xl p-8! flex flex-col items-center justify-center gap-2! bg-gray-50/50">
                <FiList className="w-10 h-10 text-gray-300" />
                <span className="text-sm text-gray-400">
                  لیست ارزیابی‌های سیستماتیک خالی است
                </span>
              </div>
            )}


          </div>
        </section>
        {/* فوتر */}
        <div className="text-center text-xs text-gray-400 border-t border-gray-200 pt-6 mt-4">
       
        </div>
      </div>
    
      <ViewAssessmentModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        data={ProfileData.patientprofile}
      />
  

      {showSecAss !== null && (
        <SecAssessmentModal
          onClose={() => setShowSecAss(null)}
          assessment={showSecAss}
        />
      )}

      {(assessmentResultID && assessmentResulrDetails!==undefined&&assessmentResulrDetails) &&
      <AssessmentResultModal onClose={()=>{
        setAssessmentResultId(null)
      } } result={assessmentResulrDetails}      
      /> }

      {}
    </div>
  );
};
