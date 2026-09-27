import * as yup from "yup";
export const schema = yup.object({
firstName: yup.string().required("پر کردن این فیلد الزامی است"),
lastName: yup.string().required("پر کردن این فیلد الزامی است"),
role: yup.string().required("پر کردن این فیلد الزامی است"),
  phone: yup.string()
    .matches(/^0\d{10}$/, "شماره باید اعداد انگلیسی باشد و با ۰ شروع شود و ۱۱ رقم باشد")
    .required("شماره تلفن الزامی است"),
percentDefault: yup.number().required("پر کردن این فیلد الزامی است"),
percentIntroduced: yup.number().required("پر کردن این فیلد الزامی است"),
skills:yup.array(),
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