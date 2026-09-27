import { useState, useEffect } from "react";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import Swal from "sweetalert2";
import { useCreateLeavePA, useUpdateLeavePA } from "../../hooks/leaves-patients";
import { useListPatients} from "../../hooks/patient";

const LeaveModal = ({ isOpen, onClose, leaveData = null ,date}) => {
  const [form, setForm] = useState({
    patientId: "",
    startDate: null,
    endDate: null,
    reason: "",
  });
  const [patientSearch, setPatientSearch] = useState("");

  const { data: patients, isLoading: patientsLoading } = useListPatients();
  const { mutateAsync: createLeave, isPending: isCreating } = useCreateLeavePA();
  const { mutateAsync: updateLeave, isPending: isUpdating } = useUpdateLeavePA();


  const isLoading = isCreating || isUpdating;
  const isEditing = !!leaveData;

  // Reset form when modal opens or leaveData changes
  useEffect(() => {
    if (isOpen) {
      if (leaveData) {
        setForm({
          patientId: leaveData.patientId?._id || "",
          startDate: new Date(leaveData.startDate),
          endDate: new Date(leaveData.endDate),
          reason: leaveData.reason || "",
        });
      } else {
        setForm({
          patientId: "",
          startDate: date??null,
          endDate:date?? null,
          reason: "",
        });
      }
      setPatientSearch("");
    }
  }, [isOpen, leaveData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { patientId, startDate, endDate, reason } = form;
    if (!patientId || !startDate || !endDate) {
      return Swal.fire("خطا", "لطفاً مراجع و تاریخ‌های شروع و پایان را انتخاب کنید", "error");
    }

    const payload = {
      patientId,
      startDate,
      endDate,
      reason: reason.trim() || "",
    };

    try {
      if (isEditing) {
        await updateLeave({ id: leaveData._id, ...payload });
      } else {
        await createLeave(payload);
      }
      Swal.fire("موفق", `مرخصی ${isEditing ? "ویرایش" : "ثبت"} شد`, "success");

      onClose();
    } catch (error) {
      Swal.fire("خطا", "عملیات ناموفق بود، لطفاً دوباره تلاش کنید", "error");
    }
  };

  // Filter patients based on search term
  const filteredPatients = Array.isArray(patients)
    ? patients.filter((p) => {
        const fullName = `${p.firstName} ${p.lastName}`;
        return fullName.includes(patientSearch) || p.phone.includes(patientSearch);
      })
    : [];

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{isEditing ? "ویرایش مرخصی" : "ثبت مرخصی جدید"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>جستجو و انتخاب مراجع:</label>
            <input
              type="text"
              placeholder="جستجو با نام یا شماره تلفن..."
              className="patient-search-input"
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              disabled={isLoading}
            />
            {patientsLoading ? (
              <p>در حال بارگذاری لیست مراجعین...</p>
            ) : (
              <select
                value={form.patientId}
                onChange={(e) => setForm({ ...form, patientId: e.target.value })}
                required
                size="5"
                className="patient-select-list"
                disabled={isLoading}
              >
                <option value="" disabled>
                  -- مراجع مورد نظر را انتخاب کنید --
                </option>
                {filteredPatients.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.firstName} {p.lastName} ({p.phone})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="form-group">
            <label>تاریخ شروع:</label>
            <DatePicker
              value={form.startDate}
              onChange={(date) =>
                setForm({ ...form, startDate: date?.toDate() || null })
              }
              calendar={persian}
              locale={persian_fa}
              format="YYYY/MM/DD"
              required
            />
          </div>

          <div className="form-group">
            <label>تاریخ پایان:</label>
            <DatePicker
              value={form.endDate}
              onChange={(date) =>
                setForm({ ...form, endDate: date?.toDate() || null })
              }
              calendar={persian}
              locale={persian_fa}
              format="YYYY/MM/DD"
              required
            />
          </div>

          <div className="form-group">
            <label>دلیل (اختیاری):</label>
            <textarea
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              rows="3"
              disabled={isLoading}
            />
          </div>

          <div className="modal-actions">
            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? "در حال ارسال..." : isEditing ? "بروزرسانی" : "ثبت"}
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={isLoading}
            >
              انصراف
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeaveModal;