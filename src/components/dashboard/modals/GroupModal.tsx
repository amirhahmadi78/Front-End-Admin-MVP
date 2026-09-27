import  { useState, useEffect, useMemo } from "react";
import moment from "moment-jalaali";

import Swal from "sweetalert2";



import { useDeleteAppointment } from "../../../hooks/appointment";
import { useChangeGroupStatus, useGroupPayment, useRemoveGroupPayment } from "../../../hooks/groupAppointment";

export default function GroupModal({
  isOpen,
  onClose,
  appointment,
  setShowModal,
  allAppointments,
  setAllAppointments,
  onEdit,
  patientlist
}) {
 


//  const {data:patientlist,isLoading:patientListLoading,error:patientListError}=useFindPatient({})
 const{mutate:deletAppointment}=useDeleteAppointment()
  const{mutate:groupPayment}=useGroupPayment()
  const{mutate:removeGroupPayment}=useRemoveGroupPayment()
  const [loading, setLoading] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(null);
  const [paymentData, setPaymentData] = useState({
    paymentMethod: "card",
    amount: appointment.groupSession?.onePatientFee || 0,
    paidAt: moment().format("jYYYY/jMM/jDD-HH:mm"),
    note: ""
  });
    const {mutate:changeGroupStatus}=useChangeGroupStatus()
  // لیست بیماران این گروه

  
const groupPatients = useMemo(() => {
  // ۱. چک کن که لیست خالی نباشد تا برنامه کرش نکند
  if (!patientlist || !appointment?.groupSession?.patients) return [];

  // ۲. استفاده از return برای خروجی
  return patientlist.filter((patient) => {
    // تبدیل هر دو طرف به رشته (String) برای اطمینان از مقایسه درست
    const patientId = patient._id?.toString();
    return appointment.groupSession.patients.some(
      (id) => id?.toString() === patientId
    );
  });
}, [appointment?.groupSession?.patients, patientlist]);

  // لیست پرداخت‌ها
  const paidPatients = appointment.Paids || [];



  useEffect(() => {
    if (appointment.groupSession?.onePatientFee) {
      setPaymentData(prev => ({
        ...prev,
        amount: appointment.groupSession.onePatientFee
      }));
    }
  }, [appointment]);
 if (!isOpen || !appointment || appointment.sessionType !== "group") return null;


  // وضعیت پرداخت هر بیمار
  const getPatientPaymentStatus = (patientId) => {
    const paidInfo = paidPatients.find(p => p.patientId === patientId || p.id === patientId);
    return {
      isPaid: !!paidInfo,
      paymentMethod: paidInfo?.paymentMethod || paidInfo?.payment || null,
      amount: paidInfo?.amount || appointment.groupSession?.onePatientFee || 0,
      note: paidInfo?.note || "",
      paidAt: paidInfo?.paidAt || "",
      recordId: paidInfo?._id
    };
  };

  // محاسبه جمع پرداخت‌ها
  const calculateTotalPaid = () => {
    return paidPatients.reduce((total, payment) => total + (appointment.groupSession.onePatientFee || 0), 0);
  };

  // ثبت پرداخت جدید
  const handleAddPayment = async (patientId, patientName) => {
    if (!paymentData.paymentMethod) {
      Swal.fire("خطا!", "لطفا روش پرداخت را انتخاب کنید", "warning");
      return;
    }

    setLoading(true);

      const payload = {
        id: appointment._id,
        patientId: patientId,
        payment: paymentData.paymentMethod,
        note: paymentData.note,
      };

   groupPayment(payload)
      setShowModal(false)


       
      
   
  };

  // حذف پرداخت
  const handleRemovePayment = async (patientId, patientName) => {
    try {
      setShowModal(false)
   
      const result = await Swal.fire({
        title: "حذف پرداخت",
        text: `آیا از حذف پرداخت ${patientName} اطمینان دارید؟`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "بله، حذف کن",
        cancelButtonText: "لغو"
      });

      if (result.isConfirmed) {
        const payload = {
          id: appointment._id,
          patientId: patientId
        };

        removeGroupPayment(payload)
      
        
      
            
        

          
      

        


        }
      
    } catch (error) {
      Swal.fire("خطا!", error.response?.data?.message || "خطا در حذف پرداخت", "error");
    }
  };

  const handleStatusChange = async (newStatus) => {
   
     
    changeGroupStatus({appointmentId:appointment._id,status_clinic:newStatus})
      setShowModal(false)
       

 
    
  };

  const getPaymentMethodText = (method) => {
    const methodMap = {
      "card": "💳 کارت‌خوان",
      "transfer": "💸 کارت به کارت",
      "cash": "💰 نقدی",
      "wallet": "👛 کیف پول"
    };
    return methodMap[method] || method;
  };

  const handleDeleteGroup = async () => {
      onClose()
    try {
      const result = await Swal.fire({
        title: "حذف کلاس گروهی",
        text: "آیا از حذف این کلاس گروهی اطمینان دارید؟",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "بله، حذف کن",
        cancelButtonText: "لغو"
      });

      if (result.isConfirmed) {
      deletAppointment(appointment._id)
      
      }
    } catch (error) {
      Swal.fire("خطا!", error.response?.data?.message || "خطا در حذف", "error");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal group-modal" style={{ maxWidth: "900px", maxHeight: "90vh" }}>
        <button className="close-btn" onClick={() => setShowModal(false)}>×</button>

        <h3>🏢 مدیریت کلاس گروهی</h3>
        
        {/* خلاصه اطلاعات */}
        <div className="group-summary">
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
            gap: "15px",
            marginBottom: "20px",
            padding: "15px",
            background: "#f8f9fa",
            borderRadius: "8px"
          }}>
            <div>
              <strong>📅 تاریخ:</strong> {moment(appointment.start).format("jYYYY/jMM/jDD")}
            </div>
            <div>
              <strong>⏰ ساعت:</strong> {moment(appointment.start).format("HH:mm")} - {moment(appointment.end).format("HH:mm")}
            </div>
            <div>
              <strong>👥 تعداد بیماران:</strong> {groupPatients.length||0} نفر
            </div>
            <div>
              <strong>💰 هزینه هر نفر:</strong> {appointment.groupSession?.onePatientFee?.toLocaleString() || 0} تومان
            </div>
            <div>
              <strong>✅ پرداخت شده:</strong> {paidPatients?.length||0}/{groupPatients?.length} نفر
            </div>
            <div>
              <strong>💵 جمع پرداخت‌ها:</strong> {calculateTotalPaid().toLocaleString()} تومان
            </div>
            
            <div style={{ gridColumn: "1 / -1", borderTop: "1px solid #dee2e6", paddingTop: "15px", marginTop: "5px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <strong>🔄 وضعیت کلاس:</strong>
                <select 
                  value={appointment.status_clinic}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  style={{
                    padding: "8px 15px",
                    borderRadius: "6px",
                    border: "2px solid #007bff",
                    background: "white",
                    fontWeight: "500",
                    color: "#007bff",
                    cursor: "pointer",
                    outline: "none"
                  }}
                  disabled={loading}
                >
                  <option value="scheduled">📅 برنامه‌ریزی شده</option>
                  <option value="completed-notpaid">✅ ویزیت شده (بدون پرداخت)</option>
                  <option value="canceled">❌ کنسل شده</option>
                  {appointment.status_clinic === "completed-paid" && (
                    <option value="completed-paid">💰 پرداخت شده</option>
                  )}
                </select>
                
                <span style={{ 
                  fontSize: "13px", 
                  color: "#6c757d",
                  fontStyle: "italic"
                }}>
                  * در صورت پرداخت تمام بیماران، وضعیت به صورت خودکار به "پرداخت شده" تغییر می‌کند.
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* لیست بیماران و پرداخت‌ها */}
        <div style={{ 
          maxHeight: "400px", 
          overflowY: "auto", 
          marginBottom: "20px",
          border: "1px solid #dee2e6",
          borderRadius: "8px",
          padding: "10px"
        }}>
          <h4 style={{ 
            marginBottom: "15px",
            paddingBottom: "10px",
            borderBottom: "2px solid #007bff"
          }}>
            💳 وضعیت پرداخت بیماران
          </h4>
          
          {groupPatients?.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px", color: "#6c757d" }}>
              بیمارانی برای این گروه یافت نشد.
            </div>
          ) : (
            groupPatients?.map((patient) => {
              const paymentStatus = getPatientPaymentStatus(patient._id);
              
              return (
                <div 
                  key={patient._id} 
                  className="patient-card"
                  style={{
                    border: "1px solid #dee2e6",
                    borderRadius: "8px",
                    padding: "15px",
                    marginBottom: "15px",
                    background: paymentStatus.isPaid ? "#f0fff4" : "#fffaf0",
                    transition: "all 0.3s ease"
                  }}
                >
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center",
                    marginBottom: paymentStatus.isPaid ? "10px" : "0"
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <strong style={{ fontSize: "16px" }}>
                          {patient.firstName} {patient.lastName}
                        </strong>
                        {paymentStatus.isPaid && (
                          <span className="badge badge-success">
                            ✅ پرداخت شده
                          </span>
                        )}
                      </div>
                      
                      <div style={{ fontSize: "14px", color: "#666", marginTop: "5px" }}>
                        <div>هزینه: {paymentStatus.amount.toLocaleString()} تومان</div>
                        {paymentStatus.isPaid && paymentStatus.paidAt && (
                          <div style={{ marginTop: "3px" }}>
                            تاریخ پرداخت: {paymentStatus.paidAt}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {paymentStatus.isPaid ? (
                        <>
                          <span style={{ 
                            background: "#28a745", 
                            color: "white", 
                            padding: "5px 15px",
                            borderRadius: "20px",
                            fontSize: "13px",
                            fontWeight: "500"
                          }}>
                            {getPaymentMethodText(paymentStatus.paymentMethod)}
                          </span>
                          <button
                            onClick={() => handleRemovePayment(patient._id, `${patient.firstName} ${patient.lastName}`)}
                            style={{
                              background: "#dc3545",
                              color: "white",
                              border: "none",
                              padding: "6px 12px",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "13px",
                              display: "flex",
                              alignItems: "center",
                              gap: "5px"
                            }}
                          >
                            <span>🗑️</span> حذف
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setShowPaymentForm(patient._id)}
                          style={{
                            background: "#007bff",
                            color: "white",
                            border: "none",
                            padding: "8px 20px",
                            borderRadius: "5px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            fontWeight: "500"
                          }}
                        >
                          <span>💳</span> ثبت پرداخت
                        </button>
                      )}
                    </div>
                  </div>

                  {/* اطلاعات پرداخت */}
                  {paymentStatus.isPaid && paymentStatus.note && (
                    <div style={{ 
                      marginTop: "10px",
                      padding: "10px",
                      background: "#e7f5ff",
                      borderRadius: "6px",
                      fontSize: "14px",
                      borderRight: "3px solid #007bff"
                    }}>
                      <strong>📝 یادداشت:</strong> {paymentStatus.note}
                    </div>
                  )}

                  {/* فرم پرداخت */}
                  {showPaymentForm === patient._id && (
                    <div style={{ 
                      marginTop: "15px",
                      padding: "20px",
                      background: "#f8f9fa",
                      borderRadius: "8px",
                      border: "1px solid #007bff",
                      animation: "fadeIn 0.3s ease"
                    }}>
                      <h5 style={{ 
                        marginTop: 0, 
                        marginBottom: "15px",
                        color: "#007bff"
                      }}>
                        💰 ثبت پرداخت برای {patient.firstName} {patient.lastName}
                      </h5>
                      
                      <div style={{ 
                        display: "grid", 
                        gridTemplateColumns: "1fr 1fr",
                        gap: "15px",
                        marginBottom: "15px"
                      }}>
                        <div>
                          <label>روش پرداخت:</label>
                          <select
                            value={paymentData.paymentMethod}
                            onChange={(e) => setPaymentData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                            style={{ 
                              width: "100%", 
                              padding: "10px", 
                              marginTop: "5px",
                              borderRadius: "5px",
                              border: "1px solid #ced4da"
                            }}
                          >
                            <option value="card">💳 کارت‌خوان</option>
                            <option value="transfer">💸 کارت به کارت</option>
                            <option value="cash">💰 نقدی</option>
                            <option value="wallet"> کیف پول</option>
                            {/* <option value="bimeh">👛 بیمه</option> */}
                          </select>
                           {paymentData.paymentMethod === 'wallet' && (
    <div style={{ marginTop: '5px', fontSize: '14px', color: '#28a745' }}>
      💰 موجودی کیف پول: {patient.wallet?.toLocaleString() || 0} تومان
    </div>
  )}
                        </div>

                       
                     
                      </div>

                      <div style={{ marginBottom: "20px" }}>
                        <label>یادداشت (اختیاری):</label>
                        <textarea
                          value={paymentData.note}
                          onChange={(e) => setPaymentData(prev => ({ ...prev, note: e.target.value }))}
                          placeholder="شماره فیش، شماره تراکنش، توضیحات خاص..."
                          style={{ 
                            width: "100%", 
                            padding: "10px", 
                            marginTop: "5px",
                            minHeight: "80px",
                            resize: "vertical",
                            borderRadius: "5px",
                            border: "1px solid #ced4da",
                            fontFamily: "inherit"
                          }}
                        />
                      </div>

                      <div style={{ display: "flex", gap: "10px" }}>
                        <button
                          onClick={() => handleAddPayment(patient._id, `${patient.firstName} ${patient.lastName}`)}
                          style={{
                            background: "#28a745",
                            color: "white",
                            border: "none",
                            padding: "10px 25px",
                            borderRadius: "5px",
                            cursor: "pointer",
                            flex: 1,
                            fontSize: "14px",
                            fontWeight: "500",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px"
                          }}
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm"></span>
                              در حال ثبت...
                            </>
                          ) : (
                            <>
                              <span>💾</span> ثبت پرداخت
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setShowPaymentForm(null);
                            setPaymentData({
                              paymentMethod: "card",
                              amount: appointment.groupSession?.onePatientFee || 0,
                              paidAt: moment().format("jYYYY/jMM/jDD-HH:mm"),
                              note: ""
                            });
                          }}
                          style={{
                            background: "#6c757d",
                            color: "white",
                            border: "none",
                            padding: "10px 25px",
                            borderRadius: "5px",
                            cursor: "pointer",
                            fontSize: "14px"
                          }}
                        >
                          لغو
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* خلاصه نهایی */}
        <div style={{ 
          background: "#e3f2fd", 
          padding: "15px", 
          borderRadius: "8px",
          marginBottom: "20px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong>💰 جمع کل قابل پرداخت:</strong> 
              <span style={{ marginRight: "10px" }}>
                {(appointment.groupSession?.onePatientFee * groupPatients?.length).toLocaleString()} تومان
              </span>
            </div>
            <div>
              <strong>✅ جمع پرداخت‌ها:</strong> 
              <span style={{ color: "#28a745", marginRight: "10px" }}>
                {calculateTotalPaid().toLocaleString()} تومان
              </span>
            </div>
            <div>
              <strong>⚖️ مانده:</strong> 
              <span style={{ color: calculateTotalPaid() < (appointment?.groupSession?.onePatientFee * groupPatients?.length) ? "#dc3545" : "#28a745" }}>
                {((appointment.groupSession?.onePatientFee * groupPatients?.length) - calculateTotalPaid()).toLocaleString()} تومان
              </span>
            </div>
          </div>
        </div>

        {/* دکمه‌های پایین */}
        <div className="modal-actions" style={{ 
          display: "flex", 
          justifyContent: "space-between",
          paddingTop: "15px",
          borderTop: "2px solid #dee2e6"
        }}>
          <div style={{ display: "flex", gap: "10px" }}>
            <button 
              onClick={() => {
                onEdit(appointment);
                setShowModal(false);
              }}
              style={{
                background: "#007bff",
                color: "white",
                border: "none",
                padding: "10px 25px",
                borderRadius: "5px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontWeight: "500"
              }}
            >
              <span>✏️</span> ویرایش کلاس
            </button>
            
            <button
              onClick={handleDeleteGroup}
              style={{
                background: "#dc3545",
                color: "white",
                border: "none",
                padding: "10px 25px",
                borderRadius: "5px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <span>🗑️</span> حذف کلاس
            </button>
          </div>
          
          <button 
            onClick={() => setShowModal(false)}
            style={{
              background: "#6c757d",
              color: "white",
              border: "none",
              padding: "10px 30px",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "500"
            }}
          >
            بستن
          </button>
        </div>
      </div>

    </div>
  );
}