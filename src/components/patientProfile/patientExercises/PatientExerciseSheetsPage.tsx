import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, FileText, Calendar, UserRound, Eye, PencilLine } from "lucide-react";
import {  useFindExerciseSheets } from "../../../hooks/exerciseSheet";
import type { IExerciseSheet } from "../../../types/exerciseSheets";
import ExerciseSheetViewModal from "../../exercise-sheet/ExerciseSheetViewModal";
import { useFindPatient, useListPatients } from "../../../hooks/patient";
import { useTherapists } from "../../../hooks/therapist";


type RouteParams = {
  Id?: string;
};

type TherapistRef =
  | string
  | {
      _id: string;
      firstName?: string;
      lastName?: string;
      name?: string;
    };

type TherapistItem = {
  _id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
};

type TherapistGroup = {
  therapist: TherapistItem;
  sheets: IExerciseSheet[];
};

const getReferenceId = (value: unknown): string | undefined => {
  if (!value) return undefined;

  if (typeof value ==="string"){
    return value;
  }

  if (typeof value && "_id" in value) {
    return String(value._id);
  }

  return undefined;
}

const getTherapistName = (therapist?: TherapistItem) => {
  if (!therapist) return "درمانگر نامشخص";

  const fullName = `${therapist.firstName ?? ""} ${
    therapist.lastName ?? ""
  }`.trim();

  return fullName || therapist.name || "درمانگر بدون نام";
};


