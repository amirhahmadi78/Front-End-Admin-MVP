import * as yup from "yup";
export const AddAppointmentschema = yup.object({
therapist: yup.string().required("پر کردن این فیلد الزامی است"),
patient: yup.string().required("پر کردن این فیلد الزامی است"),
 start: yup.string(),
duration: yup.number().required("پر کردن این فیلد الزامی است"),
type: yup.string().required("پر کردن این فیلد الزامی است"),
room: yup.string().required("پر کردن این فیلد الزامی است"),
notes:yup.string(),
role:yup.string().required("پر کردن این فیلد الزامی است"),
patientFee: yup
    .number()
    .typeError("قیمت باید عدد باشد")
    .test(
      'conditional-required',
      'قیمت بیمار الزامی است',
      function(value) {
        const { useCustomPrice } = this.options.context || {};
        
        if (useCustomPrice) {
          // اگر کاربر قیمت دستی می‌خواهد وارد کند
          return value !== undefined && value !== null && value >= 0;
        }
        // اگر از قیمت دیفالت استفاده می‌کند
        return true;
      }
    )
});