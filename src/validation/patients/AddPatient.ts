
import * as yup from "yup";
export const AddPatientschema = yup.object({
firstName: yup.string().required("پر کردن این فیلد الزامی است"),
lastName: yup.string().required("پر کردن این فیلد الزامی است"),
 phone: yup.string()
    .matches(/^0\d{10}$/, "شماره باید اعداد انگلیسی باشد و با ۰ شروع شود و ۱۱ رقم باشد")
    .required("شماره تلفن الزامی است"),
paymentType: yup.string().required("پر کردن این فیلد الزامی است"),
bimehKind:yup.string(),
discountPercent: yup.number(),
address: yup.string().required("پر کردن این فیلد الزامی است"),
introducedBy: yup
  .string()
  .nullable()
  .transform((value, originalValue) => {
    if (originalValue === "") return null;

    // اگر object از populate آمد
    if (typeof originalValue === "object" && originalValue?._id) {
      return originalValue._id;
    }

    return value;
  })
  .optional(),
workDays: yup.array()
    .of(
      yup.object().shape({
        day: yup.string()
          .oneOf([
            "Saturday",
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
          ])
          .required("روز الزامی است"),
        startTime: yup.string().required("زمان شروع الزامی است"),
        endTime: yup.string().required("زمان پایان الزامی است"),
      })
    )
    .min(1, "حداقل یک روز کاری باید انتخاب شود")
});