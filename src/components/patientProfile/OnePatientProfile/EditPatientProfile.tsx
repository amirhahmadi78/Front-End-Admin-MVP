import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Select from "react-select";

// تعریف نوع داده‌های فرم
interface FormData {
  evaluatedBy: string;
  editableBy: string[];
  finished: boolean;
}

// تعریف Schema اعتبارسنجی با yup
const schema = yup.object().shape({
  evaluatedBy: yup.string().required("انتخاب ارزیاب اصلی الزامی است"),
  editableBy: yup.array().of(yup.string()),
  finished: yup.boolean(),
});

interface EditAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  therapists: any[];
  defaultValues: {
    evaluatedBy: string;
    editableBy: string[];
    finished: boolean;
  };
  onSubmit: (data: FormData) => Promise<void>;
  loading?: boolean;
}

// تبدیل لیست درمانگران به فرمت react-select
const mapTherapistsToOptions = (therapists: any[]) =>
  therapists.map((t) => ({
    value: t._id,
    label: `${t.firstName} ${t.lastName}`,
  }));

const EditAccessModal: React.FC<EditAccessModalProps> = ({
  isOpen,
  onClose,
  therapists,
  defaultValues,
  onSubmit,
  loading = false,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues,
  });

  const editableByValues = watch("editableBy") || [];
  const evaluatedByValue = watch("evaluatedBy"); // مقدار انتخابی ارزیاب اصلی

  const [selectedTherapistId, setSelectedTherapistId] = useState<string>("");

  const therapistOptions = mapTherapistsToOptions(therapists);

  // مقدار انتخابی ارزیاب اصلی - بر اساس مقدار فرم
  const selectedEvaluator = therapistOptions.find(
    (opt) => opt.value === evaluatedByValue
  );

  // درمانگرانی که هنوز به لیست editableBy اضافه نشدن
  const availableTherapists = therapists.filter(
    (t) => !editableByValues.includes(t._id)
  );
  const availableOptions = mapTherapistsToOptions(availableTherapists);

  // مقدار انتخابی در سلکت دوم (برای نمایش)
  const selectedEditableOption = availableOptions.find(
    (opt) => opt.value === selectedTherapistId
  );

  // اضافه کردن به لیست
  const handleAddEditable = () => {
    if (!selectedTherapistId) return;
    if (editableByValues.includes(selectedTherapistId)) {
      alert("این درمانگر قبلاً اضافه شده است.");
      return;
    }
    setValue("editableBy", [...editableByValues, selectedTherapistId]);
    setSelectedTherapistId("");
  };

  // حذف از لیست
  const handleRemoveEditable = (id: string) => {
    setValue(
      "editableBy",
      editableByValues.filter((item) => item !== id)
    );
  };

  // ریست فرم هنگام بسته شدن و زمانی که defaultValues تغییر می‌کنه
  React.useEffect(() => {
    if (isOpen) {
      reset(defaultValues);
    }
  }, [isOpen, reset, defaultValues]);

  // ریست state انتخاب‌شده در سلکت دوم
  React.useEffect(() => {
    if (!isOpen) {
      setSelectedTherapistId("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    reset(defaultValues);
    setSelectedTherapistId("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4! bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-3!">
        {/* هدر */}
        <div className="flex items-center justify-between mb-3!">
          <h2 className="text-2xl font-bold text-gray-800">ویرایش دسترسی‌ها</h2>
          <button
            onClick={handleClose}
            className="p-2! hover:bg-gray-100 rounded-full transition"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* ====== سلکت اول: ارزیاب اصلی (با جستجو) ====== */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1!">
              ارزیاب اصلی <span className="text-red-500">*</span>
            </label>
            <Controller
              name="evaluatedBy"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={therapistOptions}
                  isSearchable
                  placeholder="جستجو و انتخاب ارزیاب..."
                  noOptionsMessage={() => "نتیجه‌ای یافت نشد"}
                  value={selectedEvaluator}
                  onChange={(newValue) => {
                    field.onChange(newValue?.value || "");
                  }}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderRadius: "0.75rem",
                      borderColor: errors.evaluatedBy ? "#ef4444" : "#d1d5db",
                      "&:hover": { borderColor: "#6366f1" },
                      boxShadow: "none",
                      "&:focus-within": {
                        borderColor: "#6366f1",
                        boxShadow: "0 0 0 3px rgba(99,102,241,0.1)",
                      },
                    }),
                    menu: (base) => ({ ...base, zIndex: 9999 }),
                  }}
                />
              )}
            />
            {errors.evaluatedBy && (
              <p className="mt-1! text-sm text-red-600">{errors.evaluatedBy.message}</p>
            )}
          </div>

          {/* ====== سلکت دوم: درمانگران قابل ویرایش (با جستجو + دکمه افزودن) ====== */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1!">
              درمانگران با دسترسی انجام ارزیابی
            </label>
            <div className="flex gap-2!">
              <div className="flex-1">
                <Select
                  options={availableOptions}
                  isSearchable
                  placeholder="جستجو و انتخاب درمانگر..."
                  noOptionsMessage={() => "نتیجه‌ای یافت نشد"}
                  value={selectedEditableOption}
                  onChange={(newValue) => {
                    setSelectedTherapistId(newValue?.value || "");
                  }}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderRadius: "0.75rem",
                      borderColor: "#d1d5db",
                      "&:hover": { borderColor: "#6366f1" },
                      boxShadow: "none",
                      "&:focus-within": {
                        borderColor: "#6366f1",
                        boxShadow: "0 0 0 3px rgba(99,102,241,0.1)",
                      },
                    }),
                    menu: (base) => ({ ...base, zIndex: 9999 }),
                  }}
                />
              </div>
              <button
                type="button"
                onClick={handleAddEditable}
                className="px-4! py-2! bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                disabled={!selectedTherapistId}
              >
                افزودن
              </button>
            </div>

            {/* نمایش لیست تگ‌های انتخاب‌شده */}
            {editableByValues.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-3!">
                {editableByValues.map((id) => {
                  const therapist = therapists.find((t) => t._id === id);
                  if (!therapist) return null;
                  return (
                    <div
                      key={id}
                      className="flex items-center gap-1! bg-indigo-50 border border-indigo-200 rounded-full px-3 py-1.5 text-sm"
                    >
                      <span className="font-medium text-gray-800">
                        {therapist.firstName} {therapist.lastName}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveEditable(id)}
                        className="p-1.5! hover:bg-indigo-200 rounded-full transition text-indigo-600 hover:text-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400 mt-2!">هیچ درمانگری انتخاب نشده است.</p>
            )}
            <p className="text-xs text-gray-400 mt-1!">
              با تایپ کردن جستجو کنید، گزینه را انتخاب کرده و روی «افزودن» کلیک کنید.
            </p>
          </div>

          {/* وضعیت تکمیل */}
          <div className="flex items-center gap-3!">
            <Controller
              name="finished"
              control={control}
              render={({ field }) => (
                <input
                  type="checkbox"
                  id="finished"
                  checked={field.value || false}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
              )}
            />
            <label htmlFor="finished" className="text-sm font-medium text-gray-700">
              پرونده تکمیل شده است
            </label>
          </div>

          {/* دکمه‌های اقدام */}
          <div className="flex gap-3! pt-4!">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2! px-4! border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2! px-4! bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  در حال ذخیره...
                </>
              ) : (
                "ذخیره تغییرات"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAccessModal;