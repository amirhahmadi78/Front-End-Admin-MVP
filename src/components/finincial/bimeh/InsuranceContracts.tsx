// اول مطمئن شویم moment و datepicker درست import شده
import   { useState, useEffect } from 'react';
import './InsuranceContracts.css';
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

import { useCreateIncuranceContract, useDeleteIncuranceContract,useEditIncuranceContract, useGetFintInsuranceContract } from '../../../hooks/insurance';

import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { insuranceContractSchema } from '../../../validation/insurance/insuranceContract';
import { convertDateToISO, IsoTOJYJMJD } from '../../../utils/timechange';
import { AlertSwal } from '../../../utils/errorSwal';
import type { editInsuranceContract, newInsuranceContract } from '../../../types/insurance';



const InsuranceContracts = () => {

  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentContractId, setCurrentContractId] = useState<null|string>(null);

  const {
  control,
  register,
  handleSubmit,
  reset,
  formState: { errors, isSubmitting },
} = useForm({
  resolver: yupResolver(insuranceContractSchema),
  defaultValues: {
    name: "",
    code: "",
    contactPerson: "",
    phone: "",
    email: "",
    contractDate: "",
    expiryDate: "",
    status: "active",
    coverage: [],
    discountRate: 0,
  },
});

    
  const {mutate:createInsuranceContractApi}=useCreateIncuranceContract()
  const {mutate:updateInsuranceContractApi}=useEditIncuranceContract()
  const{mutate:deleteInsuranceContractApi}=useDeleteIncuranceContract()
    const {data:contracts,isLoading:insuranceLoading , refetch:insuranceRefetch} = useGetFintInsuranceContract()
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
const loading=insuranceLoading

const onSubmit = async (data:newInsuranceContract) => {


  
  const payload = {
    ...data,
    contractDate: convertDateToISO(data.contractDate),
    expiryDate: convertDateToISO(data.expiryDate),
  };
  
  if (isEditing) {
    if(!currentContractId) return AlertSwal.Error("خطا در انتخاب قرارداد برای ویرایش!")
       if(payload.contractDate==null || payload.expiryDate==null) return AlertSwal.Error("خطا در انتخاب  تاریخ برای ویرایش!")

    const editPayload={...payload,_id:currentContractId}
  
    
     updateInsuranceContractApi( editPayload);
 
  } else {
     createInsuranceContractApi(payload);

  }

  reset();
  setShowAddForm(false);
  setIsEditing(false);
};

  // تابع تبدیل تاریخ به فرمت مناسب برای نمایش
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  
  useEffect(() => {
    insuranceRefetch();
  }, []);



