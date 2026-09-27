// src/components/modals/BatchPaymentModal.tsx
import React from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import type {
  BatchPaymentValues,
  BatchPaymentResult,
  PaymentMethod,
} from "../../types/finance";
import { useBatchPayment } from "../../hooks/finance";

interface BatchPaymentModalProps {
  open: boolean;
  onClose: () => void;
  patientId: string;
  startDate: Date | string;
  endDate: Date | string;
  onSuccess?: (result: BatchPaymentResult) => void;
  wallet: number;
}

type FormValues = BatchPaymentValues & {
  description?: string;
};

const schema: yup.ObjectSchema<FormValues> = yup.object({
  totalAmount: yup
    .number()
    .typeError("مبلغ را وارد کنید")
    .positive("مبلغ باید بزرگتر از صفر باشد")
    .required("مبلغ الزامی است"),

  paymentMethod: yup
    .mixed<PaymentMethod>()
    .oneOf(["card", "transfer", "cash", "wallet"], "روش پرداخت نامعتبر است")
    .required("انتخاب روش پرداخت الزامی است"),

  description: yup.string().trim().optional(),
});

export default function BatchPaymentModal({
  open,
  onClose,
  patientId,
  startDate,
  endDate,
  onSuccess,
  wallet,
}: BatchPaymentModalProps) {
  const walletBalance = Number.isFinite(wallet) ? Math.max(0, wallet) : "";

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      totalAmount: "",
      paymentMethod: "card",
      description: "",
    },
  });

  const paymentMethod = useWatch({
    control,
    name: "paymentMethod",
  });

  const isWalletPayment = paymentMethod === "wallet";

  const { mutate, isPending } = useBatchPayment();

  React.useEffect(() => {
    if (open && isWalletPayment) {
      setValue("totalAmount", walletBalance);
      clearErrors("totalAmount");
    }
  }, [open, isWalletPayment, walletBalance, setValue, clearErrors]);

  const handleClose = () => {
    if (isPending) return;

    reset({
      totalAmount: walletBalance,
      paymentMethod: "wallet",
      description: "",
    });

    onClose();
  };

  const onSubmit = handleSubmit((values) => {
    if (isPending) return;

    if (!startDate || !endDate) {
      alert("لطفاً تاریخ شروع و پایان را مشخص کنید");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      alert("تاریخ شروع یا پایان معتبر نیست");
      return;
    }

    const payingWithWallet = values.paymentMethod === "wallet";

    if (payingWithWallet && walletBalance <= 0) {
      return;
    }

    const payload = {
      patientId,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      totalAmount: payingWithWallet
        ? walletBalance
        : values.totalAmount,
      paymentMethod: values.paymentMethod,
      ...(!payingWithWallet && values.description?.trim()
        ? { description: values.description.trim() }
        : {}),
    };

    mutate(payload, {
      onSuccess: (result) => {
        onSuccess?.(result);

        reset({
          totalAmount: walletBalance,
          paymentMethod: "wallet",
          description: "",
        });

        onClose();
      },
    });
  });

  if (!open) return null;

  const inputClassName =
    "w-full px-3! py-2! border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100 transition";

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4! backdrop-blur-sm"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="batch-payment-title"
        className="relative w-full max-w-md rounded-2xl bg-white p-6! shadow-2xl transition-all"
      >
        <button
          type="button"
          onClick={handleClose}
          disabled={isPending}
          aria-label="بستن"
          className="absolute top-3! left-3! text-2xl leading-none text-gray-400 transition hover:text-gray-600 disabled:opacity-50"
        >
          ×
        </button>

        <h2
          id="batch-payment-title"
          className="mb-5! text-center text-xl font-bold text-emerald-700"
        >
          پرداخت انبوه بدهی
        </h2>

        <form onSubmit={onSubmit} className="space-y-5">
          {/* روش پرداخت */}
          <div>
            <label
              htmlFor="paymentMethod"
              className="mb-1! block text-sm font-medium text-gray-700"
            >
              روش پرداخت
            </label>

            <Controller
              control={control}
              name="paymentMethod"
              render={({ field }) => (
                <select
                  {...field}
                  id="paymentMethod"
                  disabled={isPending}
                  onChange={(event) => {
                    const nextMethod = event.target.value as PaymentMethod;

                    if (
                      nextMethod === "wallet" ||
                      field.value === "wallet"
                    ) {
                      setValue(
                        "totalAmount",
                        nextMethod === "wallet" ? walletBalance : 0
                      );
                      clearErrors("totalAmount");
                    }

                    field.onChange(nextMethod);
                  }}
                  className={`${inputClassName} ${
                    errors.paymentMethod
                      ? "border-red-400 focus:ring-red-400"
                      : "border-gray-200 focus:border-emerald-400"
                  } bg-white`}
                >
                  <option value="card">کارت</option>
                  <option value="transfer">انتقال بانکی</option>
                  <option value="cash">نقدی</option>
                  <option value="wallet">کیف پول</option>
                </select>
              )}
            />

            {errors.paymentMethod && (
              <p className="mt-1! text-sm text-red-500">
                {errors.paymentMethod.message}
              </p>
            )}
          </div>

          {isWalletPayment ? (
            /* موجودی کیف پول */
            <div className="rounded-xl border border-sky-200 bg-sky-50 p-4! shadow-inner">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-gray-700">
                  موجودی کیف پول
                </span>
                <span className="font-bold text-sky-700">
                  {walletBalance.toLocaleString("fa-IR")} تومان
                </span>
              </div>

              {walletBalance > 0 ? (
                <p className="mt-2! text-sm leading-6 text-sky-700">
                  تمام موجودی کیف پول برای پرداخت بدهی استفاده خواهد شد.
                </p>
              ) : (
                <p className="mt-2! text-sm text-red-500">
                  کیف پول موجودی ندارد. روش پرداخت دیگری انتخاب کنید.
                </p>
              )}

              {errors.totalAmount && (
                <p className="mt-2! text-sm text-red-500">
                  {errors.totalAmount.message}
                </p>
              )}
            </div>
          ) : (
            <>
              {/* مبلغ پرداخت */}
              <div>
                <label
                  htmlFor="totalAmount"
                  className="mb-1! block text-sm font-medium text-gray-700"
                >
                  مبلغ کل (تومان)
                </label>

                <Controller
                  control={control}
                  name="totalAmount"
                  render={({ field }) => (
                    <input
                      {...field}
                      id="totalAmount"
                      type="number"
                      min="0"
                      disabled={isPending}
                      onChange={(event) =>
                        field.onChange(
                          event.target.value === ""
                            ? 0
                            : Number(event.target.value)
                        )
                      }
                      className={`${inputClassName} ${
                        errors.totalAmount
                          ? "border-red-400 focus:ring-red-400"
                          : "border-gray-200 focus:border-emerald-400"
                      } bg-white`}
                    />
                  )}
                />

                {errors.totalAmount && (
                  <p className="mt-1! text-sm text-red-500">
                    {errors.totalAmount.message}
                  </p>
                )}
              </div>

              {/* مشخصات پرداخت */}
              <div>
                <label
                  htmlFor="description"
                  className="mb-1! block text-sm font-medium text-gray-700"
                >
                  مشخصات پرداخت
                  <span className="mr-1! text-xs text-gray-400">
                    (اختیاری)
                  </span>
                </label>

                <Controller
                  control={control}
                  name="description"
                  render={({ field }) => (
                    <textarea
                      {...field}
                      value={field.value ?? ""}
                      id="description"
                      rows={3}
                      disabled={isPending}
                      placeholder="شماره پیگیری، مشخصات واریز یا توضیحات پرداخت..."
                      className={`${inputClassName} resize-none ${
                        errors.description
                          ? "border-red-400 focus:ring-red-400"
                          : "border-gray-200 focus:border-emerald-400"
                      } bg-white`}
                    />
                  )}
                />

                {errors.description && (
                  <p className="mt-1! text-sm text-red-500">
                    {errors.description.message}
                  </p>
                )}
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={
              isPending || (isWalletPayment && walletBalance <= 0)
            }
            className="w-full rounded-lg bg-emerald-600 px-4! py-2.5! font-medium text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "در حال پرداخت..." : "پرداخت انبوه"}
          </button>
        </form>
      </div>
    </div>
  );
}