import { Controller, useForm } from "react-hook-form";


import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useRef, useState } from "react";
// import { GetTodayPatients, PostDeleteDefAppointment } from "../../../api/adminpanel";
import moment from "moment-jalaali";

import Swal from "sweetalert2";
import { AddDefAppschema } from "../../validation/defApp/AddDefApointment";

import { useFindPatient } from "../../hooks/patient";
import { useDeleteDefApp } from "../../hooks/defAppointment";


export default function AddDefAppointment({
  editingAppointment,
  todayTherapists,
  selectedDay,
  onSubmit,
  setShowModal,
  showModal,
  defAppointments,
setDefAppointments,
  setEditMode,

  setEditingAppointment
}) {

 if (!selectedDay) {
    return null
  }

  const [showList, setShowList] = useState(false);
  const [search, setSearch] = useState("");
  const {mutate:DeleteApp}=useDeleteDefApp()
  

 
  
const {data:patientsList}=useFindPatient({days:[selectedDay?.eng]})

const [useSpecialPrice, setUseSpecialPrice] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(AddDefAppschema),
    defaultValues: {
      date: selectedDay.eng,
      time: "",
      therapist: "",
      patient: "",
      duration: 30,
      type: "session",
      room: "",
      notes: "",
      patientFee: null,
    },
  });

useEffect(() => {
    if (!showModal) {
      resetForm();
    }
  }, [showModal]);


  const resetForm = () => {
    reset({
      date: selectedDay?.eng || "",
      time: "",
      therapist: "",
      patient: "",
      duration: 30,
      type: "session",
      room: "",
      notes: "",
      patientFee: null,
    });
    setSearch("");
    setShowList(false);
    setFiltered(Array.isArray(patientsList)?patientsList:[])
  };
  const [filtered, setFiltered] = useState(patientsList||[]);
  useEffect(()=>{
if(Array.isArray(patientsList)){
  setFiltered(patientsList)
}else return []

  },[patientsList])
  // ✅ این useEffect مقادیر فرم رو وقتی editingAppointment تغییر کرد آپدیت می‌کنه
  useEffect(() => {
    if (editingAppointment) {
      reset({
        date: editingAppointment.date || selectedDay.eng,
        time: moment(editingAppointment.start).format("HH:mm") || "",
        therapist: editingAppointment.therapist || "",
        patient: editingAppointment.patient || "",
        duration: editingAppointment.duration || 30,
        type: editingAppointment.type || "",
        room: editingAppointment.room || "",
        notes: editingAppointment.notes || "",
        patientFee: editingAppointment.patientFee || null,
      });
      
      // ✅ اگر patient داره، اسم بیمار رو در search قرار بده
      if (editingAppointment.patient && patientsList.length > 0) {
        const patient = patientsList.find(p => p._id === editingAppointment.patient);
        if (patient) {
          setSearch(`${patient.firstName} ${patient.lastName}`);
        }
      }
    } else {
      // ✅ حالت عادی - فرم خالی
      reset({
        date: selectedDay.eng,
        time: "",
        therapist: "",
        patient: "",
        duration: 30,
        type: "session",
        room: "",
        notes: "",
        patientFee: null,
      });
      setSearch("");
    }
  }, [editingAppointment, reset, selectedDay.eng, patientsList]);

  const onCancel = () => {
    setEditMode(false);
    setShowModal(false);
    setEditingAppointment(null);
    reset(); // ✅ فرم رو ریست کن
    setSearch(""); // ✅ search رو هم پاک کن
    setFiltered(Array.isArray(patientsList)?patientsList:[])
  };

  const listRef = useRef(null);


  const handleSearch = (value) => {
    setSearch(value);
    if (value.trim() === "") {
      setFiltered(patientsList);
    } else {
      const result =Array.isArray(patientsList)? patientsList.filter((p) =>
        (p.firstName + " " + p.lastName).toLowerCase().includes(value.toLowerCase())
      ):[]
      setFiltered(result);
    }
    setShowList(true);
  };


