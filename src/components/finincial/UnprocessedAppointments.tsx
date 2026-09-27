import { useState, useEffect } from "react";
import moment from "moment-jalaali";
import "./unprocessedFinance.css";
// import {  UpdateAppointmentFinance } from "../../services/finance";

import Pagination from "./Pagination";
import { useUnproccessedApp } from "../../hooks/finance";

const clinicStatus={
    "scheduled":"برنامه ریزی شده",
    "completed-notpaid":" بدون پرداخت انجام شده",
    "completed-paid":"انجام شده و پرداخت شده" ,
    "canceled":"کنسل شده" ,
    "bimeh":"انجام شده بیمه ای"
}

const therapistStatus={
    "scheduled":"برنامه ریزی شده",
    "completed":"ویزیت شده",
    "absent":"غیبت"
}




const UnprocessedAppointments = () => {
 
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

const {data:UnproccessData, isLoading:UnproccessLoading}=useUnproccessedApp({
  page:currentPage||1,
  limit:20
})
 const sessions = UnproccessData?.appointments||[]
  const pagination =UnproccessData?.pagination||null





  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleEdit = (session) => {
    setEditing(session);
  };

  const handleSave = async () => {
    if (!editing) return;
    return
    try {
      setUpdateLoading(true);
      const res = await UpdateAppointmentFinance(editing._id, {
        clinicPaid: editing.clinicPaid,
        therapistPaid: editing.therapistPaid,
      });
    
      setEditing(null);
   
    } catch (err) {
      alert("خطا در بروزرسانی اطلاعات");
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <div className="unprocessed-container">
      <h3>جلسات درمانی محاسبه‌نشده</h3>
      <p className="desc">
        در این بخش، جلساتی نمایش داده می‌شوند که وضعیت مالی کلینیک و درمانگر آن‌ها تناقض دارند.
      </p>

      {loading ? (
        <p className="loading">در حال دریافت اطلاعات...</p>
      ) : sessions.length === 0 ? (
        <p className="no-data">همه جلسات هماهنگ هستند ✅</p>
      ) : (
        <table className="unprocessed-table">
          <thead>
            <tr>
              <th>تاریخ</th>
              <th>ساعت (طول جلسه)</th>
              <th>مراجع</th>
              <th>درمانگر</th>
              <th>هزینه جلسه</th>
              <th>وضعیت کلینیک</th>
              <th>وضعیت درمانگر</th>
              <th>وضعیت</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s._id}>
                <td>{moment(s.start).format("jYYYY/jMM/jDD")}</td>
                <td>{moment(s.start).format("HH:mm")} ({s.duration} دقیقه)</td>
                <td>{s.patientName}</td>
                <td>{s.therapistName}</td>
                <td>{s.patientFee} تومان</td>
                <td className={s.status_clinic=="completed-notpaid" ? "green" :
                     s.status_clinic=="completed-paid"? "green":
                     s.status_clinic=="bimeh"?"green":"red"
                     }>
                  {clinicStatus[s.status_clinic]}
                </td>
                <td className={s.status_therapist=="completed" ? "green" : "red"}>
                  {therapistStatus[s.status_therapist] || "نامشخص"}

                </td>
                <td>
                  {s.status_clinic === s.status_therapist ? (
                    <span className="ok-status">هماهنگ ✅</span>
                  ) : (
                    <span className="warn-status">ناهماهنگ ⚠️</span>
                  )}
                </td>
                <td>
                  <button
                    className="edit-btn"
                    onClick={() => handleEdit(s)}
                  >
                    ویرایش
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* مودال ویرایش */}
      {editing && (
        <div className="finance-modal">
          <div className="finance-modal-content">
            <h4>ویرایش جلسه</h4>
            <p>
              <strong>درمانگر:</strong> {editing.therapistName}
              <br />
              <strong>مراجع:</strong> {editing.patientName}
              <br />
              <strong>تاریخ:</strong>{" "}
              {moment(editing.date).format("jYYYY/jMM/jDD")}
            </p>

            <div className="toggle-fields">
              <label>
                <input
                  type="checkbox"
                  checked={editing.status_clinic}
                  onChange={(e) =>
                    setEditing({ ...editing, status_clinic: e.target.checked })
                  }
                />
                پرداخت کلینیک
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={editing.status_therapist}
                  onChange={(e) =>
                    setEditing({ ...editing, status_therapist: e.target.checked })
                  }
                />
                پرداخت درمانگر
              </label>
            </div>

            <div className="modal-actions">
              <button
                className="save-btn"
                onClick={handleSave}
                disabled={updateLoading}
              >
                {updateLoading ? "در حال ذخیره..." : "ذخیره تغییرات"}
              </button>
              <button
                className="cancel-btn"
                onClick={() => setEditing(null)}
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalRecords={pagination.totalRecords}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default UnprocessedAppointments;
