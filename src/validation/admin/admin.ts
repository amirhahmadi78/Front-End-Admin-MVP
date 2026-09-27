import * as yup from "yup";

export const createAdminSchema = yup.object({

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

  role: yup
    .string()
    .oneOf(
      ["internalManager", "Admin", "secretary", "accountant"],
      "نقش نامعتبر است"
    )
    .required("نقش الزامی است"),
});

export type CreateAdminFormValues = yup.InferType<
  typeof createAdminSchema
>;
