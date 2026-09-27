import { useState, useRef } from 'react';

import Swal from 'sweetalert2';
import "./defaults.css"

import { useDefaultPrices, useDeletePrice, usePostPrice, usePostRefreshPrice } from '../../../hooks/prices';

export default function DefaultsSettings() {
  const {data:prices, isLoading:DefaultsLoading,refetch:DefaultsRefetch}=useDefaultPrices()

  const [editingPrice, setEditingPrice] = useState(null);
  const {mutate:PostPrice}=usePostPrice()
    const {mutate:PostRefresh}=usePostRefreshPrice()
        const {mutate:DeletePrice}=useDeletePrice()
    

const inputRef = useRef(null);

  const serviceTypes = ['session', 'assessment', 'online', 'consultation'];
  const serviceSkills = ['SLP', 'OT', 'PSY', 'PT'];
  const durations = [15, 30, 40, 45, 60, 90, 120];
  const loading=DefaultsLoading


 

 
  const findPrice = (serviceSkill, serviceType, duration) => {
    if (Array.isArray(prices)){
  return prices.find(
      p => p.serviceSkill === serviceSkill && 
           p.serviceType === serviceType && 
           p.duration === duration
    );
    }else{
      return []
    }
  
  };


  const handleSavePrice = async (serviceSkill, serviceType, duration, newPrice) => {
    if (!newPrice || newPrice <= 0) {
      Swal.fire('خطا!', 'لطفا قیمت معتبر وارد کنید', 'error');
      return;
    }
    const payload={
        serviceSkill, serviceType, duration,basePrice: newPrice
    }
 
   PostPrice(payload)

      setEditingPrice(null)

    
  }



  const handleDeletePrice = async (priceId) => {
    const result = await Swal.fire({
      title: 'آیا مطمئنید؟',
      text: 'قیمت حذف خواهد شد',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'بله، حذف کن',
      cancelButtonText: 'انصراف'
    });

    if (result.isConfirmed) {
    
         DeletePrice(priceId)

    }
  };

  // رفرش کش
  const handleRefreshCache = async () => {

       PostRefresh()
    
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>در حال بارگذاری قیمت‌ها...</p>
      </div>
    );
  }

  return (
    <div className="tab-content">
      {/* هدر و دکمه‌ها */}
     <div className="settings-section" style={{ backgroundColor: '#f8f9fa' }}>
  <div className="settings-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <h3 style={{ margin: 0 }}>
      <span className="section-icon">💰</span> مدیریت قیمت خدمات
    </h3>
    <div className="settings-header-actions" style={{ display: 'flex', gap: '10px' }}>
            <button 
              className="btn-secondary"
              onClick={handleRefreshCache}
              title="برای اطمینان از اینکه همه سرورها قیمت‌های جدید رو می‌بینن"
            >
              🔄 رفرش کش
            </button>
            <button 
              className="btn-primary"
              onClick={()=>DefaultsRefetch()}
            >
              🔄 بارگذاری مجدد
            </button>
          </div>
        </div>
        <p style={{ marginTop: '10px', color: '#6c757d', fontSize: '0.9rem' }}>
          {Array.isArray(prices)? prices.length:0} قیمت ثبت شده
        </p>
      </div>

      {/* جستجو و فیلتر */}
      <div className="settings-section">
        <h3><span className="section-icon">🔍</span> جستجو و فیلتر</h3>
        <div className="filter-group">
          <input 
            type="text" 
            className="filter-input" 
            placeholder="جستجو در خدمات..." 
          />
          <select className="filter-select">
            <option value="">همه مهارت‌ها</option>
            {serviceSkills.map(skill => (
              <option key={skill} value={skill}>{skill}</option>
            ))}
          </select>
          <select className="filter-select">
            <option value="">همه انواع</option>
            {serviceTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* جدول قیمت‌ها */}
      <div className="settings-section">
        <h3><span className="section-icon">📋</span> لیست قیمت‌ها</h3>
        
        {serviceSkills.map(skill => (
          <div key={skill} style={{ marginBottom: '30px' }}>
            <h4 style={{ color: '#495057', borderBottom: '2px solid #dee2e6', paddingBottom: '8px' }}>
              مهارت: {skill}
            </h4>
            
            <div className="price-table-wrapper" style={{ overflowX: 'auto' }}>
              <table className="price-table">
                <thead>
                  <tr>
                    <th>نوع خدمت</th>
                    {durations.map(duration => (
                      <th key={duration}>{duration} دقیقه</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {serviceTypes.map(type => (
                    <tr key={type}>
                      <td style={{ fontWeight: '500', backgroundColor: '#f8f9fa' }}>
                        {type === 'session' && 'جلسه درمانی'}
                        {type === 'assessment' && 'ارزیابی'}
                        {type === 'online' && 'آنلاین'}
                        {type === 'consultation' && 'مشاوره'}
                      </td>
                      {durations.map(duration => {
                        const priceObj = findPrice(skill, type, duration);
                        const isEditing = editingPrice === `${skill}_${type}_${duration}`;
                        
                        return (
                            <td key={duration} data-label={`${duration} دقیقه`}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                              {isEditing ? (
                                <div style={{ display: 'flex', gap: '5px' }}>
                                  <input
                                  ref={inputRef}
                                    type="number"
                                    defaultValue={priceObj?.basePrice || ''}

                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleSavePrice(skill, type, duration, e.target.value);
                                      }
                                      if (e.key === 'Escape') {
                                        setEditingPrice(null);
                                      }
                                      if (e.key === 'Esc') {
                                        setEditingPrice(null);
                                      }
                                    }}
                                    autoFocus
                                    style={{
                                      width: '100px',
                                      padding: '5px',
                                      border: '1px solid #4a6cf7',
                                      borderRadius: '4px'
                                    }}
                                  />
                      
                                  <button 
                                    onClick={()=>handleSavePrice(skill, type, duration, inputRef.current.value)}
                                    style={{
                                      padding: '5px 8px',
                                      background: '#9af19dff',
                                      color: '#000000ff',
                                      border: 'none',
                                      borderRadius: '4px',
                                      cursor: 'pointer'
                                    }}
                                  >
                                   ✔️
                                  </button>
                                       <button 
                                    onClick={() => setEditingPrice(null)}
                                    style={{
                                      padding: '5px 8px',
                                      background: '#ffffffff',
                                      color: '#000000ff',
                                      border: 'none',
                                      borderRadius: '4px',
                                      cursor: 'pointer'
                                    }}
                                  >
                                   ❌
                                  </button>
                            
                                </div>
                              ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <span style={{ fontWeight: '500' }}>
                                    {priceObj?.basePrice ? priceObj.basePrice.toLocaleString() : '-'}
                                  </span>
                                  <div style={{ display: 'flex', gap: '5px' }}>
                                    <button
                                      onClick={() => setEditingPrice(`${skill}_${type}_${duration}`)}
                                      className="btn-icon"
                                      title="ویرایش"
                                    >
                                      ✏️
                                    </button>
                                    {priceObj && (
                                      <button
                                        onClick={() => handleDeletePrice(priceObj._id)}
                                        className="btn-icon delete"
                                        title="حذف"
                                      >
                                        🗑️
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}
                              {!priceObj && !isEditing && (
                                <button
                                  onClick={() => setEditingPrice(`${skill}_${type}_${duration}`)}
                                  className="btn-outline small"
                                  style={{ fontSize: '0.8rem', padding: '3px 8px' }}
                                >
                                  + افزودن قیمت
                                </button>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* راهنما */}
      <div className="settings-section" style={{ backgroundColor: '#e7f3ff' }}>
        <h3><span className="section-icon">💡</span> راهنما</h3>
        <ul style={{ margin: '10px 0 0 20px', color: '#495057' }}>
          <li>هر سلول نشان‌دهنده قیمت برای <strong>مهارت × نوع خدمت × مدت زمان</strong> است</li>
          <li>برای ویرایش روی آیکون ✏️ کلیک کنید</li>
          <li>برای حذف قیمت روی 🗑️ کلیک کنید</li>
          <li>پس از تغییر قیمت، دکمه "رفرش کش" را بزنید تا در کل سیستم اعمال شود</li>
          <li>قیمت‌های خالی به معنای عدم تعریف قیمت برای آن خدمت است</li>
        </ul>
      </div>

   
    </div>
  );
}