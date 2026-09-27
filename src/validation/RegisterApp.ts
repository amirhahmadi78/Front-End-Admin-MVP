import * as yup from "yup";

export const registerAppSchema = yup.object({

  firstName: yup
    .string()
    .required("نام الزامی است"),

  lastName: yup
    .string()
    .required("نام خانوادگی الزامی است"),

  email: yup
    .string()
    .email("ایمیل معتبر نیست")
    .required("ایمیل الزامی است"),

  phone: yup
    .string()
    .required("شماره تماس الزامی است")
    .matches(/^[0-9]{10,15}$/, "شماره تماس معتبر نیست"),

  pass: yup
    .string()
    .required("رمز راه اندازی ظروری است!"),
});

export type registerAppValues = yup.InferType<
  typeof registerAppSchema
>;
