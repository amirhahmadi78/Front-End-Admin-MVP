import { useNavigate, useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { useCreatePatientProfile, useOnepatientProfile } from "../../../hooks/patientprofiles";
import EditAccessModal from "./EditPatientProfile";
import type { CreatePatientProfileDto } from "../dto/CreatePatient.dto";
import { useTherapists } from "../../../hooks/therapist";


const OnePatientProfile = () => {
  const { Id } = useParams<{ Id: string }>();
  const { data, isLoading } = useOnepatientProfile(Id);
  const [editModal,setEditModal]=useState(false)
  const navigate = useNavigate();
const {mutate:CreatePatientProfile}=useCreatePatientProfile()
  const patientProfile = useMemo(() => data?.patientprofile || {}, [data]);
  const patient = useMemo(() => data?.patient || {}, [data]);
  const {data:therapists , isLoading:therapistLoading}=useTherapists()
    
const handleEditPatientProfile=async (data:CreatePatientProfileDto)=>{
  data.patient=Id
  if(patientProfile?._id){
data.patientProfile=patientProfile._id
  }
 

  
  CreatePatientProfile(data)
 setEditModal(false)
}


  const loading = isLoading;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">در حال بارگذاری اطلاعات...</p>
        </div>
      </div>
    );
  }

  if (!patient || !patient._id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">مراجعی با این شناسه یافت نشد.</p>
      </div>
    );
  }

  // ارزیاب اصلی (populate شده)
  const evaluatedBy = patientProfile.evaluatedBy || null;
  // درمانگران قابل ویرایش (populate شده)
  const editableBy = patientProfile.editableBy || [];

  return (
    <div className="min-h-screen bg-linear-to-br  from-blue-50 via-white to-indigo-50 rtl">
      <div className="w-full px-4! py-8! pt-18!">
        {/* هدر با نام و نام خانوادگی */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-2! mb-4! border border-white/30">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4!">
              <div className="p-2! bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  {patient.firstName} {patient.lastName}
                </h1>
                {patient.therapists && patient.therapists.length > 0 && (
                  <p className="text-sm text-gray-500 mt-2!">
                    درمانگران:{" "}
                    {patient.therapists
                      .map((t) => `${t.firstName} ${t.lastName}`)
                      .join("، ")}
                  </p>
                )}
              </div>
              <button
                onClick={() => navigate(-1)}
                className="bg-blue-600 text-white rounded-xl m-1! p-2!"
              >
                بازگشت
              </button>
            </div>
            {/* دکمه ویرایش (موقت) */}
            <button
              onClick={() => setEditModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4! py-2! my-2! flex items-center gap-2 transition"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              ویرایش دسترسی 
            </button>
          </div>
        </div>

        {/* بخش ارزیاب اصلی و وضعیت finished */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6! mb-3!">
          {/* کارت ارزیاب اصلی */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-md p-3! border border-white/50">
            <div className="flex items-center gap-3! mb-4!">
              <div className="p-2! bg-purple-100 rounded-lg">
                <svg
                  className="w-5 h-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                ارزیاب اصلی
              </h3>
            </div>
            {evaluatedBy ? (
              <div className="flex items-center gap-4 p-3! bg-purple-50 rounded-xl">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {evaluatedBy.firstName?.[0]}
                  {evaluatedBy.lastName?.[0]}
                </div>
                <div>
                  <p className="font-medium text-gray-800">
                    {evaluatedBy.firstName} {evaluatedBy.lastName}
                  </p>
                 
                </div>
              </div>
            ) : (
              <p className="text-gray-500">ارزیابی تعیین نشده</p>
            )}
          </div>

          {/* کارت وضعیت finished */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-md p-3! border border-white/50">
            <div className="flex items-center gap-3! mb-2!">
              <div
                className={`p-2 rounded-lg ${
                  patientProfile.finished ? "bg-emerald-100" : "bg-amber-100"
                }`}
              >
                {patientProfile.finished ? (
                  <svg
                    className="w-5 h-5 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 text-amber-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M10.29 3.86l-7.5 13A1 1 0 003.67 18h16.66a1 1 0 00.88-1.5l-7.5-13a1 1 0 00-1.74 0z"
                    />
                  </svg>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                وضعیت تکمیل
              </h3>
            </div>
            <div className="flex items-center justify-between p-3! rounded-xl bg-gray-50">
              <span
                className={`font-medium ${
                  patientProfile.finished
                    ? "text-emerald-700"
                    : "text-amber-700"
                }`}
              >
                {patientProfile.finished
                  ? "ارزیابی اولیه تکمیل شده است"
                  : "ارزیابی اولیه تکمیل نشده است"}
              </span>
              <span
                className={`px-3! py-1! rounded-full text-xs font-bold ${
                  patientProfile.finished
                    ? "bg-emerald-200 text-emerald-800"
                    : "bg-amber-200 text-amber-800"
                }`}
              >
                {patientProfile.finished ? "تکمیل شده" : "ناقص"}
              </span>
            </div>
          </div>
        </div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-6! mb-3!">
  {/* کارت درمانگران قابل ویرایش (editableBy) */}
  <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-md p-4! border border-white/50">
    <div className="flex items-center gap-3! mb-5!">
      <div className="p-2! bg-indigo-100 rounded-lg">
        <svg
          className="w-5 h-5 text-indigo-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-800">
        درمانگران با دسترسی انجام ارزیابی
      </h3>
    </div>

    {editableBy.length > 0 ? (
      <div className="flex flex-wrap gap-3!">
        {editableBy.map((therapist: any, index: number) => (
          <div
            key={index}
            className="flex items-center gap-3 bg-indigo-50 px-2! py-2! rounded-full border border-indigo-200"
          >
            <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {therapist.firstName?.[0]}
              {therapist.lastName?.[0]}
            </div>
            <span className="text-gray-800 font-medium">
              {therapist.firstName} {therapist.lastName}
            </span>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-gray-500">
        هیچ درمانگری برای ویرایش تعیین نشده است.
      </p>
    )}
  </div>

  {/* کارت مطالعه‌ی پرونده درمانی */}
  <div
    onClick={() => navigate(`/patientprofile/${patient._id}/assessments`)}
    className="group bg-white/70 backdrop-blur-sm rounded-2xl shadow-md p-4! border border-white/50 hover:border-blue-400 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer"
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2! bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
          <svg
            className="w-5 h-5 text-blue-600 group-hover:text-blue-800"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">
          مطالعه‌ی ارزیابی های درمانی
        </h2>
      </div>
      {/* آیکون فلش جهت‌دار (chevron left برای RTL) */}
      <svg
        className="w-6 h-6 text-blue-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          d="M15 19l-7-7 7-7"
        />
      </svg>
    </div>
    <p className="text-sm text-gray-400 mt-2 mr-12">
      برای مشاهده‌ی جزئیات ارزیابی‌ها کلیک کنید
    </p>
  </div>
    <div
    onClick={() => navigate(`/patientprofile/${patient._id}/exercises`)}
    className="group bg-white/70 backdrop-blur-sm rounded-2xl shadow-md p-4! border border-white/50 hover:border-blue-400 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer"
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2! bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
          <svg
            className="w-5 h-5 text-blue-600 group-hover:text-blue-800"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">
          مطالعه‌ی برگه های تمرینات
        </h2>
      </div>
      {/* آیکون فلش جهت‌دار (chevron left برای RTL) */}
      <svg
        className="w-6 h-6 text-blue-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          d="M15 19l-7-7 7-7"
        />
      </svg>
    </div>
    <p className="text-sm text-gray-400 mt-2 mr-12">
      برای مشاهده‌ی جزئیات ارزیابی‌ها کلیک کنید
    </p>
  </div>
</div>
      </div>
      {editModal&& <EditAccessModal loading={therapistLoading} isOpen={editModal} onClose={()=>{setEditModal(false)} } therapists={therapists} defaultValues={ {evaluatedBy:patientProfile?.evaluatedBy?._id,
            editableBy:Array.isArray(patientProfile.editableBy)? patientProfile.editableBy.map(i=>i?._id ?? "") : [],
            finished:patientProfile.finished}} onSubmit={ handleEditPatientProfile}/>}
    </div>
  );
};

export default OnePatientProfile;