import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment-jalaali";

import { useFindPatient } from "../../../hooks/patient";
import { useBatchPayment, useFinancePatient, useFinancePatient_notPaid } from "../../../hooks/finance";
import paymentMethodMap from "../../../utils/payments";
import DatePick from "../../finincial/DateDocker";
import { AlertSwal } from "../../../utils/errorSwal";
import Pagination2 from "../../util/pagination2";
import { sortByName } from "../../../utils/sortByAlfba";

type PaymentMethod = "card" | "transfer" | "cash" | "wallet";

interface Props {
  onClose: () => void;
}

export default function QuickAccessPayment({ onClose }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState<Record<string, string>>({});
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [filterByDate, setFilterByDate] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sessionsOpen, setSessionsOpen] = useState(true);
// const[sessionPage,setSessionPage]=useState(1)
  /* ---------- Patients ---------- */
  const { data: patientsData, isLoading: loadingPatients } = useFindPatient({
    page: 1,
    limit: 10,
    ...searchQuery,
  });

  const patients = patientsData?.patients ?sortByName(patientsData?.patients || []) : [];
  
    const filteredPatients = useMemo(() => {
      if (!searchTerm.trim()) return patients;
      const t = searchTerm.toLowerCase();
      return patients.filter((p: any) =>
        `${p.firstName || ""} ${p.lastName || ""}`.toLowerCase().includes(t)
      );
    }, [patients, searchTerm]);
  
  
  /* ---------- Finance ---------- */
  const financeQuery = selectedPatient
    ? {
        patientId: selectedPatient._id,
        // فقط اگر کاربر تیک فیلتر تاریخ رو زده بود و مقدار داشت بفرست
        ...(filterByDate && startDate ? { startDay: startDate } : {}),
        ...(filterByDate && endDate ? { endDay: endDate } : {}),
  
      }
    : null;

  const {
    data: financeData,
    isLoading: loadingFinance,
    refetch: refetchFinance,
  } = useFinancePatient_notPaid(financeQuery as any);

  const sessions = financeData?.financialList || [];
  const totalFinancial = financeData?.TotalFinancial || 0;
  const totalPaid = financeData?.TotalComplete || 0;
  const totalUnpaid = financeData?.TotalNotComplete || 0;
  const totalBimeh = financeData?.Totalbimeh || 0;

  const walletBalance = Number(selectedPatient?.wallet) || 0;

  /* ---------- Payment ---------- */
  const { mutateAsync: batchPay, isPending } = useBatchPayment();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      totalAmount: "",
      paymentMethod: "wallet" as PaymentMethod,
      description: "",
    },
  });
  const paymentMethod = watch("paymentMethod");
  const isWallet = paymentMethod === "wallet";

  // پر کردن خودکار مبلغ وقتی wallet انتخاب شد
  useEffect(() => {
    if (isWallet) setValue("totalAmount", walletBalance.toString());
  }, [isWallet, walletBalance, setValue]);

  // ریست کامل وقتی مراجع عوض می‌شه
  useEffect(() => {
    reset({ totalAmount: "", paymentMethod: "wallet", description: "" });
    setFilterByDate(false);
    setStartDate("");
    setEndDate("");
  }, [selectedPatient?._id, reset]);
