import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment-jalaali";

import { useFindPatient, useGetOnePatient } from "../../../hooks/patient";
import {
  useTransactionsPatient,
  useWalletDeposit,
  useWalletwithdraw,
} from "../../../hooks/transaction";
import Pagination from "../../util/pagination";
import { sortByName } from "../../../utils/sortByAlfba";

const TX_LIMIT = 6;

interface Props {
  onClose: () => void;
}

export default function QuickAccessTransaction({ onClose }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState<Record<string, string>>({});
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [actionType, setActionType] = useState<"deposit" | "withdraw" | null>(
    null,
  );

  /* ---------- داده‌ها ---------- */
  const { data: patientsData, isLoading: loadingPatients } = useFindPatient({
    page: 1,
    limit: 50,
    ...searchQuery,
  });
  const patients = patientsData?.patients ?sortByName(patientsData?.patients || []) : [];

  const { data: patientData, refetch: refetchPatient } = useGetOnePatient(
    selectedPatient?._id,
  );
  const balance = patientData?.[0]?.wallet ?? 0;


  const {
    data: txData,
    isLoading: loadingTx,
    refetch: refetchTX,
  } = useTransactionsPatient({
    patientId: selectedPatient?._id,
    page,
    limit: TX_LIMIT,
  });

  const transactions = txData?.transactions || [];
  const totalPages = txData?.pagination?.totalPages || 1;
  const totalTx = txData?.pagination?.total || 0;

  /* ---------- Mutations ---------- */
  const { mutate: deposit, isPending: depositLoading } = useWalletDeposit();
  const { mutate: withdraw, isPending: withdrawLoading } = useWalletwithdraw();
  const loading = depositLoading || withdrawLoading;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({ defaultValues: { amount: "", description: "" } });
  const watchedAmount = watch("amount");

  /* ---------- Effects ---------- */
  useEffect(() => {
    setPage(1);
    setActionType(null);
    reset({ amount: "", description: "" });
    if (selectedPatient?._id) {
      refetchTX();
    }
  }, [reset, selectedPatient?._id, refetchTX]);

  useEffect(()=>{
 if (selectedPatient?._id) {
      refetchTX();
    }

  },[page])
  /* ---------- Handlers ---------- */

  const handleSelectPatient = (p: any) => {
    setSelectedPatient(p);
    setSearchTerm("");
  };
  
 const filteredPatients = useMemo(() => {
    if (!searchTerm.trim()) return patients;
    const t = searchTerm.toLowerCase();
    return patients.filter((p: any) =>
      `${p.firstName || ""} ${p.lastName || ""}`.toLowerCase().includes(t)
    );
  }, [patients, searchTerm]);


  const onSubmit = (data: any) => {
    if (!selectedPatient || !actionType) return;
    const amount = parseInt(data.amount);
    const payload = {
      patientId: selectedPatient._id,
      amount,
      description:
        data.description ||
        `${actionType === "deposit" ? "واریز" : "برداشت"} دستی - ${amount.toLocaleString()} تومان`,
    };

    if (actionType === "deposit") deposit(payload);
    else withdraw(payload);
    onClose()
  };

  const quickAmounts = [50000, 100000, 200000, 500000];

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
        {/* ================= Header ================= */}
        <header className="flex items-center justify-between border-b border-emerald-100 bg-linear-to-l from-emerald-50 via-emerald-50/70 to-sky-50 px-6! py-4!">
          <div className="flex items-center gap-3.5">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-linear-to-tr from-emerald-500 to-sky-500 text-xl text-white shadow-lg shadow-emerald-500/30">
              💳
            </span>
            <div>
              <h2 className="m-0! text-base font-extrabold text-emerald-900">
                دسترسی سریع — تراکنش‌ها
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

        {/* ================= Body ================= */}
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
                      onClick={() => handleSelectPatient(p)}
                      className="flex items-center gap-3.5 rounded-2xl border! border-emerald-300! bg-white! px-4! py-3! text-right transition hover:-translate-x-1 hover:border-emerald-400 hover:bg-emerald-50/60"
                    >
                      <span className=" grid h-11 w-11 shrink-0 place-items-center rounded-full bg-linear-to-tr from-emerald-300 to-sky-300 text-sm font-extrabold text-white">
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
            /* ---------- Selected patient view ---------- */
            <>
              {/* Patient Card */}
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
                      موجودی فعلی:{" "}
                      <span className="font-extrabold text-sky-600">
                        {balance.toLocaleString()} تومان
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPatient(null);
                    setActionType(null);
                  }}
                  className="rounded-xl border border-emerald-200 bg-white px-3! py-1.5! text-xs font-bold text-emerald-700 transition hover:border-sky-400 hover:text-sky-600"
                >
                  تغییر مراجع
                </button>
              </div>

              {/* Action buttons or form */}
              {!actionType ? (
                <div className="mb-5! grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setActionType("deposit")}
                    className="flex items-center justify-center gap-2 rounded-2xl border-2 border-emerald-200 bg-linear-to-b from-emerald-50 to-emerald-100/60 px-4! py-3.5! text-sm font-extrabold text-emerald-800 transition hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-[0_10px_22px_-8px_rgba(16,185,129,.4)]"
                  >
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-500 text-white shadow-sm">
                      +
                    </span>
                    افزایش موجودی
                  </button>
                  <button
                    type="button"
                    onClick={() => setActionType("withdraw")}
                    className="flex items-center justify-center gap-2 rounded-2xl border-2 border-sky-200 bg-linear-to-b from-sky-50 to-sky-100/60 px-4! py-3.5! text-sm font-extrabold text-sky-700 transition hover:-translate-y-0.5 hover:border-sky-400 hover:shadow-[0_10px_22px_-8px_rgba(56,189,248,.4)]"
                  >
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-sky-500 text-white shadow-sm">
                      −
                    </span>
                    کاهش موجودی
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className={`mb-5! rounded-2xl border-2 p-4! ${
                    actionType === "deposit"
                      ? "border-emerald-200 bg-emerald-50/40"
                      : "border-sky-200 bg-sky-50/40"
                  }`}
                >
                  <div className="mb-3! flex items-center justify-between">
                    <h3 className="m-0! text-sm font-extrabold text-emerald-900">
                      {actionType === "deposit"
                        ? "➕ افزایش موجودی"
                        : "➖ کاهش موجودی"}
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setActionType(null);
                        reset({ amount: "", description: "" });
                      }}
                      className="rounded-lg bg-white px-2.5! py-1! text-xs font-bold text-emerald-700 ring-1 ring-emerald-200 transition hover:bg-emerald-50"
                    >
                      انصراف
                    </button>
                  </div>

                  <label className="mb-1.5! block text-xs font-bold text-emerald-900">
                    مبلغ (تومان)
                  </label>
                  <input
                    type="number"
                    {...register("amount", {
                      required: "مبلغ الزامی است",
                      min: { value: 1000, message: "حداقل ۱,۰۰۰ تومان" },
                      max: {
                        value: 100000000,
                        message: "حداکثر ۱۰۰,۰۰۰,۰۰۰ تومان",
                      },
                      validate: (v) =>
                        actionType !== "withdraw" ||
                        parseInt(v) <= balance ||
                        "موجودی کافی نیست",
                    })}
                    placeholder="مبلغ را وارد کنید"
                    className="w-full rounded-xl border border-emerald-200 bg-white px-3.5! py-2.5! text-sm text-emerald-900 outline-none transition placeholder:text-emerald-400/70 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  />
                  {errors.amount && (
                    <p className="mt-1! text-xs font-medium text-rose-500">
                      {errors.amount.message as string}
                    </p>
                  )}

                  <div className="mt-3! mb-3! flex flex-wrap gap-2">
                    {quickAmounts.map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => setValue("amount", a.toString())}
                        className="rounded-full border border-emerald-200 bg-white px-3! py-1.5! text-xs font-bold text-emerald-700 transition hover:border-sky-400 hover:bg-sky-50 hover:text-sky-600"
                      >
                        {a.toLocaleString()}
                      </button>
                    ))}
                    {actionType === "withdraw" && balance > 0 && (
                      <button
                        type="button"
                        onClick={() => setValue("amount", balance.toString())}
                        className="rounded-full border border-sky-300 bg-sky-50 px-3! py-1.5! text-xs font-bold text-sky-600 transition hover:bg-sky-100"
                      >
                        همه موجودی
                      </button>
                    )}
                  </div>

                  <label className="mb-1.5! block text-xs font-bold text-emerald-900">
                    توضیحات (اختیاری)
                  </label>
                  <input
                    type="text"
                    {...register("description", {
                      maxLength: { value: 200, message: "حداکثر ۲۰۰ کاراکتر" },
                    })}
                    placeholder="توضیحات تراکنش"
                    className="w-full rounded-xl border border-emerald-200 bg-white px-3.5! py-2.5! text-sm text-emerald-900 outline-none transition placeholder:text-emerald-400/70 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  />

                  {watchedAmount && parseInt(watchedAmount) > 0 && (
                    <div className="mt-3! rounded-xl border border-emerald-100 bg-white p-3! text-xs">
                      <div className="flex items-center justify-between py-0.5!">
                        <span className="text-emerald-700/70">مبلغ:</span>
                        <span className="font-bold text-emerald-900">
                          {parseInt(watchedAmount).toLocaleString()} تومان
                        </span>
                      </div>
                      <div className="mt-1.5! flex items-center justify-between border-t border-dashed border-emerald-100 pt-1.5!">
                        <span className="text-emerald-700/70">
                          موجودی جدید:
                        </span>
                        <span
                          className={`font-extrabold ${
                            actionType === "deposit"
                              ? "text-emerald-600"
                              : "text-sky-600"
                          }`}
                        >
                          {(actionType === "deposit"
                            ? balance + parseInt(watchedAmount)
                            : balance - parseInt(watchedAmount)
                          ).toLocaleString()}{" "}
                          تومان
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className={`mt-3! w-full rounded-xl px-4! py-3! text-sm font-extrabold text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      actionType === "deposit"
                        ? "bg-linear-to-tr from-emerald-500 to-emerald-600 shadow-emerald-500/30 hover:-translate-y-0.5"
                        : "bg-linear-to-tr from-sky-500 to-sky-600 shadow-sky-500/30 hover:-translate-y-0.5"
                    }`}
                  >
                    {loading
                      ? "در حال ثبت..."
                      : actionType === "deposit"
                        ? "ثبت واریز"
                        : "ثبت برداشت"}
                  </button>
                </form>
              )}

              {/* Transactions List */}
              <div>
                <div className="mb-3! flex items-center justify-between">
                  <h3 className="m-0! text-sm font-extrabold text-emerald-900">
                    📋 تراکنش‌ها
                    <span className="mr-2! text-xs font-medium text-emerald-700/60">
                      ({totalTx
} مورد)
                    </span>
                  </h3>
                </div>

                {loadingTx ? (
                  <div className="py-10! text-center text-sm text-emerald-600/70">
                    در حال بارگذاری...
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/30 py-10! text-center text-sm text-emerald-600/70">
                    هنوز تراکنشی ثبت نشده است
                  </div>
                ) : (
                  <>
                    <div className="overflow-hidden rounded-2xl border border-emerald-100">
                      <table className="w-full text-right text-sm">
                        <thead className="bg-emerald-50/60 text-xs text-emerald-800">
                          <tr>
                            <th className="px-3! py-2.5! font-bold">تاریخ</th>
                            <th className="px-3! py-2.5! font-bold">مبلغ</th>
                            <th className="px-3! py-2.5! font-bold">نوع</th>
                            <th className="px-3! py-2.5! font-bold">توضیحات</th>
                          </tr>
                        </thead>
                        <tbody>
                          {transactions.map((t: any) => (
                            <tr
                              key={t._id}
                              className="border-t border-emerald-50 transition hover:bg-emerald-50/40"
                            >
                              <td className="px-3! py-2.5! text-xs text-emerald-800/80">
                                {moment(t.createdAt).format("jYYYY/jMM/jDD")}
                                <br />
                                <span className="text-[11px] text-emerald-600/60">
                                  {moment(t.createdAt).format("HH:mm")}
                                </span>
                              </td>
                              <td
                                className={`px-3! py-2.5! text-xs font-extrabold ${
                                  t.type === "induce"
                                    ? "text-emerald-600"
                                    : "text-sky-600"
                                }`}
                              >
                                {t.type === "induce" ? "+" : "−"}
                                {(t.amount || 0).toLocaleString()}
                              </td>
                              <td className="px-3! py-2.5!">
                                <span
                                  className={`rounded-full px-2.5! py-1! text-[11px] font-bold ${
                                    t.type === "induce"
                                      ? "bg-emerald-100 text-emerald-700"
                                      : "bg-sky-100 text-sky-700"
                                  }`}
                                >
                                  {t.type === "induce" ? "واریز" : "برداشت"}
                                </span>
                              </td>
                              <td className="px-3! py-2.5! text-xs text-emerald-800/80">
                                {t.description || "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="mt-4! flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page === 1}
                          className="rounded-lg border border-emerald-200 bg-white px-3! py-1.5! text-xs font-bold text-emerald-700 transition hover:border-sky-400 hover:text-sky-600 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          قبلی
                        </button>

                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            let p: number;
                            if (totalPages <= 5) p = i + 1;
                            else if (page <= 3) p = i + 1;
                            else if (page >= totalPages - 2)
                              p = totalPages - 4 + i;
                            else p = page - 2 + i;

                            return (
                              <button
                                key={p}
                                type="button"
                                onClick={() => setPage(p)}
                                className={`h-8 w-8 rounded-lg text-xs font-bold transition ${
                                  page === p
                                    ? "bg-linear-to-tr from-emerald-500 to-sky-500 text-white shadow-md shadow-emerald-500/30"
                                    : "border border-emerald-200 bg-white text-emerald-700 hover:border-sky-400 hover:text-sky-600"
                                }`}
                              >
                                {p}
                              </button>
                            );
                          },
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            setPage((p) => Math.min(totalPages, p + 1))
                          }
                          disabled={page === totalPages}
                          className="rounded-lg border border-emerald-200 bg-white px-3! py-1.5! text-xs font-bold text-emerald-700 transition hover:border-sky-400 hover:text-sky-600 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          بعدی
                        </button>
                      </div>
                    )}
                  </>
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
