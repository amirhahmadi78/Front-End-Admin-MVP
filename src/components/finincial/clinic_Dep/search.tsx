// AdvancedSearch.jsx
import { useState } from "react";

const AdvancedSearch = ({
  formFilters,
  handleInputChange,
  activeFilters,
  removeFilter,
  therapistList,
  patientList
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);


  return (
    <div className="advanced-search-section">
      <div className="advanced-header">
        <button
          type="button"
          className="toggle-advanced-btn"
          onClick={() => setShowAdvanced(prev => !prev)}
        >
          <i className={`fas fa-chevron-${showAdvanced ? "up" : "down"}`}></i>
          {showAdvanced ? "بستن جستجوی پیشرفته" : "نمایش جستجوی پیشرفته"}
        </button>
      </div>

      {showAdvanced && (
        <div className="advanced-filters-form">
          <div className="search-grid">
            {/* نام مراجع (جستجوی متنی) */}
            {/* <div className="search-field">
              <label><i className="fas fa-user-injured"></i> نام مراجع</label>
              <input type="text" name="patientName" value={formFilters.patientName} onChange={handleInputChange} placeholder="جستجوی بر اساس نام مراجع" />
            </div> */}
            {/* نام درمانگر (جستجوی متنی) */}
            {/* <div className="search-field">
              <label><i className="fas fa-user-md"></i> نام درمانگر</label>
              <input type="text" name="therapistName" value={formFilters.therapistName} onChange={handleInputChange} placeholder="جستجوی بر اساس نام درمانگر" />
            </div> */}

            {/* انتخاب مراجع (با آیدی) */}
            <div className="search-field">
              <label><i className="fas fa-user-check"></i> انتخاب مراجع</label>
              <select name="patient" value={formFilters.patient || ''} onChange={handleInputChange}>
                <option value="">همه مراجعین</option>
                {patientList.map(patient => (
                  <option key={patient._id} value={patient._id}>
                    {patient.firstName+" "+patient.lastName || 'بدون نام'}
                  </option>
                ))}
              </select>
            </div>

            {/* انتخاب درمانگر (با آیدی) */}
            <div className="search-field">
              <label><i className="fas fa-user-md"></i> انتخاب درمانگر</label>
              <select name="therapist" value={formFilters.therapist || ''} onChange={handleInputChange}>
                <option value="">همه درمانگران</option>
                {therapistList.map(therapist => (
                  <option key={therapist._id} value={therapist._id}>
                    {therapist.firstName+" "+therapist.lastName|| 'بدون نام'}
                  </option>
                ))}
              </select>
            </div>

            {/* وضعیت کلینیک */}
            <div className="search-field">
              <label><i className="fas fa-clipboard-check"></i> وضعیت کلینیک</label>
              <select name="status_clinic" value={formFilters.status_clinic} onChange={handleInputChange}>
                <option value="">همه وضعیت‌ها</option>
                <option value="completed-notpaid">انجام شده (تسویه نشده)</option>
                <option value="completed-paid">انجام شده (تسویه شده)</option>
                <option value="bimeh">بیمه</option>
                <option value="scheduled">برنامه‌ریزی شده</option>
                <option value="canceled">لغو شده</option>
                <option value="absent">غیبت</option>
              </select>
            </div>
            {/* نوع پرداخت */}
            <div className="search-field">
              <label><i className="fas fa-credit-card"></i> نوع پرداخت</label>
              <select name="payment" value={formFilters.payment} onChange={handleInputChange}>
                <option value="">همه پرداخت‌ها</option>
                <option value="card">کارت</option>
                <option value="transfer">واریز</option>
                <option value="cash">نقد</option>
                <option value="wallet">کیف پول</option>
              </select>
            </div>
            {/* نوع سشن */}
            <div className="search-field">
              <label><i className="fas fa-users"></i> نوع جلسه</label>
              <select name="sessionType" value={formFilters.sessionType} onChange={handleInputChange}>
                <option value="">همه انواع</option>
                <option value="individual">انفرادی</option>
                <option value="group">گروهی</option>
              </select>
            </div>
            {/* نوع جلسه */}
            <div className="search-field">
              <label><i className="fas fa-stethoscope"></i> نوع جلسه</label>
              <select name="type" value={formFilters.type} onChange={handleInputChange}>
                <option value="">همه انواع</option>
                <option value="session">درمان حضوری</option>
                <option value="assessment">ارزیابی</option>
                <option value="online">آنلاین</option>
                <option value="break">استراحت</option>
                <option value="lunch">ناهار</option>
              </select>
            </div>
            {/* اتاق */}
            <div className="search-field">
              <label><i className="fas fa-door-closed"></i> اتاق</label>
              <input type="text" name="room" value={formFilters.room} onChange={handleInputChange} placeholder="شماره اتاق" />
            </div>
            {/* حداقل مبلغ */}
            <div className="search-field">
              <label><i className="fas fa-money-bill-wave"></i> حداقل مبلغ (تومان)</label>
              <input type="number" name="minAmount" value={formFilters.minAmount} onChange={handleInputChange} placeholder="حداقل مبلغ" min="0" />
            </div>
            {/* حداکثر مبلغ */}
            <div className="search-field">
              <label><i className="fas fa-money-bill-wave"></i> حداکثر مبلغ (تومان)</label>
              <input type="number" name="maxAmount" value={formFilters.maxAmount} onChange={handleInputChange} placeholder="حداکثر مبلغ" min="0" />
            </div>
          </div>
        </div>
      )}

      {/* نمایش فیلترهای فعال */}
      {activeFilters.length > 0 && (
        <div className="active-filters">
          <strong>فیلترهای فعال:</strong>
          {activeFilters.map((filter, index) => (
            <span key={index} className="filter-tag">
              {filter.label}: {filter.label==="therapist"? "درمانگر": filter.label==="patient"?"مراجع" :filter.value}
              <button type="button" className="remove-filter" onClick={() => removeFilter(filter.key)}>×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;