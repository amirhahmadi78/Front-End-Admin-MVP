import { useState, useEffect, useMemo } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useFindPatient } from "../../../hooks/patient";
import { useCreatePatientProfile, useOnepatientProfile } from "../../../hooks/patientprofiles";
import { useTherapists } from "../../../hooks/therapist";
import { useAddRelate, useRemoveRelate } from "../../../hooks/patient-therapist";
import { sortByName } from "../../../utils/sortByAlfba";


/* ---------- نقش‌ها ---------- */
const roleText = (role?: string) => {
  switch (role) {
    case "PSY":
      return "روانشناس";
    case "therapist":
      return "درمانگر";
    case "OT":
      return "کاردرمانگر";
    case "SLP":
      return "گفتاردرمانگر";
    case "PT":
      return "فیزیوتراپیست";
    default:
      return role || "نامشخص";
  }
};

const roleColor = (role?: string) => {
  switch (role) {
    case "SLP":
      return "bg-sky-100 text-sky-700";
    case "OT":
      return "bg-emerald-100 text-emerald-700";
    case "PT":
      return "bg-emerald-100 text-emerald-700";
    case "PSY":
      return "bg-sky-100 text-sky-700";
    default:
      return "bg-emerald-100 text-emerald-700";
  }
};

interface Props {
  onClose: () => void;
}

/* ================================================================
   کامپوننت اصلی
=============================================================== */
export default function QuickAccessAccess({ onClose }: Props) {
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: patientsData, isLoading: loadingPatients } = useFindPatient({
    page: 1,
    limit: 50,
  });

  const patients = patientsData?.patients ?sortByName(patientsData?.patients || []) : [];
  const filteredPatients = useMemo(() => {
    if (!searchTerm.trim()) return patients;
    const t = searchTerm.toLowerCase();
    return patients.filter((p: any) =>
      `${p.firstName || ""} ${p.lastName || ""}`.toLowerCase().includes(t)
    );
  }, [patients, searchTerm]);

  return (
    <div
      dir="rtl"
      onClick={onClose}
      className="fixed inset-0 z-1000 flex items-center justify-center bg-slate-900/45 p-4! backdrop-blur-md animate-[fadeIn_.25s_ease]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-2xl max-h-[92vh] flex-col overflow-hidden rounded-[22px] border border-emerald-100 bg-white shadow-[0_24px_60px_-15px_rgba(16,185,129,.25),0_8px_24px_-10px_rgba(56,189,248,.2)] animate-[popIn_.3s_cubic-bezier(.2,.9,.3,1.2)]"
      >
        {/* Header */}
        <header className="flex items-center justify-between border-b border-emerald-100 bg-linear-to-l from-emerald-50 via-emerald-50/70 to-sky-50 px-6! py-4!">
          <div className="flex items-center gap-3.5">
            {selectedPatient && (
              <button
                type="button"
                onClick={() => setSelectedPatient(null)}
                aria-label="بازگشت"
                className="grid h-9 w-9 place-items-center rounded-full border border-emerald-200 bg-white text-emerald-700 transition hover:border-sky-400 hover:text-sky-600"
              >
                ←
              </button>
            )}
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-linear-to-tr from-emerald-500 to-sky-500 text-xl text-white shadow-lg shadow-emerald-500/30">
              🔐
            </span>
            <div>
              <h2 className="m-0! text-base font-extrabold text-emerald-900">
                دسترسی سریع — دسترسی درمانگران
              </h2>
              <p className="m-0! mt-0.5! text-xs text-emerald-700/70">
                {selectedPatient
                  ? `مراجع: ${selectedPatient.firstName} ${selectedPatient.lastName}`
                  : "یک مراجع را انتخاب کنید"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="بستن"
            className="grid h-9 w-9 place-items-center rounded-full border border-emerald-200 bg-white/70 text-emerald-700 transition hover:rotate-90 hover:border-emerald-400 hover:bg-white"
          >
            ✕
          </button>
        </header>

        {/* Body */}
        {!selectedPatient ? (
          <div className="flex-1 overflow-y-auto px-6! pb-6! pt-5!">
            <input
              type="text"
              placeholder="جستجوی نام یا نام خانوادگی مراجع..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-4! w-full rounded-xl border-2 border-sky-200 bg-sky-50/60 px-4! py-3! text-sm text-emerald-900 outline-none transition placeholder:text-sky-400/70 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
            />

            <div className="flex max-h-115 flex-col gap-2.5 overflow-y-auto pl-1!">
              {loadingPatients ? (
                <div className="py-10! text-center text-sm text-emerald-600/70">
                  در حال بارگذاری...
                </div>
              ) : filteredPatients.length === 0 ? (
                <div className="py-10! text-center text-sm text-emerald-600/70">
                  مراجعی یافت نشد
                </div>
              ) : (
                filteredPatients.map((p: any) => (
                  <button
                    key={p._id}
                    type="button"
                    onClick={() => setSelectedPatient(p)}
                    className="flex items-center gap-3.5 rounded-2xl border! border-emerald-300! bg-white! px-4! py-3! text-right transition hover:-translate-x-1 hover:border-emerald-400 hover:bg-emerald-50/60"
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-linear-to-tr from-emerald-300 to-sky-300 text-sm font-extrabold text-white">
                      {p.firstName?.[0] || "؟"}
                      {p.lastName?.[0] || ""}
                    </span>
                    <div className="flex flex-1 flex-col gap-0.5">
                      <span className="text-sm font-bold text-emerald-900">
                        {p.firstName} {p.lastName}
                      </span>
                      <span className="text-xs text-emerald-700/70">
                        📞 {p.phone || "بدون شماره"}
                      </span>
                    </div>
                    <span className="text-xs text-emerald-600">انتخاب ›</span>
                  </button>
                ))
              )}
            </div>
          </div>
        ) : (
          <AccessEditor
            key={selectedPatient._id}
            patient={selectedPatient}
            onClose={onClose}
          />
        )}

        <ToastContainer position="top-right" autoClose={2500} />
      </div>
    </div>
  );
}