useEffect(()=>{
if(selectedPatient?._id){
    refetchFinance()
}


},[selectedPatient?._id,startDate,endDate])
  /* ---------- Handlers ---------- */
  const handleSearch = () =>
    setSearchQuery(searchTerm.trim() ? { lastName: searchTerm } : {});

  const onSubmit = async(data: any) => {
    if (!selectedPatient) return;

    const amount = isWallet ? walletBalance : Number(data.totalAmount);

    if (isWallet && walletBalance <= 0) {
      AlertSwal.Error("کیف پول موجودی ندارد");
      return;
    }
    if (!isWallet && (!amount || amount <= 0)) {
    AlertSwal.Error("مبلغ معتبر وارد کنید");
      return;
    }

    const payload: Record<string, any> = {
      patientId: selectedPatient._id,
      totalAmount: amount,
      paymentMethod: data.paymentMethod,
    };

    // اگه فیلتر تاریخ فعال بود، ارسال کن؛ وگرنه بدون تاریخ → کل بدهی
    if (filterByDate && startDate)
      payload.startDate = new Date(startDate).toISOString();
    if (filterByDate && endDate)
      payload.endDate = new Date(endDate).toISOString();

    if (!isWallet && data.description?.trim())
      payload.description = data.description.trim();

   await batchPay(payload as any);

   onClose()

  };

  const getStatusBadge = (s: any) => {
    const paidByPatient =
      Array.isArray(s.Paids) &&
      s.Paids.some((p: any) => p.id === selectedPatient?._id);

    if (s.status_clinic === "completed-paid" || paidByPatient)
      return { text: "پرداخت شده", cls: "bg-emerald-100 text-emerald-700" };
    if (s.status_clinic === "bimeh")
      return { text: "بیمه", cls: "bg-sky-100 text-sky-700" };
    return { text: "پرداخت نشده", cls: "bg-rose-100 text-rose-600" };
  };


  const dateLabels = {
    card: "کارت",
    transfer: "انتقال بانکی",
    cash: "نقدی",
    wallet: "کیف پول",
  } as const;

  /* ---------- Render ---------- */
  return (
    <div
      dir="rtl"
      onClick={onClose}
      className="fixed inset-0 z-1000 flex items-center justify-center bg-slate-900/45 p-4! backdrop-blur-md animate-[fadeIn_.25s_ease]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-3xl max-h-[92vh] flex-col overflow-hidden rounded-[22px] border border-emerald-100 bg-white shadow-[0_24px_60px_-15px_rgba(16,185,129,.25),0_8px_24px_-10px_rgba(56,189,248,.2)] animate-[popIn_.3s_cubic-bezier(.2,.9,.3,1.2)]"
      >
        {/* ============ Header ============ */}
        <header className="flex items-center justify-between border-b border-emerald-100 bg-linear-to-l from-emerald-50 via-emerald-50/70 to-sky-50 px-6! py-4!">
          <div className="flex items-center gap-3.5">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-linear-to-tr from-emerald-500 to-sky-500 text-xl text-white shadow-lg shadow-emerald-500/30">
              💰
            </span>
            <div>
              <h2 className="m-0! text-base font-extrabold text-emerald-900">
                دسترسی سریع — پرداخت بدهی
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

        {/* ============ Body ============ */}
        <div className="flex-1 overflow-y-auto px-6! pb-6! pt-5!">
          {!selectedPatient ? (
            /* ---------- Patient Selector ---------- */
            <div>
              <div className="mb-4! flex gap-2.5">
                <input
                  type="text"
                  placeholder="جستجوی نام خانوادگی مراجع..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}

                  className="flex-1 rounded-xl border-2 border-sky-200 bg-sky-50/60 px-4! py-3! text-sm text-emerald-900 outline-none transition placeholder:text-sky-400/70 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                />
              
              </div>

              <div className="flex max-h-105 flex-col gap-2 overflow-y-auto pl-1!">
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
                      onClick={() => {
                        setSelectedPatient(p);
                        setSearchTerm("");
                      }}
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
                      <span className="rounded-full bg-emerald-100 px-3! py-1! text-xs font-bold text-emerald-700">
                        {(p.wallet || 0).toLocaleString()}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          ) : (
            /* ---------- Selected Patient ---------- */
            <>
              {/* Patient card */}
              <div className="mb-4! flex items-center justify-between rounded-2xl border border-emerald-100 bg-linear-to-l from-emerald-50/60 to-sky-50/60 p-3.5!">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-linear-to-tr from-emerald-400 to-sky-400 text-sm font-extrabold text-white shadow-md shadow-emerald-500/20">
                    {selectedPatient.firstName?.[0]}
                    {selectedPatient.lastName?.[0]}
                  </span>
                  <div>
                    <div className="text-sm font-extrabold text-emerald-900">
                      {selectedPatient.firstName} {selectedPatient.lastName}
                    </div>
                    <div className="mt-0.5! text-xs text-emerald-700/70">
                      موجودی کیف پول:{" "}
                      <span className="font-extrabold text-sky-600">
                        {walletBalance.toLocaleString()} تومان
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPatient(null)}
                  className="rounded-xl border border-emerald-200 bg-white px-3! py-1.5! text-xs font-bold text-emerald-700 transition hover:border-sky-400 hover:text-sky-600"
                >
                  تغییر مراجع
                </button>
              </div>

              {/* Date Filter */}
              <div className="mb-4! rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4!">
                <div className="mb-3! flex items-center justify-between">
                  <h3 className="m-0! text-sm font-extrabold text-emerald-900">
                    🗓️ بازه بررسی بدهی
                  </h3>
                  <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-emerald-800">
                    <input
                      type="checkbox"
                      checked={filterByDate}
                      onChange={(e) => setFilterByDate(e.target.checked)}
                      className="h-4 w-4 accent-emerald-500"
                    />
                    فیلتر تاریخ
                  </label>
                </div>

                {filterByDate ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1! block text-xs font-bold text-emerald-900">
                        از تاریخ
                      </label>
                      <DatePick varDate={startDate} setvarDate={setStartDate}/>
                  
                    </div>
                    <div>
                      <label className="mb-1! block text-xs font-bold text-emerald-900">
                        تا تاریخ
                      </label>
                      <DatePick varDate={endDate} setvarDate={setEndDate}/>
         
                    </div>
                  </div>
                ) : (
                  <p className="m-0! text-xs leading-relaxed text-emerald-700/70">
                    بدون فیلتر تاریخ، بدهی کل ثبت می‌شود. برای محدود کردن به یک
                    بازه، تیک «فیلتر تاریخ» را فعال کنید.
                  </p>
                )}
              </div>

              {/* Debt Summary */}
              {loadingFinance ? (
                <div className="mb-4! py-6! text-center text-sm text-emerald-600/70">
                  در حال محاسبه بدهی...
                </div>
              ) : (
                <div className="mb-4! grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3! text-center">
                    <div className="text-[11px] font-bold text-emerald-700/70">
                      مجموع هزینه
                    </div>
                    <div className="mt-1! text-sm font-extrabold text-emerald-900">
                      {totalFinancial.toLocaleString()}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-sky-100 bg-sky-50/60 p-3! text-center">
                    <div className="text-[11px] font-bold text-sky-700/70">
                      پرداخت‌شده
                    </div>
                    <div className="mt-1! text-sm font-extrabold text-sky-700">
                      {totalPaid.toLocaleString()}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-sky-100 bg-sky-50/40 p-3! text-center">
                    <div className="text-[11px] font-bold text-sky-700/70">
                      بیمه
                    </div>
                    <div className="mt-1! text-sm font-extrabold text-sky-600">
                      {totalBimeh.toLocaleString()}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-3! text-center">
                    <div className="text-[11px] font-bold text-rose-600/80">
                      پرداخت‌نشده
                    </div>
                    <div className="mt-1! text-sm font-extrabold text-rose-600">
                      {totalUnpaid.toLocaleString()}
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Form */}
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="mb-5! rounded-2xl border-2 border-emerald-200 bg-linear-to-b from-emerald-50/40 to-sky-50/40 p-4!"
              >
                <h3 className="m-0! mb-3! text-sm font-extrabold text-emerald-900">
                  💳 ثبت پرداخت
                </h3>

                {/* Method */}
                <label className="mb-1.5! block text-xs font-bold text-emerald-900">
                  روش پرداخت
                </label>
                <select
                  {...register("paymentMethod")}
                  className="w-full rounded-xl border border-emerald-200 bg-white px-3.5! py-2.5! text-sm text-emerald-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                >
                  <option value="card">کارت</option>
                  <option value="transfer">انتقال بانکی</option>
                  <option value="cash">نقدی</option>
                  <option value="wallet">کیف پول</option>
                </select>

                {/* Wallet info or Amount */}
                {isWallet ? (
                  <div className="mt-3! rounded-xl border border-sky-200 bg-sky-50 p-3.5!">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-sky-700">
                        موجودی کیف پول
                      </span>
                      <span className="text-sm font-extrabold text-sky-700">
                        {walletBalance.toLocaleString()} تومان
                      </span>
                    </div>
                    <p className="m-0! mt-2! text-xs leading-relaxed text-sky-700">
                      {walletBalance > 0
                        ? "تمام موجودی کیف پول برای پرداخت بدهی استفاده می‌شود."
                        : "کیف پول موجودی ندارد. روش پرداخت دیگری انتخاب کنید."}
                    </p>
                  </div>
                ) : (
                  <>
                    <label className="mt-3! mb-1.5! block text-xs font-bold text-emerald-900">
                      مبلغ (تومان)
                    </label>
                    <input
                      type="number"
                      {...register("totalAmount", {
                        min: { value: 0, message: "مبلغ باید مثبت باشد" },
                      })}
                      placeholder="مبلغ را وارد کنید"
                      className="w-full rounded-xl border border-emerald-200 bg-white px-3.5! py-2.5! text-sm text-emerald-900 outline-none transition placeholder:text-emerald-400/70 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                    />
                    {errors.totalAmount && (
                      <p className="mt-1! text-xs font-medium text-rose-500">
                        {errors.totalAmount.message as string}
                      </p>
                    )}

                    {/* Quick amounts */}
                    <div className="mt-3! flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setValue("totalAmount", totalUnpaid.toString())
                        }
                        className="rounded-full border border-rose-200 bg-rose-50 px-3! py-1.5! text-xs font-bold text-rose-600 transition hover:border-rose-400"
                      >
                        کل بدهی ({totalUnpaid.toLocaleString()})
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setValue("totalAmount", totalFinancial.toString())
                        }
                        className="rounded-full border border-emerald-200 bg-white px-3! py-1.5! text-xs font-bold text-emerald-700 transition hover:border-sky-400 hover:text-sky-600"
                      >
                        کل هزینه
                      </button>
                      {[500000, 1000000, 2000000].map((a) => (
                        <button
                          key={a}
                          type="button"
                          onClick={() => setValue("totalAmount", a.toString())}
                          className="rounded-full border border-emerald-200 bg-white px-3! py-1.5! text-xs font-bold text-emerald-700 transition hover:border-sky-400 hover:text-sky-600"
                        >
                          {a.toLocaleString()}
                        </button>
                      ))}
                    </div>

                    <label className="mt-3! mb-1.5! block text-xs font-bold text-emerald-900">
                      مشخصات پرداخت (اختیاری)
                    </label>
                    <textarea
                      {...register("description")}
                      rows={2}
                      placeholder="شماره پیگیری، مشخصات واریز یا توضیحات..."
                      className="w-full resize-none rounded-xl border border-emerald-200 bg-white px-3.5! py-2.5! text-sm text-emerald-900 outline-none transition placeholder:text-emerald-400/70 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                    />
                  </>
                )}

                <button
                  type="submit"
                  disabled={isPending || (isWallet && walletBalance <= 0)}
                  className="mt-4! w-full rounded-xl bg-linear-to-tr from-emerald-500 to-sky-500 px-4! py-3! text-sm font-extrabold text-white shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:shadow-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {isPending ? "در حال ثبت..." : "ثبت پرداخت بدهی"}
                </button>
              </form>

              {/* Sessions List */}
              <div className="rounded-2xl border border-emerald-100 bg-white!">
                <button
                  type="button"
                  onClick={() => setSessionsOpen((v) => !v)}
                  className="flex w-full items-center justify-between rounded-2xl bg-emerald-50/40! px-4! py-3! transition hover:bg-emerald-50"
                >
                  <span className="text-sm font-extrabold bg-white! text-emerald-900">
                    📋 لیست جلسات درمانی
                    <span className="mr-2! text-xs font-medium text-emerald-700/60">
                      ({sessions.length} جلسه)
                    </span>
                  </span>
                  <span className="text-xs text-emerald-700">
                    {sessionsOpen ? "▲" : "▼"}
                  </span>
                </button>

                {sessionsOpen && (
                  <div className="p-3!">
                    {loadingFinance ? (
                      <div className="py-8! text-center text-sm text-emerald-600/70">
                        در حال بارگذاری جلسات...
                      </div>
                    ) : sessions.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-emerald-200 bg-emerald-50/30 py-8! text-center text-sm text-emerald-600/70">
                        در بازه انتخابی جلسه‌ای یافت نشد
                      </div>
                    ) : (
                      <div className="max-h-80 overflow-y-auto overflow-x-auto rounded-xl border border-emerald-100">
                        <table className="w-full text-right text-xs">
                          <thead className="bg-emerald-50/60 text-emerald-800">
                            <tr>
                              <th className="px-3! py-2.5! font-bold">تاریخ</th>
                              <th className="px-3! py-2.5! font-bold">
                                درمانگر
                              </th>
                              <th className="px-3! py-2.5! font-bold">
                                مبلغ (تومان)
                              </th>
                              <th className="px-3! py-2.5! font-bold">
                                وضعیت
                              </th>
                              <th className="px-3! py-2.5! font-bold">
                                روش پرداخت
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {sessions.map((s: any, i: number) => {
                              const badge = getStatusBadge(s);
                              return (
                                <tr
                                  key={i}
                                  className="border-t border-emerald-50 transition hover:bg-emerald-50/40"
                                >
                                  <td className="px-3! py-2.5! text-emerald-800/80">
                                    {moment(s.localDay).format(
                                      "jYYYY/jMM/jDD"
                                    )}
                                  </td>
                                  <td className="px-3! py-2.5! text-emerald-900">
                                    {s.therapistName || "جلسه گروهی"}
                                  </td>
                                  <td className="px-3! py-2.5! font-extrabold text-emerald-900">
                                    {(s.sessionType === "group"
                                      ? s.groupSession?.onePatientFee
                                      : s.patientFee || 0
                                    ).toLocaleString()}
                                  </td>
                                  <td className="px-3! py-2.5!">
                                    <span
                                      className={`rounded-full px-2.5! py-1! text-[11px] font-bold ${badge.cls}`}
                                    >
                                      {badge.text}
                                    </span>
                                  </td>
                                  <td className="px-3! py-2.5! text-emerald-800/80">
                                    {paymentMethodMap[s?.payment ?? "0"] ||
                                      s.pay_details ||
                                      "-"}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                        <Pagination2 />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={2500} />
    </div>
  );
}