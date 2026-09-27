import  { useState, useEffect } from "react";
import "./mainPatients.css";


import {  ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PatientTable from "./PatientsTable.tsx";

import PatientModal from "./PatientsModal.tsx";


import { useEditPatient, useFindPatient, useMakePatient } from "../../hooks/patient.ts";
import type { DTOeditPatient, DTOmakePatient } from "../../types/patients.ts";
import Pagination from "../util/pagination.tsx";

export default function MainPatients() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<DTOeditPatient|null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("lastName");
  const [searchQuery, setSearchQuery] = useState({});
  
  const { data, isLoading: isLoadingPatients, refetch: fetchPatients } = useFindPatient({ ...searchQuery, page, limit });
  const patients = data?.patients || [];
  const { mutate: Makepatient } = useMakePatient();
  const { mutate: Editpatient } = useEditPatient();
  
  const [paymentTypeValue, setPaymentTypeValue] = useState("");

  // ✅ اصلاح: با هر تغییری در searchQuery، page، limit دوباره فراخوانی کن
  useEffect(() => {
    fetchPatients();
  }, [searchQuery, page, limit]);

  const onSubmit = async (data: DTOmakePatient) => {
    try {
      if (editingPatient == null) {
        Makepatient(data);
      } else {
        const TrueData: DTOeditPatient = { ...data, _id: editingPatient._id }
       
        Editpatient(TrueData);
      }
      setShowModal(false);
      handleClearSearch(); // ✅ بعد از افزودن/ویرایش، جستجو را پاک کن
    } catch (error) {
      setShowModal(false);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setSearchField("lastName");
    setPaymentTypeValue("");
    setSearchQuery({});
    setPage(1);
  };

  const handleSearch = () => {
    setPage(1);
    
    let searchValue = "";
    
    // بررسی نوع فیلد جستجو
    if (searchField === "paymentType") {
      searchValue = paymentTypeValue;
    } else {
      searchValue = searchTerm;
    }
    
    // اگر مقدار جستجو خالی بود
    if (!searchValue?.trim()) {
      setSearchQuery({});
    } else {
      setSearchQuery({ [searchField]: searchValue });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleFieldChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newField = e.target.value;
    setSearchField(newField);
    // پاک کردن جستجو هنگام تغییر فیلد
    setSearchTerm("");
    setPaymentTypeValue("");
  };

  const renderSearchInput = () => {
    switch (searchField) {
      case "paymentType":
        return (
          <select
            value={paymentTypeValue}
            onChange={(e) => setPaymentTypeValue(e.target.value)}
            className="search-input search-select-type"
          >
            <option value="">همه</option>
            <option value="bimeh">بیمه</option>
            <option value="naghd">نقدی</option>
          </select>
        );
      
      case "phone":
        return (
          <input
            type="tel"
            placeholder="مثال: 09123456789"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            className="search-input"
          />
        );
      
      default:
        return (
          <input
            type="text"
            placeholder={`جستجوی ${
              searchField === "lastName" ? "نام خانوادگی" :
              searchField === "firstName" ? "نام" : "آدرس"
            }...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            className="search-input"
          />
        );
    }
  };

  // ✅ بررسی اینکه آیا جستجوی فعالی وجود دارد
  const hasActiveSearch = () => {
    if (searchField === "paymentType") {
      return paymentTypeValue !== "";
    }
    return searchTerm.trim() !== "";
  };

  // ✅ گرفتن مقدار جستجو برای نمایش
  const getSearchDisplayValue = () => {
    if (searchField === "paymentType") {
      return paymentTypeValue === "bimeh" ? "بیمه" : 
             paymentTypeValue === "naghd" ? "نقدی" : "";
    }
    return searchTerm;
  };

  return (
    <div className="patients-page1">
      <div className="top-bar1">
        <h2>مدیریت مراجعان</h2>
        <div className="actions">
          <div className="search-container">
            <div className="search-input-group">
              {renderSearchInput()}
              
              <select
                value={searchField}
                onChange={handleFieldChange}
                className="search-select"
              >
                <option value="lastName">نام خانوادگی</option>
                <option value="firstName">نام</option>
                <option value="phone">شماره تماس</option>
                <option value="address">آدرس</option>
                <option value="paymentType">نوع پرداخت</option>
              </select>
              
              <button
                onClick={handleSearch}  // ✅ اصلاح: بدون ()=> اضافی
                className="search-button"
              >
                🔍 جستجو
              </button>

              {/* ✅ اصلاح: دکمه پاک کردن برای همه حالات */}
              {hasActiveSearch() && (
                <button
                  onClick={handleClearSearch}
                  className="clear-search-btn"
                  title="پاک کردن جستجو"
                >
                  ✕
                </button>
              )}
            </div>
            
            {/* ✅ اصلاح: نمایش تعداد نتایج برای همه حالات */}
            {hasActiveSearch() && (
              <div className="search-results-info">
                <span>
                  {patients.length} نتیجه از {data?.total || 0} مراجع
                </span>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => { 
              setShowModal(true);
              setEditingPatient(null);
            }}
            className="add-patient-btn"
          >
            ➕ افزودن مراجع
          </button>
        </div>
      </div>

      {isLoadingPatients ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>در حال بارگذاری مراجعین...</p>
        </div>
      ) : (
        <>
          {/* ✅ اصلاح: پیام عدم وجود نتیجه برای همه حالات */}
          {hasActiveSearch() && patients.length === 0 && (
            <div className="no-results-message">
              <p>هیچ مراجعی با جستجوی "{getSearchDisplayValue()}" یافت نشد.</p>
              <button onClick={handleClearSearch} className="clear-search-link">
                نمایش همه مراجعین
              </button>
            </div>
          )}
          
          <PatientTable 
            fetchPatients={fetchPatients} 
            patients={patients} 
            setShowModal={setShowModal} 
            setEditingPatient={setEditingPatient} 
          />
        </>
      )}

      <Pagination
        page={page}
        setPage={setPage}
        totalPages={data?.totalPages || 1}
      />

      {showModal && (
        <PatientModal
          onSubmit={onSubmit}
          onClose={() => setShowModal(false)}
          editingPatient={editingPatient}
        />
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}