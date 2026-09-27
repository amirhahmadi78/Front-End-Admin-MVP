import "./AppointmentSummaryModal.css";

function formatTime(date) {
  return new Date(date).toLocaleTimeString("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("fa-IR");
}

function statusLabel(status) {
  const map = {
    scheduled: "برنامه‌ریزی‌شده",
    "completed-notpaid": "انجام‌شده (تسویه نشده)",
    "completed-paid": "انجام‌شده (تسویه شده)",
    canceled: "لغو شده",
    bimeh: "بیمه",
    absent: "غیبت",
    break: "وقفه",
  };
  return map[status] || "نامشخص";
}

export default function AppointmentSummaryModal({ appointment, onClose }) {
if (
  !appointment ||
  typeof appointment !== 'object' ||
  Object.keys(appointment).length === 0
) {
  return null;
}


  const {
    sessionType,
    start,
    end,
    duration,
    room,
    status_clinic,
    notes,
    patientFee,
    therapistName,
    patientName,
    groupSession,
    description,
    Paids
  } = appointment;




    let clinicPercent=0
//   if (appointment.groupSession.therapists.length>0){
//  clinicPercent =NotData.reduce((sum,item)=>sum+(item.patientFee||0),0)
//   }else clinicPercent=0
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3>
            {sessionType === "group" ? "جلسه گروهی" : "جلسه فردی"}
          </h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="row">
            <span>تاریخ:</span>
            <strong>{formatDate(start)}</strong>
          </div>

          <div className="row">
            <span>زمان:</span>
            <strong>
              {formatTime(start)} – {formatTime(end)} ({duration} دقیقه)
            </strong>
          </div>

          <div className="row">
            <span>اتاق:</span>
            <strong>{room || "-"}</strong>
          </div>

          <div className="row">
            <span>وضعیت:</span>
            <strong>{statusLabel(status_clinic)}</strong>
          </div>

          {sessionType === "individual" && (
            <>
              <div className="divider" />
              <div className="row">
                <span>تراپیست:</span>
                <strong>{therapistName}</strong>
              </div>
              <div className="row">
                <span>مراجع:</span>
                <strong>{patientName}</strong>
              </div>
            </>
          )}

          {sessionType === "group" && (
            <>
              <div className="divider" />

              <div className="group-section">
                <div className="group-title">تراپیست‌ها</div>
                {groupSession.therapists?.map((t, index) => (
                  
                  <div key={index} className="row small">
                    <label>{t.therapistId?.firstName+" "+t.therapistId?.lastName+"  "}</label>
                    <label>درآمد: {t.therapistShare.toLocaleString()} تومان</label>
                    <label>درصد:  درصد درمانگر</label>
                  </div>
                ))
                }
              </div>

              <div className="row">
                <span>تعداد مراجعان:</span>
                <strong>{groupSession.patients?.length}</strong>
              </div>

              <div className="row">
                <span>هزینه هر مراجع:</span>
                <strong>{groupSession.onePatientFee?.toLocaleString()} تومان</strong>
              </div>
            </>
          )}

          <div className="divider" />

          <div className="row">
            <span>مبلغ کل:</span>
            <strong>{patientFee.toLocaleString()} تومان</strong>
          </div>
                <div className="row">
            <span>درصد نهایی کلینیک:</span>
            <strong>{100*(appointment.clinicShare/appointment.patientFee)} %</strong>
          </div>

            <div className="row">
            <span>سهم کلینیک:</span>
            <strong>{appointment.clinicShare} تومان</strong>
          </div>
      
          {notes && (
            <div className="notes">
              <span>یادداشت:</span>
              <p>{notes}</p>
            </div>
          )}

          {sessionType === "group" && (
            <div className="notes">
              <span>مراجعین:</span>
          {
          groupSession.patients.map(t=>(
<p key={t.firstName} >{t.firstName+" "+t.lastName+(Paids?.map(p=>
  p.id===t._id?" (پرداخت شده)":" (پرداخت نشده)"
 ))}</p>

          ))}
              
            </div>
          )}
  
        </div>
      </div>
    </div>
  );
}
