import * as yup from "yup";
export const AddDefAppschema = yup.object({
therapist: yup.string().required("پر کردن این فیلد الزامی است"),
patient: yup.string().required("پر کردن این فیلد الزامی است"),
 start: yup.string(),
duration: yup.number().required("پر کردن این فیلد الزامی است"),
type: yup.string().required("پر کردن این فیلد الزامی است"),
patientFee:  yup.number()
  .nullable()
  .transform((value, originalValue) => {
    return originalValue === "" ? null : value;
  })
  .integer("هزینه باید عدد صحیح باشد")
  .min(0, "هزینه نمی‌تواند منفی باشد")
  .optional(),
room: yup.string(),
notes:yup.string(),
});

