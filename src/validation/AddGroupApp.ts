import { z } from "zod";

const groupSessionSchema = z.object({
  therapists: z.array(z.object({
    therapistId: z.string().min(1, "انتخاب حداقل یک درمانگر الزامی است"),
    percentage: z.number().min(0).max(100),
    therapistShare: z.number().min(0)
  })).min(1, "حداقل یک درمانگر باید انتخاب شود"),
  
  patients: z.array(z.string()).min(1, "حداقل یک مراجعه‌کننده باید انتخاب شود"),
  
  onePatientFee: z.coerce.number().min(1000, "مبلغ ورودیه هر بیمار معتبر نیست"),
  
  duration: z.number().min(15, "مدت جلسه نمی‌تواند کمتر از ۱۵ دقیقه باشد"),
  
  startTime: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, "فرمت زمان شروع اشتباه است"),
  
  endTime: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, "فرمت زمان پایان اشتباه است"),
  
  date: z.date({ required_error: "انتخاب تاریخ الزامی است" }),
  
  room: z.string().optional(),
});
  

export default groupSessionSchema