export function PatientExerciseSheetsPage() {
  const { Id } = useParams<RouteParams>();
  const patientId = Id;
  const navigate = useNavigate();
  const [showSheet, setShowSheet] = useState(false);
  const [sheet, setSheet] = useState(null);


const { data: patients = [] } = useFindPatient({
  _id: patientId,
});

const patient = patients[0];

const { data: therapistsResponse } = useTherapists();

const therapistList: TherapistItem[] = Array.isArray(therapistsResponse)
  ? therapistsResponse
  : ((therapistsResponse as { data?: TherapistItem[] } | undefined)?.data ??
    []);



  const query = useMemo(
    () => ({
      patient: patientId,
    }),
    [patientId],
  );

  const { data, isLoading, isFetching } = useFindExerciseSheets(query);

  const sheets = data?.data ?? [];

const therapistGroups = useMemo<TherapistGroup[]>(() => {
  const groups = new Map<string, TherapistGroup>();

  const findTherapist = (id: string): TherapistItem | undefined => {
    return therapistList.find((therapist) => therapist._id === id);
  };

  const addTherapistIfNeeded = (
    therapistId: string,
    therapistInfo?: TherapistItem,
  ) => {
    if (groups.has(therapistId)) return;

    groups.set(therapistId, {
      therapist:
        therapistInfo ??
        findTherapist(therapistId) ??
        {
          _id: therapistId,
        },
      sheets: [],
    });
  };

  // ابتدا تمام درمانگران ثبت‌شده برای مراجع را اضافه می‌کنیم
  // حتی اگر هیچ برگه‌ای نداشته باشند.
  const patientTherapistRefs = (patient?.therapists ?? []) as TherapistRef[];

  patientTherapistRefs.forEach((therapistRef) => {
    const therapistId = getReferenceId(therapistRef);

    if (!therapistId) return;

    const therapistInfo =
      typeof therapistRef === "object" ? therapistRef : undefined;

    addTherapistIfNeeded(therapistId, therapistInfo);
  });

  // سپس برگه‌ها را بر اساس createdBy در گروه مناسب قرار می‌دهیم.
  sheets.forEach((exerciseSheet) => {
    const createdBy = exerciseSheet.createdBy as TherapistRef | undefined;
    const therapistId = getReferenceId(createdBy);

    if (!therapistId) {
      return;
    }

    const therapistInfo =
      typeof createdBy === "object" ? createdBy : undefined;

    addTherapistIfNeeded(therapistId, therapistInfo);

    groups.get(therapistId)?.sheets.push(exerciseSheet);
  });

  return Array.from(groups.values());
}, [patient?.therapists, sheets, therapistList]);


  if (!patientId) {
    return (
      <div
        dir="rtl"
        className="min-h-screen bg-linear-to-b from-sky-50 via-white to-emerald-50 px-4! py-6!"
      >
        <div className="mx-auto! max-w-3xl rounded-3xl border border-red-100 bg-white p-5! text-sm text-red-600 shadow-sm">
          شناسه مراجع در آدرس پیدا نشد.
        </div>
         <button onClick={()=> navigate(-1)} className="bg-blue-600  text-white rounded-xl m-1! p-2!">بازگشت</button>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-linear-to-b from-sky-50 via-white to-emerald-50 pt-15! px-4! py-6! sm:px-6! lg:px-8!"
    >
      <div className="mx-auto! max-w-5xl space-y-5!">
        {/* Header */}
        <div className="flex flex-col gap-4! rounded-3xl border border-sky-100 bg-white/80 p-5! shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1!">
            <div className="inline-flex items-center gap-2! rounded-full bg-sky-50 px-3! py-1! text-xs font-medium text-sky-700 ring-1 ring-sky-100">
              <FileText className="h-3.5 w-3.5" />
              برگه‌های تمرین مراجع
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-800">
             مراجع: {(patient?.firstName ??"نامشخص") +" "+(patient?.lastName ??"نامشخص")}
            </h1>

            <p className="text-sm leading-6 text-slate-500">
              برگه‌هایی که برای این مراجع ثبت شده‌اند
            </p>
            
          </div>
 <button onClick={()=> navigate(-1)} className="bg-blue-600  text-white rounded-xl m-1! p-2!">بازگشت</button>
          <button
            type="button"
            onClick={() => navigate(`/exercise-sheets/new/${patientId}`)}
            className="inline-flex items-center justify-center gap-2! rounded-2xl bg-linear-to-r from-sky-600 to-emerald-600 px-4! py-2.5! text-sm font-medium text-white shadow-sm transition-all duration-200 hover:from-sky-700 hover:to-emerald-700 hover:shadow-md active:scale-[0.99]"
          >
            <Plus className="h-4 w-4" />
            ایجاد برگه تمرینی جدید
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="rounded-3xl border border-sky-100 bg-white p-6! text-sm text-slate-500 shadow-sm">
            در حال بارگذاری...
          </div>
        ) : sheets.length === 0 ? (
          <div className="rounded-3xl border border-sky-100 bg-white p-6! text-sm text-slate-500 shadow-sm">
            برای این مراجع هنوز برگه تمرینی ثبت نشده است.
          </div>
        ) : (
     <div className="space-y-5!">
  {therapistGroups.map(({ therapist, sheets: therapistSheets }) => (
    <section
      key={therapist._id}
      className="overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm"
    >
      {/* هدر درمانگر */}
      <div className="flex flex-col gap-3! border-b border-sky-100 bg-linear-to-l from-sky-50 to-emerald-50 p-5! sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3!">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-sky-600 to-emerald-600 text-white shadow-sm">
            <UserRound className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-800">
              {getTherapistName(therapist)}
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {therapistSheets.length > 0
                ? `${therapistSheets.length} برگه تمرینی`
                : "هنوز برگه تمرینی ثبت نشده است"}
            </p>
          </div>
        </div>

        <span
          className={`inline-flex w-fit items-center rounded-full px-3! py-1! text-xs font-medium ${
            therapistSheets.length > 0
              ? "bg-emerald-100 text-emerald-700"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {therapistSheets.length > 0 ? "برگه دارد" : "بدون برگه"}
        </span>
      </div>

      {/* برگه‌های درمانگر */}
      {therapistSheets.length === 0 ? (
        <div className="p-6! text-center text">
          
       تمرینی برای مراجع ثبت نکرده است.
        </div>
      ) : (
        <div className="space-y-4! p-5!">
          {therapistSheets.map((exerciseSheet) => (
            <div
              key={exerciseSheet._id}
              className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4! transition hover:border-sky-200 hover:bg-white hover:shadow-sm"
            >
              <div className="flex flex-col gap-4! md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 items-start gap-3!">
                  <div className="h-10div flex h-10 w- rounded-xl bg-sky-100 text-sky-700">
                    <FileText className="h-4 w-4" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold text-slate-800">
                      {exerciseSheet.title}
                    </h3>

                    <div className="mt-2! flex flex-wrap items-center gap-2! text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5! py-1! ring-1 ring-slate-200">
                        <Calendar className="h-3.5 w-3.5" />
                        {exerciseSheet.createdAt
                          ? new Date(
                              exerciseSheet.createdAt,
                            ).toLocaleDateString("fa-IR")
                          : "-"}
                      </span>

                      <span className="rounded-full bg-white px-2.5! py-1! ring-1 ring-slate-200">
                        {exerciseSheet.items?.length ?? 0} تمرین
                      </span>
                    </div>

                    {exerciseSheet.description ? (
                      <p className="mt-3! line-clamp-2 text-sm leading-6 text-slate-600">
                        {exerciseSheet.description}
                      </p>
                    ) : null}
                  </div>
                </div>

                {/* پنل ادمین: فقط مشاهده */}
                <button
                  type="button"
                  onClick={() => {
                    setSheet(exerciseSheet);
                    setShowSheet(true);
                  }}
                  className="inline-flex shrink-0 items-center justify-center gap-2! rounded-2xl border border-emerald-200 bg-emerald-50 px-4! py-2.5! text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
                >
                  <Eye className="h-4 w-4" />
                  مشاهده برگه
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  ))}
</div>

        )}

        {isFetching ? (
          <div className="text-xs text-slate-500">در حال به‌روزرسانی...</div>
        ) : null}

        {showSheet && sheet && (
          <ExerciseSheetViewModal
            sheet={sheet}
            isOpen={showSheet}
            onClose={() => {
              setShowSheet(false);
            }}
          />
        )}
      </div>
    </div>
  );
}