import * as yup from "yup";
import { insurancePaymentType } from "../../types/enums";

export const insuranceContractSchema = yup.object({
  name: yup
    .string()
    .required("نام بیمه الزامی است")
    .min(2, "نام بیمه حداقل ۲ کاراکتر باشد"),

  code: yup
    .string()
    .required("کد قرارداد الزامی است")
    .min(2, "کد قرارداد نامعتبر است"),

  contactPerson: yup
    .string()
    .nullable(),

  phone: yup.string()
      .matches(/^0\d{10}$/, "شماره باید اعداد انگلیسی باشد و با ۰ شروع شود و ۱۱ رقم باشد")
      .required("شماره تلفن الزامی است"),

  email: yup
    .string()
    .required("الزامی می باشد.")
    .email("ایمیل معتبر نیست"),

  contractDate: yup
    .mixed()
    .required("تاریخ قرارداد الزامی است"),

  expiryDate: yup
    .mixed()
    .required("تاریخ انقضا الزامی است")
    .test(
      "is-after-contract",
      "تاریخ انقضا باید بعد از تاریخ قرارداد باشد",
      function (value) {
        const { contractDate } = this.parent;
        if (!contractDate || !value) return true;
        return new Date(value) > new Date(contractDate);
      }
    ),

  status: yup
    .string()
    .oneOf(["active", "pending", "expired"])
    .required(),

  coverage: yup
    .array()
    .of(yup.string())
    .min(1, "حداقل یک خدمت باید انتخاب شود"),

  discountRate: yup
    .number()
    .typeError("درصد تخفیف باید عدد باشد")
    .min(0, "حداقل ۰٪")
    .max(100, "حداکثر ۱۰۰٪")
    .default(0),
});





export const insurancePaymentSchema = yup.object({
  insuranceContractId: yup
    .string()
    .required("انتخاب شرکت بیمه الزامی است"),
  amount: yup
    .number()
    .typeError("مبلغ را وارد کنید")
    .required("مبلغ الزامی است")
    .moreThan(0, "مبلغ باید بیشتر از صفر باشد"),
  date: yup
    .date()
    .typeError("تاریخ معتبر نیست")
    .required("تاریخ الزامی است"),
  reference: yup
    .string()
    .nullable(),
  description: yup
    .string()
    .nullable(),
  paymentType: yup
    .string()
    .oneOf(insurancePaymentType, "نوع پرداخت معتبر نیست")
    .required("نوع پرداخت الزامی است"),
    status:yup
    .string()
    .oneOf( ["recorded", "pending_verification", "rejected"])
});