const handleEditClick = (contract:editInsuranceContract) => {
  setIsEditing(true);
  setShowAddForm(true);
  setCurrentContractId(contract._id);

  const contractDateObj = contract.contractDate
    ? IsoTOJYJMJD(contract.contractDate)
    : "";

  const expiryDateObj = contract.expiryDate
    ? IsoTOJYJMJD(contract.expiryDate)
    : "";

  reset({
    name: contract.name,
    code: contract.code,
    contactPerson: contract.contactPerson || "",
    phone: contract.phone || "",
    email: contract.email || "",
    contractDate: contractDateObj,
    expiryDate: expiryDateObj,
    status: contract.status,
    coverage: contract.coverage || [],
    discountRate: contract.discountRate || 0,
  });
};







  const handleDeleteContract = async (id:string) => {
    
   const {isConfirmed}=await AlertSwal.doYouWant("آیا از حذف این مراجع مطمين هستید؟")

   if (isConfirmed){
       deleteInsuranceContractApi(id);
   }
  

}





  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { class: 'status-active', text: 'فعال' },
      pending: { class: 'status-pending', text: 'در انتظار' },
      expired: { class: 'status-expired', text: 'منقضی' }
    };
    const config = statusConfig[status] || { class: 'status-active', text: status };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentContracts =Array.isArray(contracts)? contracts.slice(indexOfFirstItem, indexOfLastItem):[]
  const totalPages = Array.isArray(contracts)?Math.ceil(contracts.length / itemsPerPage):1

  return (
    <div className="insurance-contracts">
      {loading && <div className="loading">در حال بارگذاری...</div>}

      <div className="section-header">
        <h2>بیمه‌های طرف قرارداد</h2>
        <button
          className="btn-add"
          onClick={() => {
            setShowAddForm(!showAddForm);
            setIsEditing(false);
         
          }}
          disabled={loading}
        >
          <i className="fas fa-plus"></i>
          {isEditing ? 'ویرایش بیمه' : 'افزودن بیمه جدید'}
        </button>
      </div>

      {showAddForm && (
        <div className="add-contract-form">
          <h3>{isEditing ? 'ویرایش قرارداد' : 'افزودن قرارداد جدید'}</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>نام بیمه *</label>
              <input
              {...register("name")}
                type="text"
                  placeholder="نام بیمه"
                required
              />
              {errors.name && <span className="error">{errors.name.message}</span>}
            </div>
            <div className="form-group">
              <label>کد قرارداد *</label>
              <input
                type="text"
                {...register("code")}       placeholder="کد قرارداد"
                required
              />
              {errors.code && <span className="error">{errors.code.message}</span>}
            </div>
            <div className="form-group">
              <label>نام مسئول</label>
              <input
                type="text"
            {...register("contactPerson")}
                placeholder="نام مسئول"
              />
                            {errors.contactPerson && <span className="error">{errors.contactPerson.message}</span>}
            </div>
            <div className="form-group">
              <label>تلفن</label>
              <input
                type="number"
                {...register("phone")}
                placeholder="تلفن"
              />
                            {errors.phone && <span className="error">{errors.phone.message}</span>}
            </div>
            <div className="form-group">
              <label>ایمیل</label>
              <input
                type="email"
               {...register("email")}
                placeholder="ایمیل"
              />
                            {errors.email && <span className="error">{errors.email.message}</span>}
            </div>
            
            <div className="form-group">
              <label>تاریخ قرارداد *</label>
            <Controller
  control={control}
  name="contractDate"
  render={({ field }) => (
    <DatePicker
      value={field.value}
      onChange={field.onChange}
      calendar={persian}
      locale={persian_fa}
      format="YYYY/MM/DD"
    />
  )}
/>
{errors.contractDate && (
  <span className="error">{errors.contractDate.message}</span>
)}
            </div>
            
            <div className="form-group">
              <label>تاریخ انقضا *</label>
             <Controller
  control={control}
  name="expiryDate"
  render={({ field }) => (
    <DatePicker
      value={field.value}
      onChange={field.onChange}
      calendar={persian}
      locale={persian_fa}
      format="YYYY/MM/DD"
    />
  )}
/>
{errors.contractDate && (
  <span className="error">{errors.contractDate.message}</span>
)}
              {/* {newContract.expiryDate && (
                <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
                  انتخاب شده: {newContract.expiryDate.format ? newContract.expiryDate.format('YYYY/MM/DD') : newContract.expiryDate.toString()}
                </small>
              )} */}
            </div>
            
            <div className="form-group">
              <label>درصد تخفیف</label>
              <input
                type="number"
               {...register("discountRate")}
                min="0"
                max="100"
              />
              {errors.discountRate && <span className="error">{errors.discountRate.message}</span>}
            </div>
            
            <div className="form-group">
              <label>وضعیت</label>
              <select
                {...register("status")}
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px',
                  background: 'white'
                }}
              >
                <option value="active">فعال</option>
                <option value="pending">در انتظار</option>
                <option value="expired">منقضی</option>
              </select>
              {errors.status && <span className="error">{errors.status.message}</span>}
            </div>
            
            <div className="form-group full-width">
              <label>خدمات تحت پوشش</label>
              <div className="coverage-checkboxes">
               {["کاردرمانی", "گفتاردرمانی", "روانشناسی", "فیزیوتراپی"].map(service => (
  <label key={service}>
    <input
      type="checkbox"
      value={service}
      {...register("coverage")}
    />
    {service}
  </label>
))}
{errors.coverage && (
  <span className="error">{errors.coverage.message}</span>
)}

              </div>
            
            </div>
          </div>
          
          <div className="form-actions">
            <button className="btn-cancel" onClick={() => setShowAddForm(false)}>
              انصراف
            </button>
          <button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
  {isSubmitting ? "در حال ارسال..." : "ثبت قرارداد"}
</button>
              
          </div>
        </div>
      )}

      <div className="contracts-table-container">
        <table className="contracts-table">
          <thead>
            <tr>
              <th>نام بیمه</th>
              <th>کد قرارداد</th>
              <th>مسئول</th>
              <th>تلفن</th>
              <th>تاریخ انقضا</th>
              <th>وضعیت</th>
              <th>خدمات تحت پوشش</th>
              <th>درصد تخفیف</th>
              <th>مجموع بدهی</th>
              <th>مجموع واریزی</th>
              <th>مانده حساب</th>
              <th>آخرین واریزی</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {currentContracts.map((contract) => (
              <tr key={contract._id}>
                <td>
                  <div className="contract-name">
                    <i className="fas fa-shield-alt"></i>
                    {contract.name}
                  </div>
                </td>
                <td>{contract.code}</td>
                <td>{contract.contactPerson || '-'}</td>
                <td>{contract.phone || '-'}</td>
                <td>{contract.expiryDate ? formatDateForDisplay(contract.expiryDate) : '-'}</td>
                <td>{getStatusBadge(contract.status)}</td>
                <td>
                  <div className="coverage-tags">
                    {(contract.coverage || []).map((service, index) => (
                      <span key={index} className="coverage-tag">{service}</span>
                    ))}
                    {(contract.coverage || []).length === 0 && <span>-</span>}
                  </div>
                </td>
                <td>
                  <span className="discount-badge">{contract.discountRate || 0}%</span>
                </td>
                <td>
                  <div className="amount-cell debt-amount">
                    {(contract.totalDebtAmount || 0).toLocaleString('fa-IR')}
                    <small>تومان</small>
                  </div>
                </td>
                <td>
                  <div className="amount-cell paid-amount">
                    {(contract.totalPaidAmount || 0).toLocaleString('fa-IR')}
                    <small>تومان</small>
                  </div>
                </td>
                <td>
                  <div className={`amount-cell balance-amount ${(contract.currentBalance || 0) >= 0 ? 'positive' : 'negative'}`}>
                    {(contract.currentBalance || 0).toLocaleString('fa-IR')}
                    <small>تومان</small>
                  </div>
                </td>
                <td>{contract.lastPaymentDate ? formatDateForDisplay(contract.lastPaymentDate) : '-'}</td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-action btn-edit" onClick={() => handleEditClick(contract)}>
                    ویرایش  <i className="fas fa-edit"></i>
                    </button>
                    <button className="btn-action btn-delete" onClick={() => handleDeleteContract(contract._id)}>
                    حذف  <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {(Array.isArray(contracts)?contracts.length === 0:(
          <div className="no-data">
            <i className="fas fa-file-contract"></i>
            <p>مشکلی در دریافت قرارداد های بیمه پیش آمده است.</p>
          </div>
        )) && !loading && (
          <div className="no-data">
            <i className="fas fa-file-contract"></i>
            <p>هیچ قرارداد بیمه‌ای ثبت نشده است</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <i className="fas fa-chevron-right"></i>
            قبلی
          </button>

          <div className="page-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`page-number ${currentPage === page ? 'active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            بعدی
            <i className="fas fa-chevron-left"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default InsuranceContracts
