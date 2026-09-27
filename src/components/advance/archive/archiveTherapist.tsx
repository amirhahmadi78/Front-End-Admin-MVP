
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import "./archiveTherapist.css"

import moment from 'moment-jalaali';
import { useArchivedTherapists, useDeleteDestroytherapist, usePostRestoreTherapist } from '../../../hooks/archive';
import { useState } from 'react';

export default function ArchivedTherapists() {
  const navigate = useNavigate();
   const {data:therapists,isLoading:loading} = useArchivedTherapists()
  const{mutate:DeleteDestroyTherapist}=useDeleteDestroytherapist()
  const{mutate:PostArchiveRestore}=usePostRestoreTherapist()

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTherapist, setSelectedTherapist] = useState(null);



  // فیلتر درمانگران بر اساس جستجو
  const filteredTherapists =Array.isArray(therapists)? therapists.filter(therapist =>
    therapist.firstName.toLowerCase().includes(searchTerm.toLowerCase())||
    therapist.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    therapist.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    therapist.phone.includes(searchTerm)
  ):[]

  // 🟢 بازیابی درمانگر
  const handleRestore = async (original_id, firstName,lastName) => {
    const therapistName=firstName+" "+lastName
    const result = await Swal.fire({
      title: 'بازیابی درمانگر',
      text: `آیا از بازیابی ${therapistName} اطمینان دارید؟`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'بله، بازیابی شود',
      cancelButtonText: 'انصراف',
      confirmButtonColor: '#28a745'
    });

    if (result.isConfirmed) {
      

  PostArchiveRestore(original_id)
      
        
    }
  };

  // 🔴 حذف دائم درمانگر
  const handlePermanentDelete = async (original_id, firstName,lastName) => {
    const therapistName=firstName+" "+lastName
    const result = await Swal.fire({
      title: 'حذف دائم',
      text: `آیا از حذف دائم ${therapistName} اطمینان دارید؟ این عمل غیرقابل بازگشت است!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'بله، حذف شود',
      cancelButtonText: 'انصراف',
      confirmButtonColor: '#dc3545',


    });

    if (result.isConfirmed) {
      
       
      DeleteDestroyTherapist(original_id)


          
    }
  };

  // 🔍 مشاهده جزئیات
  const handleViewDetails = (therapist) => {
    setSelectedTherapist(therapist);
  };

  // 📤 خروجی اکسل
  const handleExportExcel = async () => {
    try {
      // فرضی: API خروجی اکسل
      const response = await fetch('/api/therapists/archived/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'درمانگران-آرشیو-شده.xlsx';
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
    navigate('/reports/therapists/archived-stats');
  };

  return (
    <div className="tab-content">
      {/* هدر با آمار */}
      <div className="settings-section" style={{ backgroundColor: '#f8f9fa' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0 }}>
              <span className="section-icon">👨‍⚕️</span> درمانگران آرشیو شده
            </h3>
            <p style={{ margin: '5px 0 0 0', color: '#6c757d', fontSize: '0.9rem' }}>
              {filteredTherapists.length} درمانگر آرشیو شده
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
            placeholder="جستجو بر اساس نام، تخصص یا شماره تماس..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select className="filter-select" defaultValue="">
            <option value="">همه تخصص‌ها</option>
            <option value="psy">روانشناسی</option>
            <option value="PT">فیزیوتراپی</option>
            <option value="OT">کاردرمانی</option>
            <option value="SLP">گفتاردرمانی</option>
          </select>
          <select className="filter-select" defaultValue="">
            <option value="">همه بازه‌های زمانی</option>
            <option value="1month">۱ ماه اخیر</option>
            <option value="3months">۳ ماه اخیر</option>
            <option value="6months">۶ ماه اخیر</option>
            <option value="1year">۱ سال اخیر</option>
          </select>
        </div>
      </div>

      {/* لیست درمانگران */}
      <div className="archived-list">
        {filteredTherapists.length > 0 ? (
          filteredTherapists.map(therapist => (
            <div key={therapist.id} className="archived-item">
              <div className="item-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h4 style={{ margin: 0 }}>{therapist.firstName+" "+therapist.lastName}</h4>
                  <span className="status-badge status-archived">آرشیو شده</span>
                </div>
            
              </div>
              
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button 
                  className="btn-icon"
                  onClick={() => handleViewDetails(therapist)}
                  title="مشاهده جزئیات"
                >
                  👁️ جزئیات
                </button>
                <button 
                  className="btn-success"
                  onClick={() => handleRestore(therapist.original_id, therapist.firstName,therapist.lastName)}
                  title="بازیابی درمانگر"
                >
                  ↩️ بازیابی
                </button>
                <button 
                  className="btn-danger"
                  onClick={() => handlePermanentDelete(therapist.original_id, therapist.firstName,therapist.lastName)}
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
            <h3>هیچ درمانگر آرشیو شده‌ای یافت نشد</h3>
            <p>لیست درمانگران آرشیو شده اینجا نمایش داده می‌شود</p>
          </div>
        )}
      </div>

      {/* مودال جزئیات */}
      {selectedTherapist && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>جزئیات درمانگر آرشیو شده</h3>
              <button className="modal-close" onClick={() => setSelectedTherapist(null)}>
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="details-grid">
                <div className="detail-item">
                  <strong>نام کامل:</strong>
                  <span>{selectedTherapist.firstName+" "+selectedTherapist.lastName}</span>
                </div>
                <div className="detail-item">
                  <strong>تخصص:</strong>
                  <span>{selectedTherapist.role}</span>
                </div>
                <div className="detail-item">
                  <strong>شماره تماس:</strong>
                  <span>{selectedTherapist.phone}</span>
                </div>
                <div className="detail-item">
                  <strong>ایمیل:</strong>
                  <span>{selectedTherapist.email}</span>
                </div>
                <div className="detail-item">
                  <strong>تاریخ آرشیو:</strong>
                  <span>{moment(selectedTherapist.archivedAt).format("jYYYY/jMM/jDD")}</span>
                </div>
                {/* <div className="detail-item">
                  <strong>آرشیو شده توسط:</strong>
                  <span>{selectedTherapist.archivedBy}</span>
                </div> */}
                <div className="detail-item full-width">
                  <strong>روزهای کاری:</strong>
                  {selectedTherapist.workDays.map(item=>{
                    return <span>{item.day}</span>
                  })}
                  
                </div>
               
              </div>
              
              <div className="modal-actions">
                <button 
                  className="btn-secondary"
                  onClick={() => setSelectedTherapist(null)}
                >
                  بستن
                </button>
                <button 
                  className="btn-success"
                  onClick={() => {
                    handleRestore(selectedTherapist.id, selectedTherapist.name);
                    setSelectedTherapist(null);
                  }}
                >
                  ↩️ بازیابی این درمانگر
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>در حال بارگذاری درمانگران آرشیو شده...</p>
        </div>
      )}
    </div>
  );
}