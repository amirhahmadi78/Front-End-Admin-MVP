import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useTherapists } from "../../../hooks/therapist";
import { useMakeLeaveTH } from "../../../hooks/leaves";
import type { ICreateLeaveRequestDTO } from "../../../types/leaves";

interface Props {
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormValues {
  user: any;
  type: "daily" | "hourly";
  startDate: Date | null;
  endDate: Date | null;
  startTime: string;
  endTime: string;
  reason: string;
}

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

export default function QuickAccessLeave({ onClose, onSuccess }: Props) {
  const { data: therapists } = useTherapists({});
  const [showTherapistList, setShowTherapistList] = useState(false);
  const [searchTherapist, setSearchTherapist] = useState("");

  const { mutate: createLeave, isPending } = useMakeLeaveTH();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      user: null,
      type: "daily",
      startDate: null,
      endDate: null,
      startTime: "",
      endTime: "",
      reason: "",
    },
  });

  const watchType = watch("type");
  const watchUser = watch("user");
  const watchReason = watch("reason");
  const watchStartDate = watch("startDate");

  const filteredTherapists = Array.isArray(therapists)
    ? therapists.filter((t: any) =>
        `${t.firstName || ""} ${t.lastName || ""}`
          .toLowerCase()
          .includes(searchTherapist.toLowerCase())
      )
    : [];

  const onSubmit = (data: FormValues) => {
    if (!data.user?._id) {
      toast.error("انتخاب درمانگر الزامی است");
      return;
    }

    const requestData: ICreateLeaveRequestDTO = {
      user: data.user._id,
      userType: "Therapist",
      therapist: data.user._id,
      type: data.type,
      startDate: new Date(data.startDate as Date).toISOString(),
      endDate:
        data.type === "daily" && data.endDate
          ? new Date(data.endDate).toISOString()
          : new Date(data.startDate as Date).toISOString(),
      reason: data.reason,
    };

    if (data.type === "hourly") {
      requestData.startTime = data.startTime;
      requestData.endTime = data.endTime;
    }

    createLeave(requestData, {
      onSuccess: () => {
        toast.success("درخواست مرخصی با موفقیت ثبت شد ✅");
        reset();
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 800);
      },
      onError: () => toast.error("خطا در ثبت درخواست ❌"),
    });
  };

  const inputBase =
    "w-full rounded-xl border! border-emerald-200! bg-white! px-3.5! py-2.5! text-sm text-emerald-900 outline-none transition placeholder:text-emerald-400/70 focus:border-sky-400 focus:ring-4 focus:ring-sky-100";
  const labelBase = "mb-1.5! block text-xs font-bold text-emerald-900";
  const errorBase = "mt-1! text-xs font-medium text-rose-500";

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
              🌴
            </span>
            <div>
              <h2 className="m-0! text-base font-extrabold text-emerald-900">
                دسترسی سریع — ثبت مرخصی
              </h2>
              <p className="m-0! mt-0.5! text-xs text-emerald-700/70">
                ثبت سریع درخواست مرخصی برای درمانگر
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

        {/* ============ Body ============ */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 space-y-4 overflow-y-auto px-6! pb-6! pt-5!"
        >
          {/* -------- Therapist Selector -------- */}
          <div>
            <label className={labelBase}>
              درمانگر <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowTherapistList((v) => !v)}
                className={`${inputBase} flex items-center justify-between text-right ${
                  errors.user ? "border-rose-400 ring-4 ring-rose-100" : ""
                }`}
              >
                <span
                  className={
                    watchUser
                      ? "font-bold text-emerald-900"
                      : "text-emerald-400/70"
                  }
                >
                  {watchUser
                    ? `${watchUser.firstName} ${watchUser.lastName}`
                    : "انتخاب درمانگر..."}
                </span>
                <span className="text-xs text-emerald-700">
                  {showTherapistList ? "▲" : "▼"}
                </span>
              </button>

              {showTherapistList && (
                <div className="absolute top-full right-0 left-0 z-20 mt-2! overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-[0_20px_40px_-10px_rgba(16,185,129,.25)]">
                  <div className="border-b border-emerald-100 p-2!">
                    <input
                      type="text"
                      value={searchTherapist}
                      onChange={(e) => setSearchTherapist(e.target.value)}
                      placeholder="جستجوی درمانگر..."
                      className="w-full rounded-xl border border-emerald-200 bg-emerald-50/50 px-3! py-2! text-xs text-emerald-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                    />
                  </div>
                  <div className="max-h-56 overflow-y-auto">
                    {filteredTherapists.length === 0 ? (
                      <div className="p-4! text-center text-xs text-emerald-600/70">
                        درمانگری یافت نشد
                      </div>
                    ) : (
                      filteredTherapists.map((t: any) => (
                        <button
                          key={t._id}
                          type="button"
                          onClick={() => {
                            setValue("user", t, { shouldValidate: true });
                            setShowTherapistList(false);
                            setSearchTherapist("");
                          }}
                          className="flex w-full bg-amber-50! items-center gap-3 border-b! border-emerald-50! px-3! py-2.5! text-right transition last:border-b-0 hover:bg-emerald-50/60"
                        >
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-linear-to-tr from-emerald-300! to-sky-300! text-[11px] font-extrabold text-white">
                            {t.firstName?.[0] || "؟"}
                            {t.lastName?.[0] || ""}
                          </span>
                          <div className="flex flex-1 flex-col gap-0.5">
                            <span className="text-sm font-bold text-emerald-900">
                              {t.firstName} {t.lastName}
                            </span>
                            <span className="text-[11px] text-emerald-700/60">
                              {roleText(t.role)}
                            </span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            {errors.user && (
              <p className={errorBase}>{errors.user.message as string}</p>
            )}
          </div>

          {/* -------- Leave Type -------- */}
          <div>
            <label className={labelBase}>
              نوع مرخصی <span className="text-rose-500">*</span>
            </label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => field.onChange("daily")}
                    className={`flex items-center justify-center gap-2 rounded-2xl border-2 px-4! py-3! text-sm font-extrabold transition ${
                      field.value === "daily"
                        ? "border-emerald-400 bg-linear-to-b from-emerald-50 to-emerald-100/60 text-emerald-800 shadow-[0_10px_22px_-8px_rgba(16,185,129,.4)]"
                        : "border-emerald-100 bg-white text-emerald-700/70 hover:border-emerald-300"
                    }`}
                  >
                    <span className="text-base">📅</span>
                    روزانه
                  </button>
                  <button
                    type="button"
                    onClick={() => field.onChange("hourly")}
                    className={`flex items-center justify-center gap-2 rounded-2xl border-2 px-4! py-3! text-sm font-extrabold transition ${
                      field.value === "hourly"
                        ? "border-sky-400 bg-linear-to-b from-sky-50 to-sky-100/60 text-sky-700 shadow-[0_10px_22px_-8px_rgba(56,189,248,.4)]"
                        : "border-emerald-100 bg-white text-emerald-700/70 hover:border-sky-300"
                    }`}
                  >
                    <span className="text-base">⏱️</span>
                    ساعتی
                  </button>
                </div>
              )}
            />
          </div>

          {/* -------- Date Range -------- */}
          <div
            className={`grid gap-3 ${
              watchType === "daily" ? "sm:grid-cols-2" : "grid-cols-1"
            }`}
          >
            {/* Start Date */}
            <div>
              <label className={labelBase}>
                تاریخ شروع <span className="text-rose-500">*</span>
              </label>
              <Controller
                name="startDate"
                control={control}
                rules={{ required: "تاریخ شروع الزامی است" }}
                render={({ field }) => (
                  <DatePicker
                    value={field.value}
                    onChange={(d) => field.onChange(d ? d.toDate() : null)}
                    calendar={persian}
                    locale={persian_fa}
                    format="YYYY/MM/DD"
                    inputClass="w-full rounded-xl border border-emerald-200 bg-white px-3.5! py-2.5! text-sm text-emerald-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                    containerClassName={
                      errors.startDate ? "[&_input]:border-rose-400" : ""
                    }
                    calendarPosition="bottom-right"
                  />
                )}
              />
              {errors.startDate && (
                <p className={errorBase}>{errors.startDate.message as string}</p>
              )}
            </div>

            {/* End Date */}
            {watchType === "daily" && (
              <div>
                <label className={labelBase}>
                  تاریخ پایان <span className="text-rose-500">*</span>
                </label>
                <Controller
                  name="endDate"
                  control={control}
                  rules={{
                    validate: (v) => {
                      if (watchType !== "daily") return true;
                      if (!v) return "تاریخ پایان الزامی است";
                      if (watchStartDate && new Date(v) < new Date(watchStartDate))
                        return "تاریخ پایان نمی‌تواند قبل از شروع باشد";
                      return true;
                    },
                  }}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value}
                      onChange={(d) => field.onChange(d ? d.toDate() : null)}
                      calendar={persian}
                      locale={persian_fa}
                      format="YYYY/MM/DD"
                      minDate={watchStartDate || undefined}
                      inputClass="w-full rounded-xl border border-emerald-200 bg-white px-3.5! py-2.5! text-sm text-emerald-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                      containerClassName={
                        errors.endDate ? "[&_input]:border-rose-400" : ""
                      }
                      calendarPosition="bottom-right"
                    />
                  )}
                />
                {errors.endDate && (
                  <p className={errorBase}>
                    {errors.endDate.message as string}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* -------- Time Range (hourly) -------- */}
          {watchType === "hourly" && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className={labelBase}>
                  زمان شروع <span className="text-rose-500">*</span>
                </label>
                <Controller
                  name="startTime"
                  control={control}
                  rules={{
                    required:
                      watchType === "hourly" ? "زمان شروع الزامی است" : false,
                  }}
                  render={({ field }) => (
                    <input
                      type="time"
                      {...field}
                      className={`${inputBase} ${
                        errors.startTime ? "border-rose-400" : ""
                      }`}
                    />
                  )}
                />
                {errors.startTime && (
                  <p className={errorBase}>
                    {errors.startTime.message as string}
                  </p>
                )}
              </div>

              <div>
                <label className={labelBase}>
                  زمان پایان <span className="text-rose-500">*</span>
                </label>
                <Controller
                  name="endTime"
                  control={control}
                  rules={{
                    validate: (v) => {
                      if (watchType !== "hourly") return true;
                      if (!v) return "زمان پایان الزامی است";
                      const start = watch("startTime");
                      if (start && v <= start)
                        return "زمان پایان باید بعد از شروع باشد";
                      return true;
                    },
                  }}
                  render={({ field }) => (
                    <input
                      type="time"
                      {...field}
                      className={`${inputBase} ${
                        errors.endTime ? "border-rose-400" : ""
                      }`}
                    />
                  )}
                />
                {errors.endTime && (
                  <p className={errorBase}>
                    {errors.endTime.message as string}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* -------- Reason -------- */}
          <div>
            <label className={labelBase}>
              دلیل مرخصی <span className="text-rose-500">*</span>
            </label>
            <Controller
              name="reason"
              control={control}
              rules={{
                required: "دلیل مرخصی الزامی است",
                minLength: { value: 3, message: "حداقل ۳ کاراکتر" },
                maxLength: { value: 500, message: "حداکثر ۵۰۰ کاراکتر" },
              }}
              render={({ field }) => (
                <textarea
                  {...field}
                  rows={3}
                  placeholder="دلیل درخواست مرخصی را بنویسید..."
                  className={`${inputBase} resize-none ${
                    errors.reason ? "border-rose-400" : ""
                  }`}
                />
              )}
            />
            {errors.reason && (
              <p className={errorBase}>{errors.reason.message as string}</p>
            )}
            <div className="mt-1! text-left text-[11px] text-emerald-600/60">
              {watchReason?.length || 0}/500
            </div>
          </div>

          {/* -------- Actions -------- */}
          <div className="flex gap-2.5 pt-2!">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 rounded-xl bg-emerald-50 px-4! py-3! text-sm font-extrabold text-emerald-800 transition hover:bg-emerald-100 disabled:opacity-60"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-2 rounded-xl bg-linear-to-tr from-emerald-500 to-sky-500 px-4! py-3! text-sm font-extrabold text-white shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:shadow-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {isPending ? "در حال ثبت..." : "ثبت درخواست مرخصی"}
            </button>
          </div>
        </form>
      </div>

      <ToastContainer position="top-right" autoClose={2500} />
    </div>
  );
}