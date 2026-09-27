// components/AppointmentSummaryModal.jsx
import { useState, useEffect } from "react";
import moment from "moment-jalaali";
import "./AppointmentSummaryModal.css";
import { useAppDetails } from "../../../hooks/appointment";

export default function AppointmentSummaryModal({ appointmentId, isOpen, onClose }) {
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(false);

  // استخراج _id از appointmentId (اگر شئ است)
  const idToFetch = appointmentId?._id || appointmentId;

  const { data, isLoading } = useAppDetails(idToFetch);

  useEffect(() => {
    if (isOpen && data?._id) {
      setAppointment(data);
    } else if (isOpen && appointmentId && !data?._id) {
      // اگر داده‌ای نیامد ولی خود appointmentId شئ کامل است
      setAppointment(appointmentId);
    }
  }, [isOpen, appointmentId, data]);

  if (!isOpen) return null;

  const getStatusText = (status) => {
    const statusMap = {
      'scheduled': 'برنامه‌ریزی شده',
      'completed': 'تکمیل شده', 
      'canceled': 'لغو شده',
      'completed-paid': 'پرداخت شده',
      'completed-notpaid': 'ویزیت شده - پرداخت نشده'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'scheduled': 'status-scheduled',
      'completed': 'status-completed',
      'canceled': 'status-canceled',
      'completed-paid': 'status-paid',
      'completed-notpaid': 'status-notpaid'
    };
    return colorMap[status] || 'status-default';
  };

  const getPaymentText = (payment) => {
    const paymentMap = {
      'card': 'کارت‌خوان',
      'cash': 'نقدی',
      'wallet': 'کیف پول',
      'transfer': 'کارت به کارت',
      'bimeh': 'بیمه'
    };
    return paymentMap[payment] || payment;
  };

  // تابع برای بررسی پرداخت یک بیمار در جلسه گروهی
  const isPatientPaid = (patientId) => {
    if (!appointment?.Paids) return false;
    return appointment.Paids.some(p => p.id?.toString() === patientId?.toString());
  };

  // تابع برای گرفتن جزئیات پرداخت یک بیمار
  const getPatientPaymentDetail = (patientId) => {
    if (!appointment?.Paids) return null;
    return appointment.Paids.find(p => p.id?.toString() === patientId?.toString());
  };

  return (
    <div className="appointment-summary-overlay">
      <div className="appointment-summary-modal">
        {/* هدر */}
        <div className="summary-header">
          <h3>مشاهده نوبت</h3>
          <button className="summary-close" onClick={() => onClose(false)}>
            ×
          </button>
        </div>

        {/* محتوا */}
        <div className="summary-content">
          {isLoading ? (
            <div className="summary-loading">
              <div className="loading-spinner"></div>
              <p>در حال بارگذاری اطلاعات نوبت...</p>
            </div>
          ) : appointment ? (
            <div className="appointment-details">
              {/* کارت اصلی اطلاعات */}
              <div className="detail-card">
                <div className="detail-row">
                  <span className="detail-label">نوع جلسه:</span>
                  <span className="detail-value">
                    {appointment.sessionType === "group" ? "گروهی" : "انفرادی"}
                  </span>
                </div>

                {appointment.sessionType === "group" ? (
                  // نمایش اطلاعات گروهی
                  <>
                    <div className="detail-row">
                      <span className="detail-label">درمانگران:</span>
                      <div className="detail-value">
                        {appointment.groupSession?.therapists?.map((t, idx) => (
                          <div key={t._id || idx}>
                            {t.therapistId?.firstName} {t.therapistId?.lastName} ({t.percentage}%) - سهم: {t.therapistShare?.toLocaleString()} تومان
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="detail-row">
                      <span className="detail-label">تعداد بیماران:</span>
                      <span className="detail-value">{appointment.groupSession?.patients?.length || 0} نفر</span>
                    </div>

                    <div className="detail-row">
                      <span className="detail-label">مبلغ هر نفر:</span>
                      <span className="detail-value">{appointment.groupSession?.onePatientFee?.toLocaleString()} تومان</span>
                    </div>

                    <div className="detail-row">
                      <span className="detail-label">کل دریافتی از بیماران:</span>
                      <span className="detail-value">{appointment.patientFee?.toLocaleString()} تومان</span>
                    </div>

                    <div className="detail-row">
                      <span className="detail-label">سهم کلینیک:</span>
                      <span className="detail-value">{appointment.clinicShare?.toLocaleString()} تومان</span>
                    </div>

                    <div className="detail-row">
                      <span className="detail-label">سهم درمانگران:</span>
                      <span className="detail-value">{appointment.therapistShare?.toLocaleString()} تومان</span>
                    </div>
                  </>
                ) : (
                  // نمایش اطلاعات انفرادی (همان قبلی)
                  <>
                    <div className="detail-row">
                      <span className="detail-label">درمانگر:</span>
                      <span className="detail-value">{appointment.therapistName}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">مراجع:</span>
                      <span className="detail-value">{appointment.patientName}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">هزینه ویزیت:</span>
                      <span className="detail-value">{appointment.patientFee?.toLocaleString()} تومان</span>
                    </div>
                  </>
                )}

                {/* اطلاعات مشترک */}
                <div className="detail-row">
                  <span className="detail-label">تاریخ:</span>
                  <span className="detail-value">
                    {moment(appointment.start).format("jYYYY/jMM/jDD")}
                  </span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">ساعت:</span>
                  <span className="detail-value">
                    {moment(appointment.start).format("HH:mm")} - {moment(appointment.end).format("HH:mm")}
                  </span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">مدت:</span>
                  <span className="detail-value">{appointment.duration} دقیقه</span>
                </div>
              </div>

              {/* کارت وضعیت */}
              <div className="detail-card">
                <div className="detail-row">
                  <span className="detail-label">وضعیت کلینیک:</span>
                  <span className={`status-badge ${getStatusColor(appointment.status_clinic)}`}>
                    {getStatusText(appointment.status_clinic)}
                  </span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">وضعیت درمانگر:</span>
                  <span className={`status-badge ${getStatusColor(appointment.status_therapist)}`}>
                    {getStatusText(appointment.status_therapist)}
                  </span>
                </div>

                {/* برای جلسات گروهی وضعیت پرداخت هر بیمار را نمایش بده */}
                {appointment.sessionType === "group" && appointment.groupSession?.patients?.length > 0 && (
                  <div className="detail-row">
                    <span className="detail-label">پرداخت بیماران:</span>
                    <div className="detail-value">
                      {appointment.groupSession.patients.map((patient, idx) => {
                        const paid = isPatientPaid(patient._id || patient);
                        const payDetail = getPatientPaymentDetail(patient._id || patient);
                        return (
                          <div key={patient._id || idx} style={{ marginTop: '4px' }}>
                            <span>
                              {patient.firstName} {patient.lastName}:
                            </span>
                            <span style={{ marginRight: '8px', fontWeight: 'bold', color: paid ? 'green' : 'red' }}>
                              {paid ? 'پرداخت شده' : 'پرداخت نشده'}
                            </span>
                            {paid && payDetail && (
                              <span style={{ marginRight: '8px', fontSize: '0.9em' }}>
                                ({getPaymentText(payDetail.payment)})
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {!appointment.sessionType === "group" && appointment.payment && (
                  <div className="detail-row">
                    <span className="detail-label">روش پرداخت:</span>
                    <span className="detail-value">
                      {appointment.status_clinic === "completed-paid" ? getPaymentText(appointment.payment) :
                        appointment.status_clinic === "completed-notpaid" ? "عدم پرداخت" :
                        appointment.status_clinic === "bimeh" ? "بیمه‌ای" : "نامشخص"}
                    </span>
                  </div>
                )}
              </div>

              {/* کارت مالی (فقط برای انفرادی یا اطلاعات اضافی) */}
              {(appointment.patientFee || appointment.paidAt) && appointment.sessionType !== "group" && (
                <div className="detail-card">
                  <h4>اطلاعات مالی</h4>
                  {appointment.patientFee && (
                    <div className="detail-row">
                      <span className="detail-label">هزینه ویزیت:</span>
                      <span className="detail-value fee-amount">
                        {appointment.patientFee.toLocaleString()} تومان
                      </span>
                    </div>
                  )}
                  {appointment.paidAt && appointment.paidAt !== "0" && (
                    <div className="detail-row">
                      <span className="detail-label">تاریخ پرداخت:</span>
                      <span className="detail-value">
                        {moment(appointment.paidAt, "jYYYY/jMM/jDD-HH:mm").format("jYYYY/jMM/jDD - HH:mm")}
                      </span>
                    </div>
                  )}
                  {appointment.pay_details && appointment.pay_details !== "0" && (
                    <div className="detail-row">
                      <span className="detail-label">جزئیات پرداخت:</span>
                      <span className="detail-value">{appointment.pay_details}</span>
                    </div>
                  )}
                </div>
              )}

              {/* اتاق و توضیحات */}
              <div className="detail-card">
                {appointment.room && (
                  <div className="detail-row">
                    <span className="detail-label">اتاق:</span>
                    <span className="detail-value">اتاق {appointment.room}</span>
                  </div>
                )}
                {appointment.notes && (
                  <div className="detail-row">
                    <span className="detail-label">یادداشت‌ها:</span>
                    <span className="detail-value notes-text">{appointment.notes}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="summary-error">
              <p>❌ اطلاعات نوبت یافت نشد</p>
            </div>
          )}
        </div>

        {/* فوتر */}
        <div className="summary-footer">
          <button className="summary-btn-close" onClick={() => onClose(false)}>
            بستن
          </button>
        </div>
      </div>
    </div>
  );
}