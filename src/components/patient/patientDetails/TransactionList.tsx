// components/patientDetails/TransactionList.jsx
import { useState, useEffect, useMemo } from "react";
import moment from "moment-jalaali";
import "./TransactionList.css";

import AppointmentSummaryModal from "./AppointmentSummaryModal";

import { useTransactionsPatient } from "../../../hooks/transaction";
import { AlertSwal } from "../../../utils/errorSwal";
import { useGetOnePatient } from "../../../hooks/patient";
import { GetRefrshWallet } from "../../../services/transaction";


export default function TransactionList({ patientId, patientName, setTransactionListModal, transactionListModal }) {
   
  
 



const {data:patient}=useGetOnePatient(patientId)




  const [nobat, setNobat] = useState(false);
  
  const [filters, setFilters] = useState({
    type: null,
    for:null,
    page: 1,
    limit: 10
  });
  useEffect(() => {
  if (patientId&&patientId!==undefined) {
    setFilters(prev => ({
      ...prev,
      patientId
    }));
  }
}, [patientId]);

const {data,isLoading:loading,refetch:GetTransactionList}=useTransactionsPatient({...filters,patientId})

const allTransactions=data?.transactions||[]


  // لود همه تراکنش‌ها
  const loadAllTransactions = async () => {
    if (!patientId||patientId==undefined) return AlertSwal.Error("مراجع انتخاب نشده است!");


    
    GetTransactionList()
  
  };

  useEffect(() => {
    if (patientId && transactionListModal) {
      loadAllTransactions();
    }
  }, [patientId, transactionListModal]);

  // فیلتر کردن
  const filteredTransactions = useMemo(() => {
    let result = [...allTransactions];
    
    if (filters.type) {
      result = result.filter(t => t.type === filters.type);
    }
    
    if (filters.for) {
      result = result.filter(t => t.for === filters.for);
    }
    
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return result;
  }, [allTransactions, filters.type, filters.for]);

  // // پیجینیشن
  // const paginatedTransactions = useMemo(() => {
  //   const startIndex = (filters.page - 1) * filters.limit;
  //   const endIndex = startIndex + filters.limit;
  //   return filteredTransactions.slice(startIndex, endIndex);
  // }, [filteredTransactions, filters.page, filters.limit]);

  // const paginationInfo = useMemo(() => {
  //   const total = filteredTransactions.length;
  //   const pages = Math.ceil(total / filters.limit);
    
  //   return {
  //     page: filters.page,
  //     limit: filters.limit,
  //     total,
  //     pages,
  //     hasNextPage: filters.page < pages,
  //     hasPrevPage: filters.page > 1
  //   };
  // }, [filteredTransactions, filters.page, filters.limit]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const getTypeText = (type) => {
    return type === "induce" ? "افزایش" : "کاهش";
  };

  const getForText = (forType) => {
    return forType === "wallet" ? "کیف پول" : "نوبت";
  };

  const getTypeColor = (type) => {
    return type === "induce" ? "transaction-type-induce" : "transaction-type-reduce";
  };

  if (!transactionListModal) {
    return null;
  }