/* ================================================================
   ویرایشگر دسترسی
=============================================================== */
function AccessEditor({
  patient,
  onClose,
}: {
  patient: any;
  onClose: () => void;
}) {
  const {
    data: profileData,
    isLoading: loadingProfile,
    refetch: refetchProfile,
  } = useOnepatientProfile(patient._id);

  const { data: therapists = [], isLoading: loadingTherapists } =
    useTherapists({});

  const { mutate: saveProfile, isPending: saving } = useCreatePatientProfile();
  const { mutate: addRelate, isPending: addingRelate } = useAddRelate();
  const { mutate: removeRelate, isPending: removingRelate } = useRemoveRelate();

  const profile = profileData?.patientprofile || {};
  const patientDetail = profileData?.patient || patient;
  const finished = !!profile.finished;

  const [evaluatedBy, setEvaluatedBy] = useState<string>("");
  const [editableBy, setEditableBy] = useState<string[]>([]);
  const [finishedState, setFinishedState] = useState<boolean>(false);
  const [addRelationSearch, setAddRelationSearch] = useState("");
  const [editableAddSearch, setEditableAddSearch] = useState("");
  const [showRelateDrop, setShowRelateDrop] = useState(false);
  const [showEditableDrop, setShowEditableDrop] = useState(false);

  /* ---------- Sync با داده سرور ---------- */
  useEffect(() => {
    if (!profileData) return;
    setEvaluatedBy(profile.evaluatedBy?._id || "");
    setEditableBy(
      Array.isArray(profile.editableBy)
        ? profile.editableBy.map((e: any) => e._id).filter(Boolean)
        : []
    );
    setFinishedState(!!profile.finished);
  }, [profileData]);

  /* ---------- لیست‌ها ---------- */
  const therapistList = Array.isArray(therapists) ? therapists : [];
  const patientTherapists = Array.isArray(patientDetail?.therapists)
    ? patientDetail.therapists
    : [];
  const patientTherapistIds = patientTherapists.map((t: any) => t._id);

  /* ---------- درمانگران قابل افزودن به رابطه ---------- */
  const availableToRelate = useMemo(
    () =>
      therapistList.filter((t: any) => !patientTherapistIds.includes(t._id)),
    [therapistList, patientTherapistIds]
  );
  const filteredAvailableToRelate = addRelationSearch.trim()
    ? availableToRelate.filter((t: any) =>
        `${t.firstName} ${t.lastName}`
          .toLowerCase()
          .includes(addRelationSearch.toLowerCase())
      )
    : availableToRelate;

  /* ---------- درمانگران قابل افزودن به editableBy ---------- */
  const availableForEditable = useMemo(
    () => therapistList.filter((t: any) => !editableBy.includes(t._id)),
    [therapistList, editableBy]
  );
  const filteredAvailableForEditable = editableAddSearch.trim()
    ? availableForEditable.filter((t: any) =>
        `${t.firstName} ${t.lastName}`
          .toLowerCase()
          .includes(editableAddSearch.toLowerCase())
      )
    : availableForEditable;

  /* ---------- Handlers ---------- */
  const handleAddTherapist = (t: any) => {
    addRelate(
      { patientId: patient._id, therapistId: t._id },
      {
        onSuccess: () => {
          toast.success("درمانگر به مراجع اضافه شد");
          refetchProfile();
          setAddRelationSearch("");
          setShowRelateDrop(false);
        },
        onError: () => toast.error("خطا در افزودن درمانگر"),
      }
    );
  };

  const handleRemoveTherapist = (t: any) => {
    removeRelate(
      { patientId: patient._id, therapistId: t._id },
      {
        onSuccess: () => {
          toast.success("درمانگر از مراجع حذف شد");
          refetchProfile();
        },
        onError: () => toast.error("خطا در حذف درمانگر"),
      }
    );
  };

  const handleAddEditable = (t: any) => {
    setEditableBy((prev) => [...prev, t._id]);
    setEditableAddSearch("");
    setShowEditableDrop(false);
  };

  const handleRemoveEditable = (id: string) => {
    setEditableBy((prev) => prev.filter((x) => x !== id));
  };

  const handleSave = () => {
    const payload: Record<string, any> = {
      patient: patient._id,
      evaluatedBy,
      editableBy,
      finished: finishedState,
    };
    if (profile._id) payload.patientProfile = profile._id;

    saveProfile(payload as any, {
      onSuccess: () => {
        toast.success("دسترسی‌ها با موفقیت ذخیره شد ✅");
        setTimeout(onClose, 700);
      },
      onError: () => toast.error("خطا در ذخیره دسترسی‌ها ❌"),
    });
  };

  /* ---------- Loading ---------- */
  if (loadingProfile || loadingTherapists) {
    return (
      <div className="flex flex-1 items-center justify-center py-16!">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-sky-500" />
          <p className="mt-3! text-sm text-emerald-700/70">
            در حال بارگذاری دسترسی‌ها...
          </p>
        </div>
      </div>
    );
  }

  /* ---------- UI ---------- */
  return (
    <div className="flex-1 overflow-y-auto px-6! pb-7! pt-5!">
      {/* Patient summary card */}
      <div className="mb-5! flex items-center justify-between rounded-2xl border border-emerald-100 bg-linear-to-l from-emerald-50/60 to-sky-50/60 p-3.5!">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-linear-to-tr from-emerald-400 to-sky-400 text-sm font-extrabold text-white shadow-md shadow-emerald-500/20">
            {patientDetail.firstName?.[0]}
            {patientDetail.lastName?.[0]}
          </span>
          <div>
            <div className="text-sm font-extrabold text-emerald-900">
              {patientDetail.firstName} {patientDetail.lastName}
            </div>
            <div className="mt-0.5! text-xs text-emerald-700/70">
              📞 {patientDetail.phone || "بدون شماره"}
            </div>
          </div>
        </div>
        <span
          className={`rounded-full px-3! py-1! text-[11px] font-bold ${
            finished
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {finished ? "ارزیابی تکمیل شده" : "ارزیابی ناقص"}
        </span>
      </div>

      {/* ==================== 1) درمانگران مراجع ==================== */}
      <Section
        icon="🧑‍⚕️"
        title="درمانگران مراجع"
        subtitle="درمانگرانی که به این مراجع اختصاص داده شده‌اند"
        count={patientTherapists.length}
      >
        {patientTherapists.length === 0 ? (
          <EmptyState text="هیچ درمانگری به این مراجع اختصاص داده نشده است" />
        ) : (
          <div className="flex flex-wrap gap-2">
            {patientTherapists.map((t: any) => (
              <Chip
                key={t._id}
                avatar={`${t.firstName?.[0] || ""}${t.lastName?.[0] || ""}`}
                label={`${t.firstName} ${t.lastName}`}
                badge={roleText(t.role)}
                badgeClass={roleColor(t.role)}
                onRemove={() => handleRemoveTherapist(t)}
                removing={removingRelate}
              />
            ))}
          </div>
        )}

        {/* Add relate */}
        <div className="relative mt-3!">
          <input
            type="text"
            placeholder="افزودن درمانگر به این مراجع..."
            value={addRelationSearch}
            onChange={(e) => {
              setAddRelationSearch(e.target.value);
              setShowRelateDrop(true);
            }}
            onFocus={() => setShowRelateDrop(true)}
            className="w-full rounded-xl border border-emerald-200 bg-white px-3.5! py-2.5! text-xs text-emerald-900 outline-none transition placeholder:text-emerald-400/70 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
          />
          {showRelateDrop && addRelationSearch.trim() && (
            <DropdownList
              items={filteredAvailableToRelate}
              onPick={handleAddTherapist}
              emptyText="درمانگری برای افزودن یافت نشد"
              onClose={() => setShowRelateDrop(false)}
            />
          )}
        </div>
      </Section>

      {/* ==================== 2) ارزیاب اصلی ==================== */}
      <Section
        icon="🎯"
        title="ارزیاب اصلی"
        subtitle="درمانگر مسئول ارزیابی اولیه مراجع"
      >
        {finished ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5!">
            <div className="flex items-start gap-2.5">
              <span className="text-lg">🔒</span>
              <div className="flex-1">
                <div className="text-xs font-extrabold text-amber-800">
                  ارزیابی اولیه تکمیل شده است
                </div>
                <div className="mt-1! text-[11px] leading-relaxed text-amber-700/80">
                  امکان تغییر ارزیاب اصلی وجود ندارد. برای تغییر، ابتدا وضعیت
                  تکمیل را برداشته و ذخیره کنید.
                </div>
                {profile.evaluatedBy && (
                  <div className="mt-2.5! flex items-center gap-2 rounded-lg bg-white px-2.5! py-1.5!">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-purple-500 text-[11px] font-extrabold text-white">
                      {profile.evaluatedBy.firstName?.[0]}
                      {profile.evaluatedBy.lastName?.[0]}
                    </span>
                    <span className="text-xs font-bold text-emerald-900">
                      {profile.evaluatedBy.firstName}{" "}
                      {profile.evaluatedBy.lastName}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <select
            value={evaluatedBy}
            onChange={(e) => setEvaluatedBy(e.target.value)}
            className="w-full rounded-xl border border-emerald-200 bg-white px-3.5! py-2.5! text-sm text-emerald-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
          >
            <option value="">-- انتخاب ارزیاب اصلی --</option>
            {therapistList.map((t: any) => (
              <option key={t._id} value={t._id}>
                {t.firstName} {t.lastName} — {roleText(t.role)}
              </option>
            ))}
          </select>
        )}
      </Section>

      {/* ==================== 3) ارزیاب‌های ثانویه ==================== */}
      <Section
        icon="👥"
        title="درمانگران با دسترسی ارزیابی ثانویه"
        subtitle="درمانگرانی که می‌توانند ارزیابی‌های بعدی را ثبت کنند"
        count={editableBy.length}
      >
        {editableBy.length === 0 ? (
          <EmptyState text="هیچ درمانگری برای ارزیابی ثانویه انتخاب نشده است" />
        ) : (
          <div className="flex flex-wrap gap-2">
            {editableBy.map((id) => {
              const t = therapistList.find((x: any) => x._id === id);
              if (!t) return null;
              return (
                <Chip
                  key={id}
                  avatar={`${t.firstName?.[0] || ""}${t.lastName?.[0] || ""}`}
                  label={`${t.firstName} ${t.lastName}`}
                  badge={roleText(t.role)}
                  badgeClass={roleColor(t.role)}
                  onRemove={() => handleRemoveEditable(id)}
                />
              );
            })}
          </div>
        )}

        <div className="relative mt-3!">
          <input
            type="text"
            placeholder="افزودن درمانگر برای ارزیابی ثانویه..."
            value={editableAddSearch}
            onChange={(e) => {
              setEditableAddSearch(e.target.value);
              setShowEditableDrop(true);
            }}
            onFocus={() => setShowEditableDrop(true)}
            className="w-full rounded-xl border border-emerald-200 bg-white px-3.5! py-2.5! text-xs text-emerald-900 outline-none transition placeholder:text-emerald-400/70 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
          />
          {showEditableDrop && editableAddSearch.trim() && (
            <DropdownList
              items={filteredAvailableForEditable}
              onPick={handleAddEditable}
              emptyText="درمانگری برای افزودن یافت نشد"
              onClose={() => setShowEditableDrop(false)}
            />
          )}
        </div>
      </Section>

      {/* ==================== 4) وضعیت تکمیل ==================== */}
      <label className="mt-5! flex cursor-pointer items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/40 px-4! py-3! transition hover:border-emerald-300">
        <input
          type="checkbox"
          checked={finishedState}
          onChange={(e) => setFinishedState(e.target.checked)}
          className="h-5 w-5 accent-emerald-500"
        />
        <div className="flex-1">
          <div className="text-sm font-extrabold text-emerald-900">
            ارزیابی اولیه تکمیل شده است
          </div>
          <div className="mt-0.5! text-[11px] text-emerald-700/70">
            با فعال بودن این گزینه، ارزیاب اصلی قابل تغییر نخواهد بود.
          </div>
        </div>
      </label>

      {/* ==================== Actions ==================== */}
      <div className="mt-6! flex gap-2.5">
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="flex-1 rounded-xl bg-emerald-50 px-4! py-3! text-sm font-extrabold text-emerald-800 transition hover:bg-emerald-100 disabled:opacity-60"
        >
          انصراف
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || addingRelate}
          className="flex-2 rounded-xl bg-linear-to-tr from-emerald-500 to-sky-500 px-4! py-3! text-sm font-extrabold text-white shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:shadow-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
        </button>
      </div>
    </div>
  );
}

/* ================================================================
   اجزای کمکی
=============================================================== */

function Section({
  icon,
  title,
  subtitle,
  count,
  children,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4! rounded-2xl border border-emerald-100 bg-white p-4!">
      <div className="mb-3! flex items-center gap-2.5">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-linear-to-tr from-emerald-100 to-sky-100 text-base">
          {icon}
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="m-0! text-sm font-extrabold text-emerald-900">
              {title}
            </h3>
            {typeof count === "number" && (
              <span className="rounded-full bg-emerald-100 px-2! py-0.5! text-[10px] font-bold text-emerald-700">
                {count}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="m-0! mt-0.5! text-[11px] text-emerald-700/70">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

function Chip({
  avatar,
  label,
  badge,
  badgeClass,
  onRemove,
  removing,
}: {
  avatar: string;
  label: string;
  badge?: string;
  badgeClass?: string;
  onRemove?: () => void;
  removing?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-white py-1! pr-1! pl-2.5! transition hover:border-emerald-300">
      <span className="grid h-7 w-7 place-items-center rounded-full bg-linear-to-tr from-emerald-400 to-sky-400 text-[10px] font-extrabold text-white">
        {avatar}
      </span>
      <span className="text-xs font-bold text-emerald-900">{label}</span>
      {badge && (
        <span
          className={`rounded-full px-2! py-0.5! text-[10px] font-bold ${
            badgeClass || "bg-emerald-100 text-emerald-700"
          }`}
        >
          {badge}
        </span>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          disabled={removing}
          className="grid h-6 w-6 place-items-center rounded-full text-emerald-600 transition hover:bg-rose-100 hover:text-rose-600 disabled:opacity-40"
        >
          ✕
        </button>
      )}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-emerald-200 bg-emerald-50/30 px-3! py-4! text-center text-[11px] text-emerald-700/70">
      {text}
    </div>
  );
}

function DropdownList({
  items,
  onPick,
  emptyText,
  onClose,
}: {
  items: any[];
  onPick: (item: any) => void;
  emptyText: string;
  onClose: () => void;
}) {
  return (
    <>
      {/* Backdrop برای بستن هنگام کلیک بیرون */}
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div className="absolute right-0 left-0 top-full z-20 mt-1.5! max-h-56 overflow-y-auto rounded-2xl border border-emerald-100 bg-white shadow-[0_20px_40px_-10px_rgba(16,185,129,.25)]">
        {items.length === 0 ? (
          <div className="p-4! text-center text-xs text-emerald-600/70">
            {emptyText}
          </div>
        ) : (
          items.map((t) => (
            <button
              key={t._id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onPick(t);
              }}
              className="flex w-full items-center bg-amber-50! gap-3 border-b border-emerald-50! px-3! py-2.5! text-right transition last:border-b-0 hover:bg-emerald-50/60"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-linear-to-tr from-emerald-300 to-sky-300 text-[11px] font-extrabold text-white">
                {t.firstName?.[0] || "؟"}
                {t.lastName?.[0] || ""}
              </span>
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="text-xs font-bold text-emerald-900">
                  {t.firstName} {t.lastName}
                </span>
                <span className="text-[10px] text-emerald-700/60">
                  {roleText(t.role)}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </>
  );
}