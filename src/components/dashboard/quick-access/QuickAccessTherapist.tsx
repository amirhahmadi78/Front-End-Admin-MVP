import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  useTherapists,
  useMakeTherapist,
  useEditTherapist,
} from "../../../hooks/therapist";
import type {
  DTOmakeTherapist,
  DTOeditTherapist,
} from "../../../types/therapists";
import TherapistForm from "../../therapists/TherapistForm";

type Mode = "menu" | "create" | "select" | "edit";

interface Props {
  onClose: () => void;
}

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

/* ---------- استایل تزریقی به فرم داخلی ---------- */
const formWrapper =
  "mt-2! " +
  "[&_label]:block [&_label]:mt-2.5! [&_label]:mb-1.5! [&_label]:text-sm [&_label]:font-bold [&_label]:text-emerald-900 " +
  "[&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-emerald-200 [&_input]:bg-emerald-50/50 [&_input]:px-3.5! [&_input]:py-2.5! [&_input]:text-sm [&_input]:text-emerald-900 [&_input]:outline-none [&_input]:transition [&_input]:placeholder:text-emerald-400/70 [&_input]:focus:border-sky-400 [&_input]:focus:bg-white [&_input]:focus:ring-4 [&_input]:focus:ring-sky-100 " +
  "[&_select]:w-full [&_select]:rounded-xl [&_select]:border [&_select]:border-emerald-200 [&_select]:bg-emerald-50/50 [&_select]:px-3.5! [&_select]:py-2.5! [&_select]:text-sm [&_select]:text-emerald-900 [&_select]:outline-none [&_select]:transition [&_select]:focus:border-sky-400 [&_select]:focus:bg-white [&_select]:focus:ring-4 [&_select]:focus:ring-sky-100 " +
  "[&_textarea]:w-full [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-emerald-200 [&_textarea]:bg-emerald-50/50 [&_textarea]:px-3.5! [&_textarea]:py-2.5! [&_textarea]:text-sm [&_textarea]:text-emerald-900 [&_textarea]:outline-none [&_textarea]:transition [&_textarea]:focus:border-sky-400 [&_textarea]:focus:bg-white [&_textarea]:focus:ring-4 [&_textarea]:focus:ring-sky-100 " +
  "[&_.error-message]:mt-1! [&_.error-message]:text-xs [&_.error-message]:font-medium [&_.error-message]:text-rose-500 " +
  "[&_h3]:mt-4! [&_h3]:mb-2! [&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-emerald-800 " +
  /* روزهای کاری */
  "[&_.workday-row]:mt-2! [&_.workday-row]:space-y-2 [&_.workday-row]:rounded-xl [&_.workday-row]:border [&_.workday-row]:border-emerald-100 [&_.workday-row]:bg-emerald-50/40 [&_.workday-row]:p-3! " +
  "[&_.time-inputs]:flex [&_.time-inputs]:gap-2 " +
  "[&_.time-group]:flex-1 [&_.time-group_label]:text-xs [&_.time-group_label]:mt-0! " +
  /* skills checkboxes */
  "[&_.skills-container]:grid [&_.skills-container]:grid-cols-2 [&_.skills-container]:gap-2 [&_.skills-container]:rounded-xl [&_.skills-container]:border [&_.skills-container]:border-emerald-100 [&_.skills-container]:bg-emerald-50/40 [&_.skills-container]:p-3! " +
  "[&_.skills-container_label]:flex [&_.skills-container_label]:items-center [&_.skills-container_label]:gap-2 [&_.skills-container_label]:rounded-lg [&_.skills-container_label]:bg-white [&_.skills-container_label]:px-2.5! [&_.skills-container_label]:py-2! [&_.skills-container_label]:text-xs [&_.skills-container_label]:font-bold [&_.skills-container_label]:text-emerald-800 [&_.skills-container_label]:transition [&_.skills-container_label]:hover:border-sky-300 " +
  "[&_.skills-container_input]:h-4 [&_.skills-container_input]:w-4 [&_.skills-container_input]:accent-emerald-500 " +
  /* actions */
  "[&_.modal-actions]:mt-6! [&_.modal-actions]:flex [&_.modal-actions]:gap-2.5 " +
  "[&_.modal-actions_button]:flex-1 [&_.modal-actions_button]:rounded-xl [&_.modal-actions_button]:px-4! [&_.modal-actions_button]:py-3! [&_.modal-actions_button]:text-sm [&_.modal-actions_button]:font-extrabold [&_.modal-actions_button]:transition " +
  "[&_.modal-actions_button[type=submit]]:bg-linear-to-tr [&_.modal-actions_button[type=submit]]:from-emerald-500 [&_.modal-actions_button[type=submit]]:to-sky-500 [&_.modal-actions_button[type=submit]]:text-white [&_.modal-actions_button[type=submit]]:shadow-lg [&_.modal-actions_button[type=submit]]:shadow-emerald-500/30 [&_.modal-actions_button[type=submit]]:hover:-translate-y-0.5 [&_.modal-actions_button[type=submit]]:hover:shadow-emerald-500/40 " +
  "[&_.modal-actions_button[type=button]]:bg-emerald-50 [&_.modal-actions_button[type=button]]:text-emerald-800 [&_.modal-actions_button[type=button]]:hover:bg-emerald-100 " +
  /* حذف دکمه‌های کار روزهای کاری با ظاهر تمیزتر */
  "[&_.workday-row_button]:rounded-lg [&_.workday-row_button]:bg-white [&_.workday-row_button]:px-3! [&_.workday-row_button]:py-2! [&_.workday-row_button]:text-xs [&_.workday-row_button]:font-bold [&_.workday-row_button]:text-rose-600 [&_.workday-row_button]:ring-1 [&_.workday-row_button]:ring-rose-200 [&_.workday-row_button]:transition [&_.workday-row_button]:hover:bg-rose-50 " +
  /* دکمه اضافه کردن روز کاری */
  "[&>form>button[type=button]]:mt-2! [&>form>button[type=button]]:rounded-xl [&>form>button[type=button]]:border-2 [&>form>button[type=button]]:border-dashed [&>form>button[type=button]]:border-emerald-300 [&>form>button[type=button]]:bg-emerald-50/50 [&>form>button[type=button]]:px-4! [&>form>button[type=button]]:py-2.5! [&>form>button[type=button]]:text-xs [&>form>button[type=button]]:font-extrabold [&>form>button[type=button]]:text-emerald-700 [&>form>button[type=button]]:transition [&>form>button[type=button]]:hover:border-emerald-400 [&>form>button[type=button]]:hover:bg-emerald-50";