const BalancedWallet=Array.isArray(patient)&&patient.length>0? (patient[0]?.wallet?.toLocaleString()||0):0
const handleRefreshWallet=async()=>{try {


   await GetRefrshWallet(patientId)
   setTransactionListModal(false)
  AlertSwal.succes("با موفقیت بروزرسانی شد")
} catch (error) {
  AlertSwal.Error("خطا در بروزرسانی موجودی")
}

 
 
}

  return (
    <>
      {/* مودال ساده بدون overlay کل صفحه */}
      <div className="simple-modal-container">
        <div className="simple-modal">
          {/* هدر مودال */}
          <div className="modal-header">
            <div className="header-title  m-2! p-1!">
              <button onClick={()=>handleRefreshWallet()} className="bg-green-600! rounded-2xl p-1!" >بروز رسانی موجودی</button>
              <h3 className="text-black!">
                <span className="patient-name">{patientName}</span>
                <small> - تاریخچه تراکنش‌ها</small>
              </h3>
            </div>
            <button 
              className="close-btn"
              onClick={() => setTransactionListModal(false)}
            >
              ✕ بستن
            </button>
          </div>

          {/* محتوای مودال */}
          <div className="modal-body">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>در حال بارگذاری تراکنش‌ها...</p>
              </div>
            ) : (
              <>
                {/* فیلترها */}
                {/* <div className="filters-row ">
                  <div className="filter-item">
                    <select 
                      value={filters.type}
                      onChange={(e) => handleFilterChange("type", e.target.value)}
                      className="filter-select"
                    >
                      <option value="">همه انواع</option>
                      <option value="induce">افزایش موجودی</option>
                      <option value="reduce">کاهش موجودی</option>
                    </select>
                  </div>

                  <div className="filter-item">
                    <select 
                      value={filters.for}
                      onChange={(e) => handleFilterChange("for", e.target.value)}
                      className="filter-select"
                    >
                      <option value="">همه دسته‌ها</option>
                      <option value="wallet">کیف پول</option>
                      <option value="appointment">نوبت</option>
                    </select>
                  </div>

                  <div className="filter-item">
                    <select 
                      value={filters.limit}
                      onChange={(e) => handleFilterChange("limit", Number(e.target.value))}
                      className="filter-select"
                    >
                      <option value="5">۵ تراکنش در صفحه</option>
                      <option value="10">۱۰ تراکنش در صفحه</option>
                      <option value="20">۲۰ تراکنش در صفحه</option>
                    </select>
                  </div>
                </div> */}

                {/* آمار */}
                <div className="stats-bar">
                  <div className="stat">
                    <span className="stat-label">کل تراکنش‌ها:</span>
                    <span className="stat-value">{allTransactions.length}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">واریزی:</span>
                    <span className="stat-value positive">
                      {allTransactions
                        .filter(t => t.type === "induce")
                        .reduce((sum, t) => sum + (t.amount || 0), 0)
                        .toLocaleString()} تومان
                    </span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">برداشت:</span>
                    <span className="stat-value negative">
                      {allTransactions
                        .filter(t => t.type === "reduce")
                        .reduce((sum, t) => sum + (t.amount || 0), 0)
                        .toLocaleString()} تومان
                    </span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">موجودی:</span>
                    <span className="stat-value">{BalancedWallet} تومان</span>
                  </div>
                </div>

                {/* جدول تراکنش‌ها */}
                <div className="table-wrapper">
                  <table className="simple-table ">
                    <thead>
                      <tr>
                        <th>تاریخ</th>
                        <th>مبلغ</th>
                        <th>نوع</th>
                        <th>دسته</th>
                        <th>توضیحات</th>
                        <th>عملیات</th>
                      </tr>
                    </thead>
                    <tbody >
                      {filteredTransactions.length > 0 ? (
                        filteredTransactions.map((transaction) => (
                          <tr key={transaction._id} className="table-row " >
                            <td className="date-cell">
                              {moment(transaction.createdAt).format("jYYYY/jMM/jDD")}
                              <br />
                              <small>{moment(transaction.createdAt).format("HH:mm")}</small>
                            </td>
                            <td className="amount-cell">
                              <span className={getTypeColor(transaction.type)}>
                                {transaction.type === "induce" ? "+" : "-"}
                                {transaction.amount?.toLocaleString() || 0} تومان
                              </span>
                            </td>
                            <td>
                              <span className={`type-badge ${transaction.type}`}>
                                {getTypeText(transaction.type)}
                              </span>
                            </td>
                            <td>
                              <span className="category-badge">
                                {getForText(transaction.for)}
                              </span>
                            </td>
                            <td className="description-cell">
                              {transaction.description}
                            </td>
                            <td>
                              {transaction.appointmentId ? (
                                <button 
                                  className="view-appointment-btn"
                                  onClick={() => setNobat(transaction.appointmentId)}
                                >
                                  مشاهده نوبت
                                </button>
                              ) : (
                                <span className="no-link">-</span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="no-data">
                            {filters.type || filters.for ? 
                              "با فیلترهای انتخاب شده تراکنشی یافت نشد" : 
                              "تراکنشی ثبت نشده است"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* پیجینیشن */}
                {/* {paginationInfo.pages > 1 && (
                  <div className="pagination">
                    <button 
                      className="page-btn"
                      disabled={!paginationInfo.hasPrevPage}
                      onClick={() => handlePageChange(paginationInfo.page - 1)}
                    >
                      ← قبلی
                    </button>
                    
                    <div className="page-numbers">
                      {Array.from({ length: Math.min(5, paginationInfo.pages) }, (_, i) => {
                        let pageNum;
                        if (paginationInfo.pages <= 5) {
                          pageNum = i + 1;
                        } else if (paginationInfo.page <= 3) {
                          pageNum = i + 1;
                        } else if (paginationInfo.page >= paginationInfo.pages - 2) {
                          pageNum = paginationInfo.pages - 4 + i;
                        } else {
                          pageNum = paginationInfo.page - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            className={`page-btn ${paginationInfo.page === pageNum ? "active" : ""}`}
                            onClick={() => handlePageChange(pageNum)}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button 
                      className="page-btn"
                      disabled={!paginationInfo.hasNextPage}
                      onClick={() => handlePageChange(paginationInfo.page + 1)}
                    >
                      بعدی →
                    </button>
                    
                    <div className="page-info">
                      صفحه {paginationInfo.page} از {paginationInfo.pages}
                    </div>
                  </div>
                )} */}
              </>
            )}
          </div>
        </div>
      </div>

      {/* مودال جزئیات نوبت */}
      <AppointmentSummaryModal 
        appointmentId={nobat} 
        isOpen={!!nobat} 
        onClose={() => setNobat(null)} 
      />
    </>
  );
}