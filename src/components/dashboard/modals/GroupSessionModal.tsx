// GroupSessionModal.jsx
import { useState, useEffect, useRef } from "react";
import "./GroupSessionModal.css";

import moment from "moment-jalaali";
import Swal from "sweetalert2";


import { useCreateGroup, useUpdateGroup } from "../../../hooks/groupAppointment";



export default function GroupSessionModal({
  isOpen,
  onClose,
  trueDate,
  todayTherapists,
  patientlist,
  editingGroup,

}) {

  // استف

  // اگر مودال بسته است، چیزی رندر نکن
  if (!isOpen) return null;
   
  
  const [formData, setFormData] = useState({
    therapists: [],
    patients: [],
    onePatientFee: "",
    duration: 60,
    startTime: "",
    endTime: "",
    date: trueDate,
    room: "",
    category: "therapy",
    notes: "",
  });

  const [therapistSearch, setTherapistSearch] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const [showTherapistList, setShowTherapistList] = useState(false);
  const [showPatientList, setShowPatientList] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const therapistListRef = useRef(null);
  const patientListRef = useRef(null);
  const [therapistPercentages, setTherapistPercentages] = useState({});
  const [totalPercentage, setTotalPercentage] = useState(0);
const{mutate:CreateGroup}=useCreateGroup()
const {mutate:UpdateGroup}=useUpdateGroup()
  // محاسبه مجموع درصدها
  useEffect(() => {
    if (therapistPercentages && Object.keys(therapistPercentages).length > 0) {
      const total = Object.values(therapistPercentages)
        .reduce((sum, value) => sum + (Number(value) || 0), 0);
      setTotalPercentage(total);
    } else {
      setTotalPercentage(0);
    }
  }, [therapistPercentages]);

  const handleTherapistPercentageChange = (therapistId, value) => {
    const numValue = parseInt(value) || 0;
    const newValue = numValue > 100 ? 100 : (numValue < 0 ? 0 : numValue);
    
    setTherapistPercentages(prev => ({
      ...prev,
      [therapistId]: newValue
    }));
  };

const validateForm = () => {
  const errors = {};

  if (!formData.onePatientFee || parseInt(formData.onePatientFee) <= 0) {
    errors.onePatientFee = "هزینه هر بیمار باید بیشتر از صفر باشد";
  }

  if (formData.therapists.length === 0) {
    errors.therapists = "حداقل یک درمانگر باید انتخاب شود";
  }

  if (formData.patients.length === 0) {
    errors.patients = "حداقل یک بیمار باید انتخاب شود";
  }

  if (!formData.startTime) {
    errors.startTime = "ساعت شروع الزامی است";
  }

  // بررسی درصد هر درمانگر
  for (const therapist of formData.therapists) {
    // const percent = therapistPercentages[therapist._id];

    if (formData.therapists.length !== 1) {
      errors.therapists = "لطفا فقط یک درمانگر را انتخاب کنید!";
      break;
    }

    // if (percent <= 0) {
    //   errors.therapistPercentages = "درصد درمانگر نمی‌تواند صفر یا منفی باشد";
    //   break;
    // }

    // if (percent > 100) {
    //   errors.therapistPercentages = "درصد هیچ درمانگری نمی‌تواند بیشتر از ۱۰۰ باشد";
    //   break;
    // }
  }

  // مجموع درصدها
  // if (totalPercentage > 100) {
  //   errors.therapistPercentages = "مجموع درصد درمانگران نمی‌تواند بیشتر از ۱۰۰٪ باشد";
  // }

  // اگر میخواهی دقیقاً 100 باشد
// for (const therapist of formData.therapists) {
//     const percent = Number(therapistPercentages[therapist._id]);

//     if (!percent || percent <= 0) {
//       errors.therapistPercentages = `درصد سهم برای ${therapist.firstName} ${therapist.lastName} باید بیشتر از صفر باشد`;
//       break;
//     }
//   }

  setFormErrors(errors);
  return Object.keys(errors).length === 0;
};


  // اعتبارسنجی هنگام تغییر فرم
  useEffect(() => {
    if (Object.keys(formErrors).length > 0) {
      validateForm();
    }
  }, [formData, therapistPercentages, totalPercentage]);

  useEffect(() => {
    if (editingGroup) {
      const endTime = moment(editingGroup.end).format("HH:mm");
      const startTime = moment(editingGroup.start).format("HH:mm");
      const PatientExist = patientlist.filter((patient) =>
        editingGroup.groupSession?.patients.includes(patient._id)
      );
      const TherapistExist = todayTherapists.filter((therapist) =>
        editingGroup.groupSession?.therapists.map(item=>item.therapistId==therapist._id).includes(true)
      );
      
      if (editingGroup.groupSession?.therapists) {
        let therapistpercents={}
        editingGroup.groupSession.therapists.forEach(item=>{
          therapistpercents[item.therapistId]=50
        })
        setTherapistPercentages(therapistpercents);
      } else {
        setTherapistPercentages({});
      }

      setFormData({
        therapists: TherapistExist || [],
        patients: PatientExist || [],
        onePatientFee: editingGroup.groupSession?.onePatientFee || "",
        duration: editingGroup.duration || 60,
        startTime: startTime,
        endTime: endTime,
        date: moment(editingGroup.start).format("YYYY-MM-DD"),
        room: editingGroup.room || "",
        category: editingGroup.category || "therapy",
        notes: editingGroup.notes || "",
      });
      
      // پاک کردن خطاها در حالت edit
      setFormErrors({});
    } else {
      setFormData({
        therapists: [],
        patients: [],
        onePatientFee: "",
        duration: 45,
        startTime: "",
        endTime: "",
        date: trueDate,
        room: "",
        category: "therapy",
        notes: "",
      });
      setTherapistPercentages({});
      setFormErrors({});
    }
  }, [editingGroup, trueDate]);

  const filteredTherapists = todayTherapists&&Array.isArray(todayTherapists)?todayTherapists?.filter((therapist) =>
    `${therapist.firstName} ${therapist.lastName}`
      .toLowerCase()
      .includes(therapistSearch.toLowerCase())
  ):[]

  const filteredPatients = patientlist&&Array.isArray(patientlist)?patientlist.filter((patient) =>
    `${patient.firstName} ${patient.lastName}`
      .toLowerCase()
      .includes(patientSearch.toLowerCase())
  ):[]

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        therapistListRef.current &&
        !therapistListRef.current.contains(event.target)
      ) {
        setShowTherapistList(false);
      }
      if (
        patientListRef.current &&
        !patientListRef.current.contains(event.target)
      ) {
        setShowPatientList(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // اعتبارسنجی فرم
    if (!validateForm()) {
      Swal.fire({
        title: "خطا در فرم",
        text: "لطفاً خطاهای فرم را برطرف کنید",
        icon: "error",
        timer: 2000,
      });
      return;
    }
    

    const formattedDate = moment(trueDate).format("YYYY-MM-DD");
    const startDateTime = `${formattedDate}T${formData.startTime}`;
    const start = moment(startDateTime).toISOString();

    let therapistsArray=[]
for (const item in therapistPercentages){
  therapistsArray.push(
{
    therapistId:item,
    percentage:50,
    therapistShare:0
  }
  ) 
}








    const payload = {
      sessionType: "group",
      groupSession: {
        // therapists: formData.therapists.map((t) => t._id),
        therapists:therapistsArray,
        patients: formData.patients.map((p) => p._id),
        onePatientFee: parseInt(formData.onePatientFee),
        
      },
      start,
      duration: formData.duration,
      patientFee: formData.patients.length * parseInt(formData.onePatientFee || 0),
      room: formData.room,
      category: formData.category,
      notes: formData.notes,
     
    };

    if (editingGroup) {

      
      await UpdateGroupApp(editingGroup._id, payload);
    } else {
      await MakeGroupApp(payload);
    }

    onClose();
  };

  const UpdateGroupApp = async (groupId, payload) => {
   
      
      UpdateGroup({groupId, ...payload});
      
      
      



      // if (onGroupUpdated) {
      //   onGroupUpdated(updatedGroup);
      // }
   
  };

  const MakeGroupApp = async (payload) => {

   CreateGroup(payload);


  };

const addTherapist = (therapist) => {
  if (formData.therapists.length > 0) {
    return alert("فقط یک درمانگر می توانید انتخاب کنید");
  }
  if (!formData.therapists.find((t) => t._id === therapist._id)) {
    setFormData((prev) => ({
      ...prev,
      therapists: [...prev.therapists, therapist],
    }));
    // ✅ مقدار پیش‌فرض برای درصد (مثلاً ۵۰)
    setTherapistPercentages(prev => ({
      ...prev,
      [therapist._id]: 50,
    }));
  }
  setTherapistSearch("");
  setShowTherapistList(false);
  if (formErrors.therapists) {
    setFormErrors(prev => ({ ...prev, therapists: undefined }));
  }
};

  const removeTherapist = (therapistId) => {
    setFormData((prev) => ({
      ...prev,
      therapists: prev.therapists.filter((t) => t._id !== therapistId),
    }));
    
    // حذف درصد درمانگر حذف شده
    setTherapistPercentages(prev => {
      const newPercentages = { ...prev };
      delete newPercentages[therapistId];
      return newPercentages;
    });
  };

  const addPatient = (patient) => {
    if (!formData.patients.find((p) => p._id === patient._id)) {
      setFormData((prev) => ({
        ...prev,
        patients: [...prev.patients, patient],
      }));
    }
    setPatientSearch("");
    setShowPatientList(false);
    
    // پاک کردن خطاهای مربوط
    if (formErrors.patients) {
      setFormErrors(prev => ({ ...prev, patients: undefined }));
    }
  };

  const removePatient = (patientId) => {
    setFormData((prev) => ({
      ...prev,
      patients: prev.patients.filter((p) => p._id !== patientId),
    }));
  };

  if (!isOpen) return null;


  return (
    <div className="group-modal-overlay">
      <div className="group-modal">
        <div className="group-modal-header">
          <h2>
            {editingGroup ? "✏️ ویرایش کلاس گروهی" : "🏢 ایجاد کلاس گروهی"}
          </h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="group-form">
          {/* تاریخ و زمان */}
          <div className="form-row">
            <div className="form-group">
              <label>تاریخ *</label>
              <p>{moment(trueDate).format("jYYYY/jMM/jDD")}</p>
            </div>

            <div className="form-group">
              <label>ساعت شروع *</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
                className={formErrors.startTime ? "input-error" : ""}
                required
              />
              {formErrors.startTime && (
                <div className="error-message">{formErrors.startTime}</div>
              )}
            </div>

            <div className="form-group">
              <label>مدت (دقیقه) *</label>
              <select
                value={formData.duration}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration: parseInt(e.target.value),
                  })
                }
              >
                <option value={30}>30 دقیقه</option>
                <option value={45}>45 دقیقه</option>
                <option value={60}>60 دقیقه</option>
                <option value={90}>90 دقیقه</option>
                <option value={120}>120 دقیقه</option>
              </select>
            </div>
          </div>

          {/* درمانگرها - با سرچ */}
          <div className="form-group">
            <label>درمانگرها *</label>
            <div className="search-container" ref={therapistListRef}>
              <input
                type="text"
                placeholder="جستجوی درمانگر..."
                value={therapistSearch}
                onChange={(e) => {
                  setTherapistSearch(e.target.value);
                  setShowTherapistList(true);
                }}
                onFocus={() => setShowTherapistList(true)}
                className="search-input"
              />

              {showTherapistList && filteredTherapists.length > 0 && (
                <div className="search-results">
                  {filteredTherapists.map((therapist) => (
                    <div
                      key={therapist._id}
                      className="search-result-item"
                      onClick={() => addTherapist(therapist)}
                    >
                      <div className="result-name">
                        {therapist.firstName} {therapist.lastName}
                      </div>
                      <div className="result-details">
                        <small>
                          {therapist.role === "OT"
                            ? "کاردرمانگر"
                            : therapist.role === "SLP"
                            ? "گفتاردرمانگر"
                            : therapist.role === "PSY"
                            ? "روانشناس"
                            : therapist.role === "PT"
                            ? "فیزیوتراپیست"
                            : "درمانگر"}
                        </small>
                        <small>{therapist.phone}</small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* لیست درمانگرهای انتخاب شده */}
            {/* {formData.therapists.length > 0 && (
              <div className="selected-items">
                <div className="selected-header">
                  <span>
                    درمانگرهای انتخاب شده ({formData.therapists.length})
                  </span>
                </div>
                <div className="selected-list">
                  {formData.therapists.map((therapist) => (
                    <div key={therapist._id} className="selected-item">
                      <div className="selected-item-content">
                        <span className="item-name">
                          {therapist.firstName} {therapist.lastName}
                        </span>
                        <div className="percentage-section">
                          <label className="add-percent" htmlFor={`percent-${therapist._id}`}>
                            درصد سهم:
                          </label>
                          <input
                            id={`percent-${therapist._id}`}
                            className={`add-percent-input ${totalPercentage > 100 ? 'input-error' : ''}`}
                            type="number"
                            min="0"
                            max="100"
                            value={therapistPercentages[therapist._id] || ""}
                            onChange={(e) => handleTherapistPercentageChange(therapist._id, e.target.value)}
                            onBlur={(e) => {
                              const value = parseInt(e.target.value) || 0;
                              if (value > 100) {
                                handleTherapistPercentageChange(therapist._id, 100);
                              } else if (value < 0) {
                                handleTherapistPercentageChange(therapist._id, 0);
                              }
                            }}
                          />
                          <span className="percent-sign">%</span>
                        </div>
                        {formErrors.therapistPercentages && (
  <div className="error-message">
    {formErrors.therapistPercentages}
  </div>
)}
                      </div>
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => removeTherapist(therapist._id)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  
                  {formData.therapists.length > 0 && (
                    <div className={`percentages-summary ${
                      totalPercentage > 100 ? 'error' : 
                      (100 - totalPercentage < 0 ? 'warning' : 'success')
                    }`}>
                      <div className="percent-breakdown">
                        <span>درصد کلینیک: {100 - totalPercentage}%</span>
                        <span>مجموع درصد درمانگران: {totalPercentage}%</span>
                      </div>
                      {totalPercentage > 100 && (
                        <div className="percent-error-message">
                          ❌ مجموع درصد درمانگران نمی‌تواند بیشتر از ۱۰۰٪ باشد
                        </div>
                      )}
                      {(100 - totalPercentage < 0) && (
                        <div className="percent-warning-message">
                          ⚠️ درصد کلینیک نمی‌تواند منفی باشد
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
            {formErrors.therapists && (
              <div className="error-message">{formErrors.therapists}</div>
            )} */}
            {formData.therapists.length > 0 && (
  <div className="selected-items">
    <div className="selected-header">
      <span>درمانگر انتخاب شده</span>
    </div>

    <div className="selected-list">
      {formData.therapists.map((therapist) => (
        <div key={therapist._id} className="selected-item">
          <div className="selected-item-content">
            <span className="item-name">
              {therapist.firstName} {therapist.lastName}
            </span>
          </div>

          <button
            type="button"
            className="remove-btn"
            onClick={() => removeTherapist(therapist._id)}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  </div>
)}

{formErrors.therapists && (
  <div className="error-message">{formErrors.therapists}</div>
)}

          </div>

          {/* بیماران - با سرچ */}
          <div className="form-group">
            <label>بیماران *</label>
            <div className="search-container" ref={patientListRef}>
              <input
                type="text"
                placeholder="جستجوی بیمار..."
                value={patientSearch}
                onChange={(e) => {
                  setPatientSearch(e.target.value);
                  setShowPatientList(true);
                }}
                onFocus={() => setShowPatientList(true)}
                className="search-input"
              />

              {showPatientList && filteredPatients.length > 0 && (
                <div className="search-results">
                  {filteredPatients.map((patient) => (
                    <div
                      key={patient._id}
                      className="search-result-item"
                      onClick={() => addPatient(patient)}
                    >
                      <div className="result-name">
                        {patient.firstName} {patient.lastName}
                      </div>
                      <div className="result-details">
                        <small>{patient.age} ساله</small>
                        <small>{patient.phone}</small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* لیست بیمارهای انتخاب شده */}
            {formData.patients.length > 0 && (
              <div className="selected-items">
                <div className="selected-header">
                  <span>بیماران انتخاب شده ({formData.patients.length})</span>
                </div>
                <div className="selected-list">
                  {formData.patients.map((patient) => (
                    <div key={patient._id} className="selected-item">
                      <span className="item-name">
                        {patient.firstName} {patient.lastName}
                      </span>
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => removePatient(patient._id)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {formErrors.patients && (
              <div className="error-message">{formErrors.patients}</div>
            )}
          </div>

          {/* هزینه و اتاق */}
          <div className="form-row">
            <div className="form-group">
              <label>هزینه هر بیمار (تومان) *</label>
              <input
                type="number"
                placeholder="50000"
                value={formData.onePatientFee}
                onChange={(e) =>
                  setFormData({ ...formData, onePatientFee: e.target.value })
                }
                className={formErrors.onePatientFee ? "input-error" : ""}
                required
                min="0"
              />
              {formErrors.onePatientFee && (
                <div className="error-message">{formErrors.onePatientFee}</div>
              )}
              {formData.onePatientFee && formData.patients.length > 0 && (
                <div className="fee-summary">
                  <div className="fee-total">
                    <strong>مجموع کل:</strong>
                    <span>
                      {" "}
                      {parseInt((formData.onePatientFee) *
                        formData.patients.length).toLocaleString()}{" "}
                      تومان
                    </span>
                  </div>
                  <div className="fee-breakdown">
                    ({formData.patients.length} بیمار × {formData.onePatientFee}{" "}
                    تومان)
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>اتاق / سالن</label>
              <input
                type="text"
                placeholder="سالن ۱"
                value={formData.room}
                onChange={(e) =>
                  setFormData({ ...formData, room: e.target.value })
                }
              />
            </div>
          </div>

          {/* دسته‌بندی */}
          <div className="form-group">
            <label>دسته‌بندی</label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
            >
              <option value="therapy">درمان گروهی</option>
              <option value="workshop">کارگاه آموزشی</option>
              <option value="support_group">گروه حمایتی</option>
              <option value="yoga">یوگا</option>
              <option value="meditation">مدیتیشن</option>
              <option value="other">سایر</option>
            </select>
          </div>

          {/* یادداشت */}
          <div className="form-group">
            <label>یادداشت‌ها</label>
            <textarea
              placeholder="یادداشت‌های اضافی..."
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows="2"
            />
          </div>

          {/* خلاصه کلاس */}
          {(formData.therapists.length > 0 || formData.patients.length > 0) && (
            <div className="session-summary">
              <h4>📋 خلاصه کلاس</h4>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="summary-label">درمانگرها:</span>
                  <span className="summary-value">
                    {formData.therapists.length} نفر
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">بیماران:</span>
                  <span className="summary-value">
                    {formData.patients.length} نفر
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">مدت زمان:</span>
                  <span className="summary-value">
                    {formData.duration} دقیقه
                  </span>
                </div>
                {formData.onePatientFee && (
                  <div className="summary-item total">
                    <span className="summary-label">درآمد کل:</span>
                    <span className="summary-value">
                      {(
                        formData.patients.length *
                        parseInt(formData.onePatientFee)
                      ).toLocaleString()}{" "}
                      تومان
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* نمایش خطاهای کلی */}
          {formErrors.general && (
            <div className="general-error-message">
              {formErrors.general}
            </div>
          )}

          {/* دکمه‌ها */}
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              لغو
            </button>
            <button
              type="submit"
              className="submit-btn"
//          
            >
              {editingGroup ? "ذخیره تغییرات" : "ایجاد کلاس گروهی"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}