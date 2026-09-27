import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import moment from 'moment-jalaali';
import "./archivePatients.css";

import { useArchivedPatients, useDeleteDestroyPatient, usePostRestorePatient } from '../../../hooks/archive';

export default function ArchivedPatients() {
  const navigate = useNavigate();
  const {data:patients ,isLoading:loading} = useArchivedPatients()
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const{mutate:DeleteDestroyPatient}=useDeleteDestroyPatient()
  const{mutate:PostPatientRestore}=usePostRestorePatient()


  // فیلتر مراجعین
  const filteredPatients =Array.isArray(patients)? patients.filter(patient => {
    // فیلتر بر اساس جستجو
    const searchMatch = 
      patient.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone?.includes(searchTerm) ||
      patient.username?.includes(searchTerm) ||
      patient.address?.toLowerCase().includes(searchTerm.toLowerCase());

    // فیلتر بر اساس نوع پرداخت
    const paymentMatch = filterType === 'all' || patient.paymentType === filterType;

    // فیلتر بر اساس تاریخ (مثال ساده)
    let dateMatch = true;
    if (filterDate !== 'all') {
      const archivedDate = moment(patient.archivedAt);
      const now = moment();
      
      switch(filterDate) {
        case '1month':
          dateMatch = now.diff(archivedDate, 'months') <= 1;
          break;
        case '3months':
          dateMatch = now.diff(archivedDate, 'months') <= 3;
          break;
        case '6months':
          dateMatch = now.diff(archivedDate, 'months') <= 6;
          break;
        case '1year':
          dateMatch = now.diff(archivedDate, 'years') <= 1;
          break;
        default:
          dateMatch = true;
      }
    }

    return searchMatch && paymentMatch && dateMatch;
  }):[]

  // 🟢 بازیابی مراجع
  const handleRestore = async (original_id, firstName, lastName) => {
    const patientName = `${firstName} ${lastName}`;
    
    const result = await Swal.fire({
      title: 'بازیابی مراجع',
      text: `آیا از بازیابی ${patientName} اطمینان دارید؟`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'بله، بازیابی شود',
      cancelButtonText: 'انصراف',
      confirmButtonColor: '#28a745',
      reverseButtons: true
    });

    if (result.isConfirmed) {
     
         PostPatientRestore(original_id);
        
      
    }
  };

  // 🔴 حذف دائم مراجع
  const handlePermanentDelete = async (original_id, firstName, lastName) => {
    const patientName = `${firstName} ${lastName}`;
    
    const result = await Swal.fire({
      title: 'حذف دائم',
      text: `آیا از حذف دائم ${patientName} اطمینان دارید؟ این عمل غیرقابل بازگشت است!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'بله، حذف شود',
      cancelButtonText: 'انصراف',
      confirmButtonColor: '#dc3545',
   
   
    });

    if (result.isConfirmed) {
    
        DeleteDestroyPatient(original_id)


    }
  };

  // 📤 خروجی اکسل
  const handleExportExcel = async () => {
    try {
      const response = await fetch('/api/patients/archived/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'مراجعین-آرشیو-شده.xlsx';
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (error) {
      Swal.fire('خطا!', 'در خروجی گرفتن مشکلی پیش آمد', 'error');
    }
  };

  // 📊 گزارش آماری
  const handleViewStats = () => {
    navigate('/reports/patients/archived-stats');
  };

  // 🏥 مشاهده جزئیات
  const handleViewDetails = (patient) => {
    setSelectedPatient(patient);
  };

  // تابع کمکی برای نمایش نوع پرداخت
  const getPaymentTypeLabel = (type) => {
    const types = {
      'naghd': 'نقدی',
      'card': 'کارت',
      'check': 'چک',
      'online': 'آنلاین'
    };
    return types[type] || type;
  };

  return (
    <div className="tab-content">
      {/* هدر با آمار */}
      <div className="settings-section" style={{ backgroundColor: '#f8f9fa' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0 }}>
              <span className="section-icon">👥</span> مراجعین آرشیو شده
            </h3>
            <p style={{ margin: '5px 0 0 0', color: '#6c757d', fontSize: '0.9rem' }}>
              {filteredPatients.length} مراجع آرشیو شده
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {/* <button 
              className="btn-secondary"
              onClick={handleExportExcel}
              title="خروجی اکسل"
            >
              📊 خروجی
            </button>
            <button 
              className="btn-secondary"
              onClick={handleViewStats}
              title="گزارش آماری"
            >
              📈 آمار
            </button> */}
          </div>
        </div>
      </div>

      {/* فیلتر و جستجو */}
      <div className="settings-section">
        <h3><span className="section-icon">🔍</span> جستجوی پیشرفته</h3>
        <div className="filter-group">
          <input 
            type="text" 
            className="setting-input" 
            placeholder="جستجو بر اساس نام، شماره تماس یا آدرس..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <select 
            className="filter-select" 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">همه نوع‌های پرداخت</option>
            <option value="naghd">نقدی</option>
            <option value="card">کارت</option>
            <option value="check">چک</option>
            <option value="online">آنلاین</option>
          </select>
          
          <select 
            className="filter-select" 
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          >
            <option value="all">همه تاریخ‌ها</option>
            <option value="1month">۱ ماه اخیر</option>
            <option value="3months">۳ ماه اخیر</option>
            <option value="6months">۶ ماه اخیر</option>
            <option value="1year">۱ سال اخیر</option>
          </select>
        </div>
      </div>

      {/* لیست مراجعین */}
      <div className="archived-list">
        {filteredPatients.length > 0 ? (
          filteredPatients.map(patient => (
            <div key={patient._id} className="archived-item">
              <div className="item-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h4 style={{ margin: 0 }}>{patient.firstName} {patient.lastName}</h4>
                  <span className="status-badge status-archived">آرشیو شده</span>
                </div>
                
                <div className="item-meta">
                  <span title="شماره تماس">
                    📱 {patient.phone || patient.username}
                  </span>
                  <span title="نوع پرداخت">
                    💳 {getPaymentTypeLabel(patient.paymentType)}
                  </span>
                  <span title="آدرس">
                    🏠 {patient.address || 'آدرس ثبت نشده'}
                  </span>
                  <span title="تاریخ آرشیو">
                    📅 {moment(patient.archivedAt).format("jYYYY/jMM/jDD")}
                  </span>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button 
                  className="btn-icon"
                  onClick={() => handleViewDetails(patient)}
                  title="مشاهده جزئیات"
                >
                  👁️ جزئیات
                </button>
                <button 
                  className="btn-success"
                  onClick={() => handleRestore(patient.original_id, patient.firstName, patient.lastName)}
                  title="بازیابی مراجع"
                >
                  ↩️ بازیابی
                </button>
                <button 
                  className="btn-danger"
                  onClick={() => handlePermanentDelete(patient.original_id, patient.firstName, patient.lastName)}
                  title="حذف دائم"
                >
                  🗑️ حذف
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>هیچ مراجع آرشیو شده‌ای یافت نشد</h3>
            <p>لیست مراجعین آرشیو شده اینجا نمایش داده می‌شود</p>
          </div>
        )}
      </div>

      {/* مودال جزئیات */}
      {selectedPatient && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h3>جزئیات مراجع آرشیو شده</h3>
              <button className="modal-close" onClick={() => setSelectedPatient(null)}>
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="details-grid">
                <div className="detail-item">
                  <strong>نام کامل:</strong>
                  <span>{selectedPatient.firstName} {selectedPatient.lastName}</span>
                </div>
                <div className="detail-item">
                  <strong>نام کاربری:</strong>
                  <span>{selectedPatient.username}</span>
                </div>
                <div className="detail-item">
                  <strong>شماره تماس:</strong>
                  <span>{selectedPatient.phone || selectedPatient.username}</span>
                </div>
                <div className="detail-item">
                  <strong>نوع پرداخت:</strong>
                  <span className={`payment-badge payment-${selectedPatient.paymentType}`}>
                    {getPaymentTypeLabel(selectedPatient.paymentType)}
                  </span>
                </div>
                <div className="detail-item">
                  <strong>درصد تخفیف:</strong>
                  <span>{selectedPatient.discountPercent || 0}%</span>
                </div>
                <div className="detail-item">
                  <strong>آدرس:</strong>
                  <span>{selectedPatient.address || 'ثبت نشده'}</span>
                </div>
                <div className="detail-item">
                  <strong>تاریخ آرشیو:</strong>
                  <span>{moment(selectedPatient.archivedAt).format("jYYYY/jMM/jDD - HH:mm")}</span>
                </div>
                <div className="detail-item full-width">
                  <strong>تاریخ ایجاد حساب:</strong>
                  <span>{moment(selectedPatient.createdAt).format("jYYYY/jMM/jDD")}</span>
                </div>
                
                {/* لیست درمانگران مرتبط */}
                {selectedPatient.therapists && selectedPatient.therapists.length > 0 && (
                  <div className="detail-item full-width">
                    <strong>درمانگران مرتبط:</strong>
                    <div className="therapists-list">
                      {selectedPatient.therapists.map((therapist, index) => (
                        <span key={index} className="therapist-tag">
                          {therapist.name || therapist.firstName}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* روزهای کاری (در صورت وجود) */}
                {selectedPatient.workDays && selectedPatient.workDays.length > 0 && (
                  <div className="detail-item full-width">
                    <strong>روزهای کاری ثبت شده:</strong>
                    <div className="work-days">
                      {selectedPatient.workDays.map((day, index) => (
                        <span key={index} className="day-tag">
                          {day.day}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="modal-actions">
                <button 
                  className="btn-secondary"
                  onClick={() => setSelectedPatient(null)}
                >
                  بستن
                </button>
                <button 
                  className="btn-success"
                  onClick={() => {
                    handleRestore(selectedPatient.original_id, selectedPatient.firstName, selectedPatient.lastName);
                    setSelectedPatient(null);
                  }}
                >
                  ↩️ بازیابی این مراجع
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>در حال بارگذاری مراجعین آرشیو شده...</p>
        </div>
      )}
    </div>
  );
}