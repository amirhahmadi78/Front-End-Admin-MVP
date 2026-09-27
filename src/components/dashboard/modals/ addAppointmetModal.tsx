import { Controller, useForm } from "react-hook-form";



import { yupResolver } from "@hookform/resolvers/yup";
import moment from "moment-jalaali";
import { useEffect, useMemo, useRef, useState } from "react";
import DateObject from "react-date-object";

import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import Swal from "sweetalert2";


// import "./AddModal.css"
import { useFindPatient } from "../../../hooks/patient";
import { DayOfWeek } from "../../../types/enums";
import { useDefaultPrices } from "../../../hooks/prices";
import { AddAppointmentschema } from "../../../validation/AddApointment";




 export function getWeekdayName(dayNumber:0|1|2|3|4|5|6):string {
    switch (dayNumber) {
        case 0:
            return "Sunday";
        case 1:
            return "Monday";
        case 2:
            return "Tuesday";
        case 3:
            return "Wednesday";
        case 4:
            return "Thursday";
        case 5:
            return "Friday";
        case 6:
            return "Saturday";
        default:
            return "Invalid day number! Please enter a number between 0 and 6.";
    }
}


export default function AppointmentForm({
  groupModal,
setGroupModal,
  setEditingAppointment,
  onSubmit,
  date,
  showForm,
  setShowForm,
  editingAppointment,
  trueDate,
  todayTherapists,
  allAppointments,
setAllAppointments
}) {
 
  const [addDate, setAddDate] = useState(new Date());
  const dayWeek = useMemo(() => {
    return DayOfWeek[moment(trueDate).weekday()];
  }, [trueDate]);

 const {data:patientlist,isLoading:patientListLoading,error:patientListError}=useFindPatient({days:[dayWeek]})

  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [showList, setShowList] = useState(false);
  const listRef = useRef(null);
  const [selTherapist, setSelTherapist] = useState({ role: "" });
  const [useCustomPrice, setUseCustomPrice] = useState(false);

  const [calculatedPrice, setCalculatedPrice] = useState(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  const [priceNotFound, setPriceNotFound] = useState(false);
const{data:defaultPrice ,isLoading:defaultPriceLoading,isError:defaultPriceError}=useDefaultPrices()
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm({
    resolver: yupResolver(AddAppointmentschema),
    defaultValues: editingAppointment || {
      date: date,
      time: "",
      therapist: "",
      patient: "",
      duration: 30,
      type: "session",
      room: "",
      patientFee: "",
      notes: "",
      role: "",
    },
    context: { useCustomPrice },
  });

  // مشاهده فیلدهای مورد نیاز
  const selectedtherapist = watch("therapist");
  const selectedDuration = watch("duration");
  const selectedRole = watch("role");
  const selectedType = watch("type");
  const selectedpatient = watch("patient");




  // ✅ اصلاح useEffect محاسبه قیمت
  useEffect(() => {
    const calculatePrice = async () => {
      // منتظر بمان تا دیتا لود بشه
      if (!defaultPrice || defaultPrice.length === 0) {
        return;
      }

      if (!selectedRole || !selectedType || !selectedDuration || !selectedtherapist) {
        setPriceNotFound(false);
        setCalculatedPrice(null);
        return;
      }

      setIsLoadingPrice(true);
      setPriceNotFound(false);

      try {
        // قیمت مخصوص درمانگر
        const therapistSpecificPrice = defaultPrice.find(item =>
          item.serviceSkill === selectedRole &&
          item.serviceType === selectedType &&
          item.duration === parseInt(selectedDuration) &&
          item.therapist === selectedtherapist
        );

        // قیمت عمومی
        const generalPrice = defaultPrice.find(item =>
          item.serviceSkill === selectedRole &&
          item.serviceType === selectedType &&
          item.duration === parseInt(selectedDuration) &&
          !item.therapist
        );

        let finalPrice = null;
        if (therapistSpecificPrice) {
          finalPrice = therapistSpecificPrice.basePrice;
        } else if (generalPrice) {
          finalPrice = generalPrice.basePrice;
        }

        if (finalPrice) {
          setCalculatedPrice(finalPrice);
          setPriceNotFound(false);
          
          // فقط اگر در حالت خودکار هستیم قیمت رو ست کن
          if (!useCustomPrice) {
            setValue("patientFee", finalPrice);
          }
        } else {
          setCalculatedPrice(null);
          setPriceNotFound(true);
          
          // فقط اگه قبلاً در حالت خودکار بودیم و قیمت پیدا نشد، به دستی تغییر بده
          if (!useCustomPrice && !editingAppointment) {
            setUseCustomPrice(true);
            setValue("patientFee", "");
            
            Swal.fire({
              title: "قیمت پیش‌فرض یافت نشد",
              text: `قیمتی برای ${selectedRole} - ${selectedType} (${selectedDuration} دقیقه) تعریف نشده است.`,
              icon: "info",
              confirmButtonText: "باشه",
              timer: 3000
            });
          }
        }
      } catch (error) {
     
        setPriceNotFound(true);
      } finally {
        setIsLoadingPrice(false);
      }
    };

    calculatePrice();
  // ✅ حذف useCustomPrice از وابستگی‌ها
  }, [selectedRole, selectedType, selectedDuration, selectedtherapist, defaultPrice, setValue, editingAppointment]);

  // ✅ useEffect جداگانه برای وابستگی useCustomPrice
  useEffect(() => {
    if (!useCustomPrice && calculatedPrice) {
      setValue("patientFee", calculatedPrice);
    }
  }, [useCustomPrice, calculatedPrice, setValue]);

  // وقتی درمانگر تغییر کرد
  useEffect(() => {
    if (selectedtherapist && todayTherapists.length > 0) {
      const foundTherapist = todayTherapists.find(
        (t) => t._id === selectedtherapist
      );
      if (foundTherapist) {
        setSelTherapist(foundTherapist);
        setValue("role", foundTherapist.role || "");
      }
    } else {
      setSelTherapist({ role: "" });
      setValue("role", "");
    }
  }, [selectedtherapist, todayTherapists, setValue]);

  // در حالت ویرایش
   useEffect(() => {
    if (editingAppointment) {
      const initialValues = {
        therapist: editingAppointment.therapist,
        patient: editingAppointment.patient,
        time: moment(editingAppointment.start).format("HH:mm"),
        duration: editingAppointment.duration,
        type: editingAppointment.type,
        room: editingAppointment.room,
        patientFee: editingAppointment.patientFee,
        notes: editingAppointment.notes || "",
        role: editingAppointment.role || "",
      };

      reset(initialValues);

      // ست کردن state‌ها بر اساس appointment
      const hasCustomPrice = editingAppointment.patientFee && editingAppointment.patientFee > 0;
      setUseCustomPrice(hasCustomPrice);
      
      // اگه قیمت دستی نیست، سعی کن قیمت رو محاسبه کنی
      if (!hasCustomPrice && editingAppointment.therapist) {
        // مقدار calculatedPrice بعداً توسط useEffect محاسبه میشه
        setCalculatedPrice(null);
      } else if (hasCustomPrice) {
        setCalculatedPrice(editingAppointment.patientFee);
      }

      // پیدا کردن درمانگر
      if (editingAppointment.therapist && todayTherapists.length > 0) {
        const therapist = todayTherapists.find(
          (t) => t._id === editingAppointment.therapist
        );
        if (therapist) {
          setSelTherapist(therapist);
        }
      }
      
      setPriceNotFound(false);
    } else {
      // حالت افزودن جدید
      setUseCustomPrice(false);
      setCalculatedPrice(null);
      setPriceNotFound(false);
      setSelTherapist({ role: "" });
      // reset فرم با مقادیر پیش‌فرض
      reset({
        date: date,
        time: "",
        therapist: "",
        patient: "",
        duration: 30,
        type: "session",
        room: "",
        patientFee: "",
        notes: "",
        role: "",
      });
    }
  }, [editingAppointment, reset, todayTherapists, date]);

 // ✅ اصلاح onCancel
  const onCancel = () => {
    setShowForm(false);
    setEditingAppointment(null);
    setSelTherapist({ role: "" });
    setUseCustomPrice(false);
    setCalculatedPrice(null);
    setPriceNotFound(false);
    setSearch("");
    setShowList(false);
    reset(); // ریست کامل فرم
  };


  // useEffect(() => {
  //   if (showForm) {
  //     const day=getWeekdayName(moment(trueDate).weekday())
  //     GetTodayPatients(day)
  //       .then((res) => {
  //         setPatientlist(res.data.patientList);
  //         setFiltered(res.data.patientList);
  //       })
  //       .catch(() => alert("خطا در بررسی مراجعین"));
  //   }
  // }, [showForm]);

    useEffect(() => {

   

    if(patientlist!=undefined){
     return setFiltered(patientlist);
    }
     
    
    
  }, [patientlist]);

  useEffect(() => {
    if (editingAppointment && patientlist.length > 0) {
      const selectedPatient = patientlist.find(
        (p) => p._id === editingAppointment.patient
      );
      if (selectedPatient) {
        setSearch(`${selectedPatient.firstName} ${selectedPatient.lastName}`);
      }
    }
  }, [editingAppointment, patientlist]);

  // ✅ اصلاح handleFormSubmit
  const handleFormSubmit = (data) => {
    const formattedDate = moment(trueDate).format("YYYY-MM-DD");
    const startDateTime = `${formattedDate}T${data.time}`;
    const start = moment(startDateTime).toISOString();

    // تعیین قیمت نهایی
    let finalPatientFee = data.patientFee;
    
    if (!useCustomPrice) {
      if (calculatedPrice) {
        finalPatientFee = calculatedPrice;
      } else if (priceNotFound) {
        // اگه قیمت پیدا نشده و کاربر وارد نکرده، خطا بده
        Swal.fire({
          title: "خطا",
          text: "لطفاً قیمت را وارد کنید",
          icon: "error",
          confirmButtonText: "باشه"
        });
        return;
      }
    }

    const isoData = {
      ...data,
      start,
      patientFee: finalPatientFee,
      useCustomPrice: useCustomPrice,
      priceNotFound: priceNotFound,
    };

    onSubmit(isoData);
    onCancel(); // استفاده از تابع onCancel برای پاک کردن همه state‌ها
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (listRef.current && !listRef.current.contains(event.target)) {
        setShowList(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (value) => {
    setSearch(value);
    if (value.trim() === "") {
      setFiltered(patientlist);
    } else {
      const result = patientlist.filter((p) =>
        (p.firstName + " " + p.lastName)
          .toLowerCase()
          .includes(value.toLowerCase())
      )||[]
      setFiltered(result);
    }
    setShowList(true);
  };

  useEffect(() => {
    const baseDate = trueDate || date;
    if (baseDate) {
      const d = new DateObject({
        date: new Date(baseDate),
        calendar: persian,
        locale: persian_fa,
      });
      setAddDate(d);
    }
  }, [trueDate, date, showForm]);

  const handleTherapistChange = (e) => {
    const therapist = e.target.value;
    if (therapist && todayTherapists.length > 0) {
      const foundTherapist = todayTherapists.find((t) => t._id === therapist);
      if (foundTherapist) {
        setSelTherapist(foundTherapist);
        setValue("role", foundTherapist.role || "");
      }
    } else {
      setSelTherapist({ role: "" });
      setValue("role", "");
    }
  };




return (
  <>
    {showForm && (
      <div style={{ padding: '24px' }}>
    <div
  className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-[8px] animate-[fadeIn_0.3s_ease-out]"
>
  <div
    className="relative max-h-[90vh] w-[90%] max-w-[500px] overflow-y-auto rounded-[20px] border border-white/20 bg-white shadow-[0_25px_50px_rgba(0,0,0,0.25)] animate-[slideUp_0.4s_cubic-bezier(0.4,0,0.2,1)]"
  >
    {/* پدینگ رو اینجا به یک inner div بدیم */}
    <div className="!p-6 !important" style={{ padding: '30px', border: '3px solid lime' }}>
      
      {/* top gradient line - حالا دیگه absolute نیست */}
      <div className="absolute left-0 right-0 top-0 h-1 rounded-t-[20px] bg-gradient-to-r from-blue-500 via-emerald-500 to-amber-500" />

      {/* close button - موقعیتش رو نسبت به outer div تنظیم کن */}
      <button
        id="closeform"
        onClick={onCancel}
        className="absolute left-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-[18px] text-white transition-all duration-300 ease-in-out hover:rotate-90 hover:bg-red-600"
      >
        ×
      </button>

         <h3
        className="m-0 border-b border-slate-100 pb-5 pt-[30px] text-center text-[22px] font-bold text-slate-800"
      >
        <span className="bg-gradient-to-br from-slate-800 to-slate-600 bg-clip-text text-transparent">
          {editingAppointment == null
            ? "افزودن جلسه درمانی"
            : "ویرایش جلسه درمانی"}
        </span>
      </h3>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="mt-6">
            {/* روز جلسه */}
            <label className="mb-2 block text-right text-[14px] font-semibold text-gray-700">
              روز جلسه: {moment(trueDate).format("jYYYY/jMM/jDD")}
            </label>

            {/* درمانگر */}
            <label className="mb-2 mt-4 block text-right text-[14px] font-semibold text-gray-700">
              درمانگر
            </label>

            <select
              {...register("therapist")}
              onChange={handleTherapistChange}
              className="w-full rounded-[10px] border-2 border-gray-200 bg-white px-4 py-3 text-right text-[14px] transition-all duration-300 ease-in-out focus:-translate-y-[1px] focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="">-- انتخاب درمانگر --</option>

              {todayTherapists && Array.isArray(todayTherapists) ? (
                todayTherapists.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.firstName} {t.lastName}
                  </option>
                ))
              ) : (
                <option> درمانگر وجود ندارد خطا!</option>
              )}
            </select>

            {errors.therapist && (
              <p className="mt-[6px] text-right text-[12px] font-medium text-red-500">
                {errors.therapist.message}
              </p>
            )}

            {/* مراجع */}
            <label className="mb-2 mt-4 block text-right text-[14px] font-semibold text-gray-700">
              مراجع
            </label>

            <Controller
              control={control}
              name="patient"
              render={({ field }) => (
                <div className="relative" ref={listRef}>
                  <input
                    type="text"
                    placeholder="جستجوی مراجع..."
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => setShowList(true)}
                    className="relative w-full rounded-[10px] border-2 border-gray-200 bg-white px-4 py-3 text-right text-[14px] transition-all duration-300 ease-in-out focus:-translate-y-[1px] focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                  />

                  {showList && filtered?.length > 0 && (
                    <ul
                      className="absolute left-0 right-0 top-full z-[1000] mt-1 max-h-[200px] overflow-y-auto rounded-[10px] border border-gray-200 bg-white shadow-[0_10px_25px_rgba(0,0,0,0.15)]"
                    >
                      {Array.isArray(filtered) ? (
                        filtered?.map((p, index) => (
                          <li
                            key={p._id}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              field.onChange(p._id);
                              setSearch(
                                `${p.firstName} ${p.lastName}`
                              );
                              setShowList(false);
                            }}
                            className={`cursor-pointer border-b border-gray-100 px-4 py-3 text-right transition-colors duration-200 hover:bg-slate-50 ${
                              index === filtered.length - 1
                                ? "border-b-0"
                                : ""
                            }`}
                          >
                            {p.firstName} {p.lastName}
                          </li>
                        ))
                      ) : (
                        <li className="px-4 py-3 text-right">خطا!</li>
                      )}
                    </ul>
                  )}
                </div>
              )}
            />

            {errors.patient && (
              <p className="mt-[6px] text-right text-[12px] font-medium text-red-500">
                {errors.patient.message}
              </p>
            )}

            {/* ساعت شروع */}
            <label className="mb-2 mt-4 block text-right text-[14px] font-semibold text-gray-700">
              ساعت شروع
            </label>

            <input
              type="time"
              {...register("time")}
              className="w-full rounded-[10px] border-2 border-gray-200 bg-white px-4 py-3 text-right text-[14px] transition-all duration-300 ease-in-out focus:-translate-y-[1px] focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
            />

            {errors.time && (
              <p className="mt-[6px] text-right text-[12px] font-medium text-red-500">
                {errors.time.message}
              </p>
            )}

            {/* مدت جلسه */}
            <label className="mb-2 mt-4 block text-right text-[14px] font-semibold text-gray-700">
              مدت جلسه (دقیقه)
            </label>

            <select
              type="number"
              placeholder="مثلاً 45"
              {...register("duration")}
              className="w-full rounded-[10px] border-2 border-gray-200 bg-white px-4 py-3 text-right text-[14px] transition-all duration-300 ease-in-out focus:-translate-y-[1px] focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
            >
              <option value={30}>30 دقیقه</option>
              <option value={40}>40 دقیقه</option>
              <option value={45}>45 دقیقه</option>
              <option value={60}>60 دقیقه</option>
              <option value={90}>90 دقیقه</option>
              <option value={15}>15 دقیقه</option>
            </select>

            {errors.duration && (
              <p className="mt-[6px] text-right text-[12px] font-medium text-red-500">
                {errors.duration.message}
              </p>
            )}

            {/* نوع جلسه */}
            <label className="mb-2 mt-4 block text-right text-[14px] font-semibold text-gray-700">
              نوع جلسه
            </label>

            <select
              {...register("type")}
              className="w-full rounded-[10px] border-2 border-gray-200 bg-white px-4 py-3 text-right text-[14px] transition-all duration-300 ease-in-out focus:-translate-y-[1px] focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="">--انتخاب کنید--</option>
              <option value={"session"}>حضوری</option>
              <option value={"online"}>آنلاین</option>
              <option value={"assessment"}>ارزیابی</option>
              <option value={"lunch"}>ناهار</option>
              <option value={"break"}>استراحت</option>
            </select>

            {errors.type && (
              <p className="mt-[6px] text-right text-[12px] font-medium text-red-500">
                {errors.type.message}
              </p>
            )}

            {/* خدمات دریافتی */}
            <label className="mb-2 mt-4 block text-right text-[14px] font-semibold text-gray-700">
              خدمات دریافتی
            </label>

            <select
              {...register("role")}
              value={selTherapist.role || ""}
              onChange={(e) => {
                const newRole = e.target.value;
                setSelTherapist((prev) => ({
                  ...prev,
                  role: newRole,
                }));
                setValue("role", newRole);
              }}
              className="w-full rounded-[10px] border-2 border-gray-200 bg-white px-4 py-3 text-right text-[14px] transition-all duration-300 ease-in-out focus:-translate-y-[1px] focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="">--انتخاب کنید--</option>
              <option value={"SLP"}>گفتار درمانی</option>
              <option value={"OT"}>کاردرمانی</option>
              <option value={"psy"}>
                روانشناس و مشاوره و آموزش
              </option>
              <option value={"PT"}>فیزیوتراپی</option>
              <option value={"therapist"}>تراپیست</option>
            </select>

            {errors.role && (
              <p className="mt-[6px] text-right text-[12px] font-medium text-red-500">
                {errors.role.message}
              </p>
            )}

            {/* سالن / اتاق */}
            <label className="mb-2 mt-4 block text-right text-[14px] font-semibold text-gray-700">
              سالن / اتاق
            </label>

            <input
              type="text"
              placeholder="مثلاً سالن ۱"
              {...register("room")}
              className="w-full rounded-[10px] border-2 border-gray-200 bg-white px-4 py-3 text-right text-[14px] transition-all duration-300 ease-in-out focus:-translate-y-[1px] focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
            />

            {errors.room && (
              <p className="mt-[6px] text-right text-[12px] font-medium text-red-500">
                {errors.room.message}
              </p>
            )}

            {/* بخش قیمت */}
            <div className="mt-5">
              <div>
                <label className="flex items-center justify-end gap-2 text-right text-[14px] font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={useCustomPrice}
                    onChange={(e) => {
                      setUseCustomPrice(e.target.checked);

                      if (
                        !e.target.checked &&
                        calculatedPrice
                      ) {
                        setValue(
                          "patientFee",
                          calculatedPrice
                        );
                      } else if (
                        e.target.checked &&
                        !calculatedPrice
                      ) {
                        setValue("patientFee", "");
                      }
                    }}
                    disabled={isLoadingPrice}
                    className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  وارد کردن قیمت دستی
                </label>

                {!useCustomPrice && !isLoadingPrice && (
                  <div className="mt-3 text-right">
                    {calculatedPrice ? (
                      <span className="text-[14px] font-semibold text-emerald-600">
                        قیمت:{" "}
                        {calculatedPrice.toLocaleString()} تومان
                      </span>
                    ) : priceNotFound ? (
                      <span className="text-[13px] font-medium text-amber-500">
                        ⚠️ قیمت پیش‌فرض یافت نشد - لطفاً
                        قیمت دستی وارد کنید
                      </span>
                    ) : (
                      <span className="text-[13px] text-slate-500">
                        در حال محاسبه قیمت...
                      </span>
                    )}
                  </div>
                )}

                {priceNotFound && (
                  <div className="mt-3 flex items-center justify-end gap-2 text-right">
                    <span className="text-[16px] text-amber-500">
                      ⚠️
                    </span>

                    <span className="text-[13px] font-medium text-amber-500">
                      قیمت پیش‌فرض یافت نشد
                    </span>
                  </div>
                )}
              </div>

              {useCustomPrice && (
                <div className="mt-4">
                  <label className="mb-2 block text-right text-[14px] font-semibold text-gray-700">
                    هزینه بیمار (تومان)
                  </label>

                  <input
                    type="number"
                    placeholder="مثلاً 150000"
                    {...register("patientFee")}
                    disabled={isLoadingPrice}
                    className="w-full rounded-[10px] border-2 border-gray-200 bg-white px-4 py-3 text-right text-[14px] transition-all duration-300 ease-in-out focus:-translate-y-[1px] focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-gray-100"
                  />

                  {errors.patientFee && (
                    <p className="mt-[6px] text-right text-[12px] font-medium text-red-500">
                      {errors.patientFee.message}
                    </p>
                  )}

                  {priceNotFound && (
                    <p className="mt-2 text-right text-[12px] text-slate-500">
                      لطفاً قیمت را برای {selectedRole} -{" "}
                      {selectedType} ({selectedDuration} دقیقه)
                      وارد کنید
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* یادداشت */}
            <label className="mb-2 mt-4 block text-right text-[14px] font-semibold text-gray-700">
              یادداشت‌ها
            </label>

            <textarea
              rows={3}
              placeholder="یادداشت اختیاری..."
              {...register("notes")}
              className="min-h-[80px] w-full resize-y rounded-[10px] border-2 border-gray-200 bg-white px-4 py-3 text-right text-[14px] transition-all duration-300 ease-in-out focus:-translate-y-[1px] focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
            />

            {errors.notes && (
              <p className="mt-[6px] text-right text-[12px] font-medium text-red-500">
                {errors.notes.message}
              </p>
            )}

            {/* actions */}
            <div
              className="mt-[30px] flex justify-between gap-3 border-t border-slate-100 pt-5 max-md:flex-col"
            >
              <button
                type="submit"
                disabled={isLoadingPrice}
                className="relative flex-1 overflow-hidden rounded-[10px] bg-gradient-to-br from-blue-500 to-blue-700 px-5 py-[14px] text-[15px] font-semibold text-white shadow-[0_4px_15px_rgba(59,130,246,0.3)] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-[2px] hover:shadow-[0_8px_25px_rgba(59,130,246,0.5)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoadingPrice
                  ? "در حال محاسبه..."
                  : editingAppointment == null
                  ? "ذخیره"
                  : "ویرایش"}
              </button>

              <button
                type="button"
                onClick={onCancel}
                className="relative flex-1 overflow-hidden rounded-[10px] bg-gradient-to-br from-gray-500 to-gray-600 px-5 py-[14px] text-[15px] font-semibold text-white shadow-[0_4px_15px_rgba(107,114,128,0.3)] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-[2px] hover:shadow-[0_8px_25px_rgba(107,114,128,0.5)]"
              >
                لغو
              </button>
            </div>
          </form>
        </div>
      </div>
       </div>
       </div>
    )}
  </>
);

}






 