const handleDelete = async () => {
  setShowModal(false)
  const result = await Swal.fire({
    title: "آیا مطمئن هستید؟",
    text: "از حذف این جلسه درمانی ثابت اطمینان دارید؟",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "بله، حذف شود",
    cancelButtonText: "خیر"
  });

  if (!result.isConfirmed) return;


  
    DeleteApp(editingAppointment._id)

   
    onCancel();
    
  
 
};
     
     

    

  
  return (
    <>
      <button className="add-session-btn m-5!" onClick={() => {
    setShowModal(true);
    // ✅ مطمئن شو که در حالت افزودن هستی
    if (editingAppointment) {
      setEditingAppointment({});
      setEditMode(false);
    }
  }}>
        افزودن جلسه درمانی
      </button>
      <br />
      
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <button id="closeform" onClick={onCancel}>×</button>
            <h3>{editingAppointment ? "ویرایش جلسه" : "افزودن جلسه جدید"}</h3>

            <form onSubmit={handleSubmit(onSubmit)
            } className="appointment-form">
              {/* روز جلسه */}
              <label>روز جلسه: {selectedDay.name}</label>

              {/* درمانگر */}
              <label>درمانگر</label>
              <select {...register("therapist")}>
                <option value="">-- انتخاب درمانگر --</option>
                {!todayTherapists || todayTherapists.length === 0 ? (
                  <option>در این روز درمانگر وجود ندارد</option>
                ) : (
                  Array.isArray(todayTherapists) && todayTherapists.map((t) => (
                    <option  key={t._id} value={t._id}>
                      {t.firstName} {t.lastName}
                    </option>
                  ))
                )}
              </select>
              {errors.therapist && (
                <p className="error-message">{errors.therapist.message}</p>
              )}

              {/* مراجع */}
              <label>مراجع</label>
              <Controller
                control={control}
                name="patient"
                render={({ field }) => (
                  <div style={{ position: "relative" }} ref={listRef}>
                    <input
                      type="text"
                      placeholder="جستجوی مراجع..."
                      value={search}
                      onChange={(e) => handleSearch(e.target.value)}
                      onFocus={() => setShowList(true)}
                      className="search-input"
                    />

                    {showList && filtered.length > 0 && (
                      <ul
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          right: 0,
                          background: "#fff",
                          border: "1px solid #ccc",
                          borderRadius: "8px",
                          maxHeight: "200px",
                          overflowY: "auto",
                          zIndex: 1000,
                        }}
                      >
                        {Array.isArray(filtered)&&filtered.map((p) => (
                          <li
                            key={p._id}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              field.onChange(p._id);
                              setSearch(`${p.firstName} ${p.lastName}`);
                              setShowList(false);
                            }}
                            style={{
                              padding: "8px",
                              cursor: "pointer",
                            }}
                          >
                            {p.firstName} {p.lastName}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              />
              {errors.patient && (
                <p className="error-message">{errors.patient.message}</p>
              )}

              {/* بقیه فیلدها */}
              <label>ساعت شروع</label>
              <input type="time" {...register("time")} />
              {errors.time && <p className="error-message">{errors.time.message}</p>}

              <label>مدت جلسه (دقیقه)</label>
              <input type="number" placeholder="مثلاً 45" {...register("duration")} />
              {errors.duration && <p className="error-message">{errors.duration.message}</p>}

              <label>نوع جلسه</label>
              <select {...register("type")}>
                <option value="">--انتخاب کنید--</option>
                <option value="session">حضوری</option>
                <option value="online">آنلاین</option>
                <option value="assessment">ارزیابی</option>
                  <option value="lunch">ناهار</option>
                <option value="break">استراحت</option>
              </select>
              {errors.type && <p className="error-message">{errors.type.message}</p>}

  
              {errors.role && <p className="error-message">{errors.role.message}</p>}
              <label>سالن / اتاق</label>
              <input type="text" placeholder="مثلاً سالن ۱" {...register("room")} />
              {errors.room && <p className="error-message">{errors.room.message}</p>}

            <div>
  <label>هزینه بیمار (تومان)</label>
    <div style={{ marginTop: '8px' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input
          type="checkbox"
          checked={useSpecialPrice}
          onChange={(e) => {
            setUseSpecialPrice(e.target.checked);
            if (!e.target.checked) {
              setValue("patientFee", null);
            }
          }}
        />
        <span>
          قیمت خاص برای این جلسه
          <small style={{ display: 'block', color: '#666', fontSize: '0.8rem' }}>
            (اگر می‌خواهید از قیمت‌های پیش‌فرض جلسات استفاده شود، قیمت را وارد نکنید!)
          </small>
        </span>
      </label>
  </div>
    <input 
      type="number" 
      placeholder="مثلاً 150000" 
      {...register("patientFee", {
        required: useSpecialPrice ? "وارد کردن قیمت الزامی است" : false,
        min: useSpecialPrice ? { value: 1, message: "قیمت باید بیشتر از 0 باشد" } : undefined
      })} 
      disabled={!useSpecialPrice}
    />
    {errors.patientFee && <p className="error-message">{errors.patientFee.message}</p>}
    
  
</div>
              <label>یادداشت‌ها</label>
              <textarea rows={3} placeholder="یادداشت اختیاری..." {...register("notes")}></textarea>
              {errors.notes && <p className="error-message">{errors.notes.message}</p>}

              <div className="modal-actions">
                <button type="submit">{editingAppointment ? "ویرایش" : "ذخیره"}</button>
                
                 {editingAppointment?<button  style={{
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    margin: '5px'
  }} className="delete-btn" onClick={()=>{handleDelete()}} type="button" >حذف جلسه درمانی ثابت</button>:<></>}
                
               
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}