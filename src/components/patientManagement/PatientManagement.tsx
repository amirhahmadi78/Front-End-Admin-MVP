import { useState, useEffect } from "react";
import "./PatientManagement.css";


import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import moment from "moment-jalaali";
import Swal from "sweetalert2";



import { useAllNotes, useCreateNote, useDeleteNote, useUpdateNote } from "../../hooks/notes";
import {  useRefetchFindPatient } from "../../hooks/patient";
import { useCreateLeavePA, useDeleteLeavePA,  useRefetchFindeLeavesPatients, useUpdateLeavePA } from "../../hooks/leaves-patients";

const PatientManagement = () => {
  const [activeTab, setActiveTab] = useState("notes"); // "notes" or "leaves"
  const {data:notes, refetch:fetchNotes,isLoading:notesLoading} = useAllNotes()
  const{data:leaves,isLoading:LeavesLoading,refetch:fetchLeaves}=useRefetchFindeLeavesPatients()

  const {data:patients, isLoading:patientLoading,refetch:fetchPatients} = useRefetchFindPatient({})
  const loading = patientLoading||LeavesLoading||notesLoading
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [patientSearch, setPatientSearch] = useState("");
const {mutate:CreateNote}=useCreateNote()
const {mutate:UpdateNote}=useUpdateNote()
const {mutate:DeleteNote}=useDeleteNote()

const {mutate:CreatePatientLeave}=useCreateLeavePA()
const {mutate:UpdatePatientLeave}=useUpdateLeavePA()
const {mutate:DeletePatientLeave}=useDeleteLeavePA()
  // Form states
  const [noteForm, setNoteForm] = useState({
    startDate: "",
    endDate: "",
    text: "",
  });
  const [leaveForm, setLeaveForm] = useState({
    patientId: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  useEffect(() => {
    if (activeTab === "notes") {
      fetchNotes();
    } else {
      fetchLeaves();
      fetchPatients();
    }
  }, [activeTab]);






  const handleOpenModal = (item = null) => {
    if (activeTab === "notes") {
      if (item) {
        setEditingItem(item);
        setNoteForm({
          startDate: new Date(item.startDate),
          endDate: new Date(item.endDate),
          text: item.text,
        });
      } else {
        setEditingItem(null);
        setNoteForm({ startDate: "", endDate: "", text: "" });
      }
    } else {
      if (item) {
        setEditingItem(item);
        setLeaveForm({
          patientId: item.patientId?._id || "",
          startDate: new Date(item.startDate),
          endDate: new Date(item.endDate),
          reason: item.reason || "",
        });
      } else {
        setEditingItem(null);
        setLeaveForm({
          patientId: "",
          startDate: "",
          endDate: "",
          reason: "",
        });
      }
    }
    setPatientSearch("");
    setShowModal(true);
  };

  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    if (!noteForm.startDate || !noteForm.endDate || !noteForm.text) {
      return Swal.fire("خطا", "لطفا تمامی فیلدها را پر کنید", "error");
    }
 
      if (editingItem) {
     const payload={id:editingItem._id, ...noteForm}
        UpdateNote(payload)
      } else {
      
        CreateNote(noteForm)

      }
      setShowModal(false);
  
   
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    if (!leaveForm.patientId || !leaveForm.startDate || !leaveForm.endDate) {
      return Swal.fire("خطا", "لطفا تمامی فیلدهای اجباری را پر کنید", "error");
    }
 
      if (editingItem) {
         UpdatePatientLeave({id:editingItem._id, ...leaveForm});
    
      } else {
         CreatePatientLeave(leaveForm);
     
      }
      setShowModal(false);

   
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "آیا مطمئن هستید؟",
      text: "این عمل قابل بازگشت نیست!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "بله، حذف کن",
      cancelButtonText: "لغو",
    });

    if (result.isConfirmed) {

        if (activeTab === "notes") {
           DeleteNote(id);
        } else {
           DeletePatientLeave(id);
        }

    
    }
  };

  return (
    <div className="patient-management-container">
      <div className="header-tabs">
        <button
          className={`tab-btn ${activeTab === "notes" ? "active" : ""}`}
          onClick={() => setActiveTab("notes")}
        >
          یادداشت‌ها
        </button>
        <button
          className={`tab-btn ${activeTab === "leaves" ? "active" : ""}`}
          onClick={() => setActiveTab("leaves")}
        >
          مرخصی مراجعین
        </button>
      </div>

      <div className="action-header">
        <h1>{activeTab === "notes" ? "مدیریت یادداشت‌ها" : "مدیریت مرخصی مراجعین"}</h1>
        <button className="add-btn" onClick={() => handleOpenModal()}>
          {activeTab === "notes" ? "افزودن یادداشت جدید" : "ثبت مرخصی جدید"}
        </button>
      </div>

      <div className="content-area">
        {loading ? (
          <p className="loading-text">در حال بارگذاری...</p>
        ) : activeTab === "notes" ? (
          <div className="notes-grid">
            {!Array.isArray(notes)||notes.length === 0 ? (
              <p>هیچ یادداشتی یافت نشد.</p>
            ) : (
              notes.map((note) => (
                <div key={note._id} className="note-card">
                  <div className="note-date">
                    از: {moment(note.startDate).format("jYYYY/jMM/jDD")} <br />
                    تا: {moment(note.endDate).format("jYYYY/jMM/jDD")}
                  </div>
                  <div className="note-text">{note.text}</div>
                  <div className="card-actions">
                    <button className="edit-btn" onClick={() => handleOpenModal(note)}>ویرایش</button>
                    <button className="delete-btn2" onClick={() => handleDelete(note._id)}>حذف</button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="leaves-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>نام مراجع</th>
                  <th>تاریخ شروع</th>
                  <th>تاریخ پایان</th>
                  <th>دلیل</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {!Array.isArray(leaves)|| leaves.length === 0 ? (
                  <tr><td colSpan="5">هیچ مرخصی ثبت نشده است.</td></tr>
                ) : (
                  leaves.map((leave) => (
                    <tr key={leave._id}>
                      <td>{leave.patientId?.firstName} {leave.patientId?.lastName}</td>
                      <td>{moment(leave.startDate).format("jYYYY/jMM/jDD")}</td>
                      <td>{moment(leave.endDate).format("jYYYY/jMM/jDD")}</td>
                      <td>{leave.reason || "---"}</td>
                      <td>
                        <button className="edit-btn" onClick={() => handleOpenModal(leave)}>ویرایش</button>
                        <button className="delete-btn" onClick={() => handleDelete(leave._id)}>حذف</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editingItem ? "ویرایش" : "افزودن جدید"}</h2>
            <form onSubmit={activeTab === "notes" ? handleNoteSubmit : handleLeaveSubmit}>
              {activeTab === "leaves" && (
                <div className="form-group">
                  <label>جستجو و انتخاب مراجع:</label>
                  <input
                    type="text"
                    placeholder="جستجو با نام یا شماره تلفن..."
                    className="patient-search-input"
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                  />
                  <select
                    value={leaveForm.patientId}
                    onChange={(e) => setLeaveForm({ ...leaveForm, patientId: e.target.value })}
                    required
                    size="5" // نمایش به صورت لیست برای انتخاب راحت‌تر
                    className="patient-select-list"
                  >
                    <option value="" disabled>-- مراجع مورد نظر را انتخاب کنید --</option>
                    {Array.isArray(patients)&&patients
                      .filter(p => 
                        `${p.firstName} ${p.lastName}`.includes(patientSearch) || 
                        p.phone.includes(patientSearch)
                      )
                      .map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.firstName} {p.lastName} ({p.phone})
                        </option>
                      ))}
                  </select>
                </div>
              )}
              <div className="form-group">
                <label>تاریخ شروع:</label>
                <DatePicker
                  value={activeTab === "notes" ? noteForm.startDate : leaveForm.startDate}
                  onChange={(date) => {
                    if (activeTab === "notes") setNoteForm({ ...noteForm, startDate: date?.toDate() });
                    else setLeaveForm({ ...leaveForm, startDate: date?.toDate() });
                  }}
                  calendar={persian} locale={persian_fa} format="YYYY/MM/DD" required
                />
              </div>
              <div className="form-group">
                <label>تاریخ پایان:</label>
                <DatePicker
                  value={activeTab === "notes" ? noteForm.endDate : leaveForm.endDate}
                  onChange={(date) => {
                    if (activeTab === "notes") setNoteForm({ ...noteForm, endDate: date?.toDate() });
                    else setLeaveForm({ ...leaveForm, endDate: date?.toDate() });
                  }}
                  calendar={persian} locale={persian_fa} format="YYYY/MM/DD" required
                />
              </div>
              {activeTab === "notes" ? (
                <div className="form-group">
                  <label>متن یادداشت:</label>
                  <textarea
                    value={noteForm.text}
                    onChange={(e) => setNoteForm({ ...noteForm, text: e.target.value })}
                    rows="5" required
                  ></textarea>
                </div>
              ) : (
                <div className="form-group">
                  <label>دلیل (اختیاری):</label>
                  <textarea
                    value={leaveForm.reason}
                    onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                    rows="3"
                  ></textarea>
                </div>
              )}
              <div className="modal-actions">
                <button type="submit" className="submit-btn">{editingItem ? "بروزرسانی" : "ثبت"}</button>
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>انصراف</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientManagement;