export default function QuickAccessTherapist({ onClose }: Props) {
  const [mode, setMode] = useState<Mode>("menu");
  const [editingTherapist, setEditingTherapist] =
    useState<DTOeditTherapist | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("name");

  const { data: therapists, isLoading: loadingTherapists } = useTherapists({});
  const { mutate: makeTherapist } = useMakeTherapist();
  const { mutate: editTherapist } = useEditTherapist();

  /* ---------- فیلتر ---------- */
  const list = Array.isArray(therapists) ? therapists : [];
  const term = searchTerm.toLowerCase().trim();
  const filtered = !term
    ? list
    : list.filter((t: any) => {
        const fullName = `${t.firstName || ""} ${t.lastName || ""}`.toLowerCase();
        const role = roleText(t.role);
        switch (searchField) {
          case "phone":
            return (t.phone || "").includes(term);
          case "role":
            return role.includes(term);
          case "name":
          default:
            return fullName.includes(term);
        }
      });

  /* ---------- Handlers ---------- */
  const handleCreate = (formData: DTOmakeTherapist) => {
    makeTherapist(formData, {
      onSuccess: () => {
        toast.success("درمانگر جدید با موفقیت ثبت شد ✅");
        setTimeout(onClose, 700);
      },
      onError: () => toast.error("خطا در ثبت درمانگر ❌"),
    });
  };

  const handleEdit = (formData: DTOmakeTherapist) => {
    if (!editingTherapist) return;
    const payload: DTOeditTherapist = {
      ...formData,
      _id: editingTherapist._id,
    };
    editTherapist(payload, {
      onSuccess: () => {
        toast.success("اطلاعات درمانگر ویرایش شد ✅");
        setTimeout(onClose, 700);
      },
      onError: () => toast.error("خطا در ویرایش درمانگر ❌"),
    });
  };

  const goBack = () => {
    setEditingTherapist(null);
    setMode("menu");
  };

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
        {/* ============ Header ============ */}
        <header className="flex items-center justify-between border-b border-emerald-100 bg-linear-to-l from-emerald-50 via-emerald-50/70 to-sky-50 px-6! py-4!">
          <div className="flex items-center gap-3.5">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-linear-to-tr from-emerald-500 to-sky-500 text-xl text-white shadow-lg shadow-emerald-500/30">
              🩺
            </span>
            <div>
              <h2 className="m-0! text-base font-extrabold text-emerald-900">
                دسترسی سریع — درمانگران
              </h2>
              <p className="m-0! mt-0.5! text-xs text-emerald-700/70">
                {mode === "menu" && "یک عملیات را انتخاب کنید"}
                {mode === "create" && "افزودن درمانگر جدید"}
                {mode === "select" && "انتخاب درمانگر برای ویرایش"}
                {mode === "edit" && "ویرایش اطلاعات درمانگر"}
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

        {/* ============ Menu ============ */}
        {mode === "menu" && (
          <div className="grid grid-cols-1 gap-4 p-7! sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setMode("create")}
              className="group flex flex-col items-center rounded-2xl border-2 border-emerald-200 bg-linear-to-b from-emerald-50 to-emerald-100/60 px-5! py-7! text-center transition hover:-translate-y-1 hover:border-emerald-400 hover:shadow-[0_14px_28px_-8px_rgba(16,185,129,.35)]"
            >
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-white text-3xl shadow-sm">
                ➕
              </span>
              <h3 className="mt-3! mb-1.5! text-base font-extrabold text-emerald-900">
                درمانگر جدید
              </h3>
              <p className="m-0! text-xs leading-relaxed text-emerald-700/70">
                افزودن سریع یک درمانگر تازه به سیستم
              </p>
            </button>

            <button
              type="button"
              onClick={() => setMode("select")}
              className="group flex flex-col items-center rounded-2xl border-2 border-sky-200 bg-linear-to-b from-sky-50 to-sky-100/60 px-5! py-7! text-center transition hover:-translate-y-1 hover:border-sky-400 hover:shadow-[0_14px_28px_-8px_rgba(56,189,248,.35)]"
            >
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-white text-3xl shadow-sm">
                ✏️
              </span>
              <h3 className="mt-3! mb-1.5! text-base font-extrabold text-emerald-900">
                ویرایش درمانگر
              </h3>
              <p className="m-0! text-xs leading-relaxed text-emerald-700/70">
                جستجو، انتخاب و ویرایش اطلاعات درمانگر
              </p>
            </button>
          </div>
        )}

        {/* ============ Body ============ */}
        {mode !== "menu" && (
          <div className="flex-1 overflow-y-auto px-6! pb-7! pt-4!">
            <button
              type="button"
              onClick={mode === "edit" ? () => setMode("select") : goBack}
              className="mb-3! py-1.5! text-xs font-extrabold text-sky-600 transition hover:text-emerald-600"
            >
              {mode === "edit" ? "→ بازگشت به لیست" : "→ بازگشت به منو"}
            </button>

            {/* ---------- Create ---------- */}
            {mode === "create" && (
              <div className={formWrapper}>
                <TherapistForm
                  key="create"
                  onSubmit={handleCreate}
                  onCancel={goBack}
                  editingTherapist={null}
                />
              </div>
            )}

            {/* ---------- Select ---------- */}
            {mode === "select" && (
              <>
                {/* Search */}
                <div className="mb-4! flex gap-2.5">
                  <input
                    type="text"
                    placeholder="جستجوی نام، شماره یا تخصص..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className=" rounded-xl border-2 border-sky-200 bg-sky-50/60 px-4! py-3! text-sm text-emerald-900 outline-none transition placeholder:text-sky-400/70 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                  />
                  <select
                    value={searchField}
                    onChange={(e) => setSearchField(e.target.value)}
                    className="rounded-xl! border-2! border-emerald-200 bg-emerald-50/60 px-3! py-3! text-xs font-bold text-emerald-800 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                  >
                    <option value="name">نام</option>
                    <option value="phone">تلفن</option>
                    <option value="role">تخصص</option>
                  </select>
                </div>

                {/* List */}
                <div className="flex max-h-105 flex-col gap-2.5 overflow-y-auto pl-1!">
                  {loadingTherapists ? (
                    <div className="py-10! text-center text-sm text-emerald-600/70">
                      در حال بارگذاری...
                    </div>
                  ) : filtered.length === 0 ? (
                    <div className="py-10! text-center text-sm text-emerald-600/70">
                      درمانگری یافت نشد
                    </div>
                  ) : (
                    filtered.map((t: any) => (
                      <button
                        type="button"
                        key={t._id}
                        onClick={() => {
                          setEditingTherapist(t);
                          setMode("edit");
                        }}
                        className="flex items-center gap-3.5 rounded-2xl border! border-emerald-300! bg-white! px-4! py-3! text-right transition hover:-translate-x-1 hover:border-emerald-400 hover:bg-emerald-50/60"
                      >
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-linear-to-tr from-emerald-300 to-sky-300 text-sm font-extrabold text-white">
                          {t.firstName?.[0] || "؟"}
                          {t.lastName?.[0] || ""}
                        </span>
                        <div className="flex flex-1 flex-col gap-0.5">
                          <span className="text-sm font-bold text-emerald-900">
                            {t.firstName} {t.lastName}
                          </span>
                          <span className="text-xs text-emerald-700/70">
                            📞 {t.phone || "بدون شماره"}
                          </span>
                        </div>
                        <span
                          className={`rounded-full px-2.5! py-1! text-[11px] font-bold ${roleColor(
                            t.role
                          )}`}
                        >
                          {roleText(t.role)}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </>
            )}

            {/* ---------- Edit ---------- */}
            {mode === "edit" && editingTherapist && (
              <div className={formWrapper}>
                <TherapistForm
                  key={editingTherapist._id}
                  onSubmit={handleEdit}
                  onCancel={() => setMode("select")}
                  editingTherapist={editingTherapist}
                />
              </div>
            )}
          </div>
        )}

        <ToastContainer position="top-right" autoClose={2500} />
      </div>
    </div>
  );
}