import { useState, useEffect } from "react";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import Swal from "sweetalert2";
import { useCreateNote, useUpdateNote } from "../../hooks/notes";

const NoteModal = ({ isOpen, onClose, noteData = null, date }) => {
  const [form, setForm] = useState({
    startDate: null,
    endDate: null,
    text: "",
  });


  const { mutateAsync: createNote, isLoading: isCreating } = useCreateNote();
  const { mutateAsync: updateNote, isLoading: isUpdating } = useUpdateNote();
  const isLoading = isCreating || isUpdating;
  const isEditing = !!noteData;

  // Reset form when modal opens or noteData changes
  useEffect(() => {
    if (isOpen) {
      if (noteData) {
        setForm({
          startDate: new Date(noteData.startDate),
          endDate: new Date(noteData.endDate),
          text: noteData.text || "",
        });
      } else {
        setForm({
          startDate:date ?? null,
          endDate:date ?? null,
          text: "",
        });
      }
    }
  }, [isOpen, noteData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { startDate, endDate, text } = form;
    if (!startDate || !endDate || !text.trim()) {
      return Swal.fire("خطا", "لطفا تمامی فیلدها را پر کنید", "error");
    }

    const payload = {
      startDate,
      endDate,
      text: text.trim(),
    };

    try {
      if (isEditing) {
        await updateNote({ id: noteData._id, ...payload });
      } else {
        await createNote(payload);
      }
      Swal.fire("موفق", `یادداشت ${isEditing ? "ویرایش" : "ثبت"} شد`, "success");
  
      onClose();
    } catch (error) {
      Swal.fire("خطا", "عملیات ناموفق بود، لطفاً دوباره تلاش کنید", "error");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{isEditing ? "ویرایش یادداشت" : "افزودن یادداشت جدید"}</h2>
        <form onSubmit={handleSubmit}>
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
            <label>متن یادداشت:</label>
            <textarea
              value={form.text}
              onChange={(e) => setForm({ ...form, text: e.target.value })}
              rows="5"
              required
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

export default NoteModal;