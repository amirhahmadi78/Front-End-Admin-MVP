import * as yup from "yup";

export const AddSalaryschema = yup.object().shape({
  type: yup
    .string()
    .oneOf(["payment", "refund"], "نوع تراکنش نامعتبر است.")
    .required("نوع تراکنش را انتخاب کنید."),
  fee: yup
    .number()
    .typeError("مبلغ باید عدد باشد.")
    .positive("مبلغ باید عددی مثبت باشد.")
    .required("مبلغ الزامی است."),
  payment: yup
    .string()
    .oneOf(["cash", "sheba", "cart", "satna", "havale"], "روش پرداخت نامعتبر است.")
    .required("روش پرداخت را انتخاب کنید."),
  coderahgiri: yup
    .number()
    .typeError("کد رهگیری باید عدد باشد.")
    .required("کد رهگیری الزامی است."),
  note: yup.string().max(300, "حداکثر ۳۰۰ کاراکتر مجاز است."),
});
