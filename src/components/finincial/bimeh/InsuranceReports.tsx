import  { useState, useEffect } from 'react';
import './InsuranceReports.css';
import DatePicker from "react-multi-date-picker";


import { useGetFintInsuranceContract, useGetInsurancePaymentReports, useInsurancePaymentTransactions, usePatientInsuranceDebts } from '../../../hooks/insurance';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';


const InsuranceReports = () => {
  const [activeTab, setActiveTab] = useState('patient-debts');

  // Contracts tab state
  const [contractFilters, setContractFilters] = useState({
    dateFrom: '',
    dateTo: '',
    status: ''
  });
const {data:reportsData,refetch:reportsFetch}=useGetInsurancePaymentReports(contractFilters)

  const insuranceReports =reportsData?.contracts||[]
  const contractSummary = reportsData?.summary||{
    totalContracts: 0,
    activeContracts: 0,
    totalPaid: 0,
    totalDebt: 0,
    totalBalance: 0,
    periodTotalPaid: 0,
    totalInsuranceSessions: 0,
    totalInsuranceAmount: 0,
    totalInsuranceShare: 0,
    totalRemainingFromPatients: 0
  }
  const [contractCurrentPage, setContractCurrentPage] = useState(1);

  // Transactions tab state
  const [transactionFilters, setTransactionFilters] = useState({
    insuranceContract: '',
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: ''
  });
    const itemsPerPage = 10;
    const [transactionCurrentPage, setTransactionCurrentPage] = useState(1);
  const {data:transactionData,refetch:transactionFetch}=useInsurancePaymentTransactions({
        ...transactionFilters,
        page: transactionCurrentPage,
        limit: itemsPerPage
      })
  const transactions =transactionData.transactions || []
  const transactionSummary= transactionData.summary || {
    totalAmount: 0,
    transactionCount: 0,
    averageAmount: 0
  }

  const {data:allInsurances,refetch:fetchInsurance } = useGetFintInsuranceContract()


 
  // Patient debts tab state
  const [patientDebtFilters, setPatientDebtFilters] = useState({
    dateFrom: '',
    dateTo: '',
    insuranceContract: '',
    patientName: '',
    status: 'all'
  });


  const [patientDebtCurrentPage, setPatientDebtCurrentPage] = useState(1);

 const queryForDebts={
        page: patientDebtCurrentPage,
        limit: itemsPerPage,
        ...patientDebtFilters
      };
  const {data:PatientDebtsData , refetch:patientDebtsFetch}=usePatientInsuranceDebts(queryForDebts)
  const patientDebts=    PatientDebtsData?.patients||[]

  const patientDebtSummary =  PatientDebtsData?.summary||{
    totalPatients: 0,
    totalSessions: 0,
    totalInsuranceAmount: 0,
    totalInsuranceShare: 0,
    totalPatientShare: 0
  }
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [loading, setLoading] = useState(false);


useEffect(()=>{
  fetchInsurance()
},[])

  //این واس جستجوی خودکار بدون زدن جستجو بود که خاموشش کردم
  // useEffect(() => {
  //   if (activeTab === 'contracts') {
  //     performContractSearch();
  //   } else if (activeTab === 'transactions') {
  //     performTransactionSearch();
  //     fetchInsurances();
  //   } else if (activeTab === 'patient-debts') {
  //     fetchPatientDebts();
  //     fetchInsurances();
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [contractFilters, transactionFilters, patientDebtFilters, activeTab]);

  const performContractSearch = async () => {
    if (activeTab !== 'contracts') return;

  

     
    await  reportsFetch()
  
   
      setContractCurrentPage(1);
   
  };

  const performTransactionSearch = async () => {
    if (activeTab !== 'transactions') return;

 


     await transactionFetch()
   
 
  
      setTransactionCurrentPage(transactionData.pagination?.currentPage || 1);
  
  };



  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleContractFilterChange = (field, value) => {
 
    
    setContractFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleTransactionFilterChange = (field, value) => {
    console.log(field,value);
    
    setTransactionFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearContractFilters = () => {
    setContractFilters({
      dateFrom: '',
      dateTo: '',
      status: ''
    });
  };

  const clearTransactionFilters = () => {
    setTransactionFilters({
      insuranceContract: '',
      dateFrom: '',
      dateTo: '',
      minAmount: '',
      maxAmount: ''
    });
  };

  // Patient debts functions
  const fetchPatientDebts = async () => {
    

      patientDebtsFetch()

     

  };

  const handlePatientDebtFilterChange = (key, value) => {
    setPatientDebtFilters(prev => ({ ...prev, [key]: value }));
  };

  const performPatientDebtSearch = () => {
    setPatientDebtCurrentPage(1);
    fetchPatientDebts();
  };

  const clearPatientDebtFilters = () => {
    setPatientDebtFilters({
      dateFrom: '',
      dateTo: '',
      insuranceContract: '',
      patientName: '',
      status: 'all'
    });
  };

  const getStatusBadge = (status) => {
    const config = {
      paid: { class: 'status-paid', icon: 'fas fa-check-circle', text: 'واریز شده' },
      pending: { class: 'status-pending', icon: 'fas fa-clock', text: 'در انتظار' },
      rejected: { class: 'status-rejected', icon: 'fas fa-times-circle', text: 'رد شده' }
    };
    const item = config[status] || config.pending;
    return (
      <span className={`status-badge ${item.class}`}>
        <i className={item.icon}></i>
        {item.text}
      </span>
    );
  };

  const exportToExcel = () => {
    alert('گزارش با فرمت Excel آماده دانلود است');
  };

  const exportToPDF = () => {
    alert('گزارش با فرمت PDF آماده دانلود است');
  };

  // محاسبات پیجینیشن برای تب contracts
  const indexOfLastItem = contractCurrentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = insuranceReports.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(insuranceReports.length / itemsPerPage);

  return (
    <div className="insurance-reports">
      <div className="reports-header">
        <h2>بررسی ریز موارد بیمه</h2>
        <div className="tab-buttons">
          <button
            className={`tab-btn ${activeTab === 'contracts' ? 'active' : ''}`}
            onClick={() => setActiveTab('contracts')}
          >
            <i className="fas fa-file-contract"></i>
            قراردادهای بیمه
          </button>
          <button
            className={`tab-btn ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            <i className="fas fa-money-check-alt"></i>
            تراکنش‌های پرداختی
          </button>
          <button
            className={`tab-btn ${activeTab === 'patient-debts' ? 'active' : ''}`}
            onClick={() => setActiveTab('patient-debts')}
          >
            <i className="fas fa-users"></i>
            بدهی‌های مراجعین
          </button>
        </div>
      </div>

      {activeTab === 'contracts' && (
        <>
          <div className="search-panel">
            <div className="search-header">
              <h3>
                <i className="fas fa-search"></i>
                جستجوی پیشرفته قراردادها
              </h3>
              <div className="search-actions">
                <button className="btn-search" onClick={performContractSearch}>
                  <i className="fas fa-search"></i>
                  اجرای جستجو
                </button>
                <button className="btn-clear" onClick={clearContractFilters}>
                  <i className="fas fa-eraser"></i>
                  پاک کردن فیلترها
                </button>
              </div>
            </div>

            <div className="filters-grid">
              <div className="filter-group">
                <label>وضعیت قرارداد:</label>
                <select
                  value={contractFilters.status}
                  onChange={(e) => handleContractFilterChange('status', e.target.value)}
                >
                  <option value="">همه وضعیت‌ها</option>
                  <option value="active">فعال</option>
                  <option value="pending">در انتظار</option>
                  <option value="expired">منقضی</option>
                </select>
              </div>

              <div className="filter-group">
                <label>از تاریخ:</label>
                <DatePicker
                  value={contractFilters.dateFrom || ""}
  
                   onChange={(date) =>
    handleContractFilterChange(
      "dateFrom",
      date ? date.toDate() : null
    )
  }
                  format="YYYY/MM/DD"
                  calendar={persian}
                  locale={persian_fa}
                />
              </div>

              <div className="filter-group">
                <label>تا تاریخ:</label>
                <DatePicker
                  value={contractFilters.dateTo || ""}
              
                   onChange={(date) =>
    handleContractFilterChange(
      "dateTo",
      date ? date.toDate() : null
    )
  }
                  format="YYYY/MM/DD"
                    calendar={persian}
                  locale={persian_fa}
                />
              </div>
            </div>

            <div className="summary-cards">
              <div className="summary-card">
                <div className="card-icon" style={{backgroundColor: 'rgba(102, 126, 234, 0.1)'}}>
                  <i className="fas fa-file-contract" style={{color: '#667eea'}}></i>
                </div>
                <div className="card-content">
                  <h4>تعداد کل قراردادها</h4>
                  <p className="card-value">{contractSummary.totalContracts}</p>
                </div>
              </div>

              <div className="summary-card">
                <div className="card-icon" style={{backgroundColor: 'rgba(0, 184, 148, 0.1)'}}>
                  <i className="fas fa-check-circle" style={{color: '#00b894'}}></i>
                </div>
                <div className="card-content">
                  <h4>قراردادهای فعال</h4>
                  <p className="card-value">{contractSummary.activeContracts}</p>
                </div>
              </div>

              <div className="summary-card">
                <div className="card-icon" style={{backgroundColor: 'rgba(255, 193, 7, 0.1)'}}>
                  <i className="fas fa-money-bill-wave" style={{color: '#ffc107'}}></i>
                </div>
                <div className="card-content">
                  <h4>کل مبلغ بدهی</h4>
                  <p className="card-value">{contractSummary.totalDebt.toLocaleString('fa-IR')} تومان</p>
                </div>
              </div>

              <div className="summary-card">
                <div className="card-icon" style={{backgroundColor: 'rgba(76, 175, 80, 0.1)'}}>
                  <i className="fas fa-coins" style={{color: '#4caf50'}}></i>
                </div>
                <div className="card-content">
                  <h4>کل مبلغ واریزی</h4>
                  <p className="card-value">{contractSummary.totalPaid.toLocaleString('fa-IR')} تومان</p>
                </div>
              </div>

              <div className="summary-card">
                <div className="card-icon" style={{backgroundColor: 'rgba(244, 67, 54, 0.1)'}}>
                  <i className="fas fa-balance-scale" style={{color: '#f44336'}}></i>
                </div>
                <div className="card-content">
                  <h4>مانده کل حساب‌ها</h4>
                  <p className={`card-value ${contractSummary.totalBalance >= 0 ? 'positive' : 'negative'}`}>
                    {contractSummary.totalBalance.toLocaleString('fa-IR')} تومان
                  </p>
                </div>
              </div>

              <div className="summary-card">
                <div className="card-icon" style={{backgroundColor: 'rgba(156, 39, 176, 0.1)'}}>
                  <i className="fas fa-calendar-alt" style={{color: '#9c27b0'}}></i>
                </div>
                <div className="card-content">
                  <h4>واریزی دوره</h4>
                  <p className="card-value">{contractSummary.periodTotalPaid.toLocaleString('fa-IR')} تومان</p>
                </div>
              </div>

              <div className="summary-card">
                <div className="card-icon" style={{backgroundColor: 'rgba(33, 150, 243, 0.1)'}}>
                  <i className="fas fa-stethoscope" style={{color: '#2196f3'}}></i>
                </div>
                <div className="card-content">
                  <h4>جلسات بیمه‌ای</h4>
                  <p className="card-value">{contractSummary.totalInsuranceSessions}</p>
                </div>
              </div>

              <div className="summary-card">
                <div className="card-icon" style={{backgroundColor: 'rgba(76, 175, 80, 0.1)'}}>
                  <i className="fas fa-money-check-alt" style={{color: '#4caf50'}}></i>
                </div>
                <div className="card-content">
                  <h4>پرداختی بیمه</h4>
                  <p className="card-value">{contractSummary.totalInsuranceShare.toLocaleString('fa-IR')} تومان</p>
                </div>
              </div>

              <div className="summary-card">
                <div className="card-icon" style={{backgroundColor: 'rgba(255, 152, 0, 0.1)'}}>
                  <i className="fas fa-hand-holding-usd" style={{color: '#ff9800'}}></i>
                </div>
                <div className="card-content">
                  <h4>باقیمانده از مراجع</h4>
                  <p className="card-value">{contractSummary.totalRemainingFromPatients.toLocaleString('fa-IR')} تومان</p>
                </div>
              </div>
            </div>
          </div>

          <div className="results-section">
            <div className="results-header">
              <h3>
                گزارش قراردادهای بیمه ({insuranceReports.length} قرارداد)
              </h3>
              <div className="export-buttons">
                <button className="btn-export excel" onClick={exportToExcel}>
                  <i className="fas fa-file-excel"></i>
                  خروجی Excel
                </button>
                <button className="btn-export pdf" onClick={exportToPDF}>
                  <i className="fas fa-file-pdf"></i>
                  خروجی PDF
                </button>
              </div>
            </div>

            <div className="results-table-container">
              <table className="results-table">
                <thead>
                  <tr>
                    <th  onClick={() => handleSort('name')}>
                      شرکت بیمه
                      {sortConfig.key === 'name' && (
                        <i className={`fas fa-arrow-${sortConfig.direction === 'asc' ? 'up' : 'down'}`}></i>
                      )}
                    </th>
                    <th>کد قرارداد</th>
                    <th>مسئول</th>
                    <th>تلفن</th>
                    <th>وضعیت</th>
                    <th onClick={() => handleSort('totalDebtAmount')}>
                      بدهی کل
                      {sortConfig.key === 'totalDebtAmount' && (
                        <i className={`fas fa-arrow-${sortConfig.direction === 'asc' ? 'up' : 'down'}`}></i>
                      )}
                    </th>
                    <th onClick={() => handleSort('totalPaidAmount')}>
                      واریزی کل
                      {sortConfig.key === 'totalPaidAmount' && (
                        <i className={`fas fa-arrow-${sortConfig.direction === 'asc' ? 'up' : 'down'}`}></i>
                      )}
                    </th>
                    <th onClick={() => handleSort('currentBalance')}>
                      مانده حساب
                      {sortConfig.key === 'currentBalance' && (
                        <i className={`fas fa-arrow-${sortConfig.direction === 'asc' ? 'up' : 'down'}`}></i>
                      )}
                    </th>
                    <th onClick={() => handleSort('periodPaid')}>
                      واریزی دوره
                      {sortConfig.key === 'periodPaid' && (
                        <i className={`fas fa-arrow-${sortConfig.direction === 'asc' ? 'up' : 'down'}`}></i>
                      )}
                    </th>
                    <th>جلسات بیمه‌ای</th>
                    <th>مبلغ کل جلسات</th>
                    <th>پرداختی بیمه</th>
                    <th>باقیمانده از مراجع</th>
                    <th>تاریخ آخرین واریز</th>
                    <th>خدمات تحت پوشش</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="11" className="loading-cell">در حال بارگذاری...</td>
                    </tr>
                  ) : (
                    currentItems.map((contract) => (
                      <tr key={contract.id}>
                        <td>
                          <div className="insurance-cell">
                            <i className="fas fa-shield-alt"></i>
                            {contract.name}
                          </div>
                        </td>
                        <td>{contract.code}</td>
                        <td>{contract.contactPerson}</td>
                        <td>{contract.phone}</td>
                        <td>{getStatusBadge(contract.status)}</td>
                        <td>
                          <div className="amount-cell debt-amount">
                            {contract.totalDebtAmount.toLocaleString('fa-IR')}
                            <small>تومان</small>
                          </div>
                        </td>
                        <td>
                          <div className="amount-cell paid-amount">
                            {contract.totalPaidAmount.toLocaleString('fa-IR')}
                            <small>تومان</small>
                          </div>
                        </td>
                        <td>
                          <div className={`amount-cell balance-amount ${contract.currentBalance >= 0 ? 'positive' : 'negative'}`}>
                            {contract.currentBalance.toLocaleString('fa-IR')}
                            <small>تومان</small>
                          </div>
                        </td>
                        <td>
                          <div className="amount-cell period-amount">
                            {contract.periodPaid.toLocaleString('fa-IR')}
                            <small>تومان</small>
                            <div className="period-count">({contract.periodPayments} پرداخت)</div>
                          </div>
                        </td>
                        <td>
                          <div className="session-count">
                            {contract.totalInsuranceSessions}
                          </div>
                        </td>
                        <td>
                          <div className="amount-cell total-amount">
                            {contract.totalInsuranceAmount?.toLocaleString('fa-IR') || 0}
                            <small>تومان</small>
                          </div>
                        </td>
                        <td>
                          <div className="amount-cell insurance-share">
                            {contract.totalInsuranceShare?.toLocaleString('fa-IR') || 0}
                            <small>تومان</small>
                          </div>
                        </td>
                        <td>
                          <div className="amount-cell remaining-amount">
                            {contract.remainingFromPatients?.toLocaleString('fa-IR') || 0}
                            <small>تومان</small>
                          </div>
                        </td>
                        <td>
                          {contract.lastPaymentDate ?
                            new Date(contract.lastPaymentDate).toLocaleDateString('fa-IR') :
                            '-'
                          }
                        </td>
                        <td>
                          <div className="coverage-tags">
                            {contract.coverage.slice(0, 2).map((service, index) => (
                              <span key={index} className="coverage-tag">{service}</span>
                            ))}
                            {contract.coverage.length > 2 && (
                              <span className="coverage-tag more">+{contract.coverage.length - 2}</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {!loading && insuranceReports.length === 0 && (
                <div className="no-results">
                  <i className="fas fa-search"></i>
                  <p>هیچ بیمه‌ای با فیلترهای انتخاب شده یافت نشد</p>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => setContractCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={contractCurrentPage === 1}
                >
                  <i className="fas fa-chevron-right"></i>
                  قبلی
                </button>

                <div className="page-info">
                  صفحه {contractCurrentPage} از {totalPages}
                </div>

                <div className="page-numbers">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (contractCurrentPage <= 3) {
                      pageNum = i + 1;
                    } else if (contractCurrentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = contractCurrentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        className={`page-number ${contractCurrentPage === pageNum ? 'active' : ''}`}
                        onClick={() => setContractCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  className="pagination-btn"
                  onClick={() => setContractCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={contractCurrentPage === totalPages}
                >
                  بعدی
                  <i className="fas fa-chevron-left"></i>
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* تب تراکنش‌ها */}
      {activeTab === 'transactions' && (
        <>
          <div className="search-panel">
            <div className="search-header">
              <h3>
                <i className="fas fa-search"></i>
                جستجوی پیشرفته تراکنش‌ها
              </h3>
              <div className="search-actions">
                <button className="btn-search" onClick={performTransactionSearch}>
                  <i className="fas fa-search"></i>
                  اجرای جستجو
                </button>
                <button className="btn-clear" onClick={clearTransactionFilters}>
                  <i className="fas fa-eraser"></i>
                  پاک کردن فیلترها
                </button>
              </div>
            </div>

            <div className="filters-grid">
              <div className="filter-group">
                <label>شرکت بیمه:</label>
                <select style={{color:"red"}}
                  value={transactionFilters.insuranceContract}
                  onChange={(e) => handleTransactionFilterChange('insuranceContract', e.target.value)}
                >
                  <option value="">همه شرکت‌ها</option>
                  {allInsurances && Array.isArray(allInsurances)?allInsurances.map(insurance => (
                    <option key={insurance._id} value={insurance._id}>
                      {insurance.name}
                    </option>
                  )):(
                    <option>
                      خطا در بارگزاری از سرور!
                    </option>
                  )}
                </select>
              </div>

              <div className="filter-group">
                <label>از تاریخ:</label>
                <DatePicker
                  value={transactionFilters.dateFrom || ""}
                  onChange={(date) =>
    handleTransactionFilterChange(
      "dateFrom",
      date ? date.toDate() : null
    )
  }
                  format="YYYY/MM/DD"
                   calendar={persian}
                  locale={persian_fa}
                />
              </div>

              <div className="filter-group">
                <label>تا تاریخ:</label>
                <DatePicker
                  value={transactionFilters.dateTo || ""}

                  onChange={(date) =>
    handleTransactionFilterChange(
      "dateTo",
      date ? date.toDate() : null
    )
  }
                  format="YYYY/MM/DD"
                    calendar={persian}
                  locale={persian_fa}
                />
              </div>

              <div className="filter-group">
                <label>حداقل مبلغ:</label>
                <input
                  type="number"
                  value={transactionFilters.minAmount}
                  onChange={(e) => handleTransactionFilterChange('minAmount', e.target.value)}
                  placeholder="تومان"
                />
              </div>

              <div className="filter-group">
                <label>حداکثر مبلغ:</label>
                <input
                  type="number"
                  value={transactionFilters.maxAmount}
                  onChange={(e) => handleTransactionFilterChange('maxAmount', e.target.value)}
                  placeholder="تومان"
                />
              </div>
            </div>

            <div className="summary-cards">
              <div className="summary-card">
                <div className="card-icon" style={{backgroundColor: 'rgba(102, 126, 234, 0.1)'}}>
                  <i className="fas fa-receipt" style={{color: '#667eea'}}></i>
                </div>
                <div className="card-content">
                  <h4>کل تراکنش‌ها</h4>
                  <p className="card-value">{transactionSummary.transactionCount}</p>
                </div>
              </div>

              <div className="summary-card">
                <div className="card-icon" style={{backgroundColor: 'rgba(76, 175, 80, 0.1)'}}>
                  <i className="fas fa-money-bill-wave" style={{color: '#4caf50'}}></i>
                </div>
                <div className="card-content">
                  <h4>مجموع پرداخت‌ها</h4>
                  <p className="card-value">{transactionSummary.totalAmount.toLocaleString('fa-IR')} تومان</p>
                </div>
              </div>

              <div className="summary-card">
                <div className="card-icon" style={{backgroundColor: 'rgba(255, 193, 7, 0.1)'}}>
                  <i className="fas fa-calculator" style={{color: '#ffc107'}}></i>
                </div>
                <div className="card-content">
                  <h4>میانگین پرداخت</h4>
                  <p className="card-value">{Math.round(transactionSummary.averageAmount).toLocaleString('fa-IR')} تومان</p>
                </div>
              </div>
            </div>
          </div>

          <div className="results-section">
            <div className="results-header">
              <h3>لیست تراکنش‌های بیمه ({transactions.length} تراکنش)</h3>
            </div>

            <div className="results-table-container">
              {loading ? (
                <div className="loading">در حال بارگذاری...</div>
              ) : (
                <table className="results-table">
                  <thead>
                    <tr>
                      <th>تاریخ پرداخت</th>
                      <th>شرکت بیمه</th>
                      <th>کد قرارداد</th>
                      <th>مبلغ پرداخت</th>
                      <th>نوع پرداخت</th>
                      <th>شماره ارجاع</th>
                      <th>توضیحات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction._id}>
                        <td>{new Date(transaction.date).toLocaleDateString('fa-IR')}</td>
                        <td>{transaction.insuranceContract?.name || '-'}</td>
                        <td>{transaction.insuranceContract?.code || '-'}</td>
                        <td>{transaction.amount.toLocaleString('fa-IR')} تومان</td>
                        <td>{transaction.paymentType || 'partial'}</td>
                        <td>{transaction.reference || '-'}</td>
                        <td>{transaction.description || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {!loading && transactions.length === 0 && (
                <div className="no-results">
                  <i className="fas fa-search"></i>
                  <p>هیچ تراکنشی با فیلترهای انتخاب شده یافت نشد</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === 'patient-debts' && (
        <>
          <div className="search-panel">
            <div className="search-header">
              <h3>
                <i className="fas fa-search"></i>
                جستجوی بدهی‌های بیمه‌ای مراجعین
              </h3>
              <div className="search-actions">
                <button className="btn-search" onClick={performPatientDebtSearch}>
                  <i className="fas fa-search"></i>
                  جستجو
                </button>
                <button className="btn-clear" onClick={clearPatientDebtFilters}>
                  <i className="fas fa-times"></i>
                  پاک کردن فیلترها
                </button>
              </div>
            </div>

            <div className="filter-grid">
              <div className="filter-group">
                <label>از تاریخ:</label>
                <DatePicker
                  value={patientDebtFilters.dateFrom || ""}
                  onChange={(date) =>
    handlePatientDebtFilterChange(
      "dateFrom",
      date ? date.toDate() : null
    )
  }
                  format="YYYY/MM/DD"
                  calendar={persian}
                  locale={persian_fa}
                />
              </div>

              <div className="filter-group">
                <label>تا تاریخ:</label>
                <DatePicker
                  value={patientDebtFilters.dateTo || ""}
                  onChange={(date) =>
    handlePatientDebtFilterChange(
      "dateTo",
      date ? date.toDate() : null
    )
  }
                  format="YYYY/MM/DD"
                  calendar={persian}
                  locale={persian_fa}
                />
              </div>

              <div style={{color:"black"}} className="filter-group">
                <label>شرکت بیمه:</label>
                <select style={{color:"black"}} 
                  value={patientDebtFilters.insuranceContract}
                  onChange={(e) => handlePatientDebtFilterChange('insuranceContract', e.target.value)}
                >
                  <option value="">همه شرکت‌ها</option>
                  {allInsurances && Array.isArray(allInsurances)? allInsurances.map(insurance => (
                    <option key={insurance._id} value={insurance._id}>
                      {insurance.name}
                    </option>
                  )):(
                    <option>
                      خطا در بارگزاری از سرور!
                    </option>
                  )}
                </select>
              </div>

              <div className="filter-group">
                <label>نام مراجع:</label>
                <input style={{color:"black"}}
                  type="text"
                  value={patientDebtFilters.patientName}
                  onChange={(e) => handlePatientDebtFilterChange('patientName', e.target.value)}
                  placeholder="جستجو بر اساس نام"
                />
              </div>

              <div className="filter-group">
                <label>وضعیت:</label>
                <select
                style={{color:"black"}}
                  value={patientDebtFilters.status}
                  onChange={(e) => handlePatientDebtFilterChange('status', e.target.value)}
                >
                  <option value="all">همه</option>
                  <option value="paid">پرداخت شده</option>
                  <option value="unpaid">بدهکار</option>
                </select>
              </div>
            </div>
          </div>

          <div className="results-section">
            <div className="results-header">
              <h3>لیست بدهی‌های بیمه‌ای مراجعین</h3>
              <div className="results-actions">
                <button className="btn-export" onClick={exportToExcel}>
                  <i className="fas fa-file-excel"></i>
                  خروجی Excel
                </button>
                <button className="btn-export" onClick={exportToPDF}>
                  <i className="fas fa-file-pdf"></i>
                  خروجی PDF
                </button>
              </div>
            </div>

            <div className="insurance-reports .summary-cards">
              <div className="summary-card">
                <div className="card-icon" style={{backgroundColor: 'rgba(52, 152, 219, 0.1)'}}>
                  <i className="fas fa-users" style={{color: '#3498db'}}></i>
                </div>
                <div className="card-content">
                  <h4>کل مراجعین</h4>
                  <p className="card-value">{patientDebtSummary?.totalPatients}</p>
                </div>
              </div>

              <div className="summary-card">
                <div className="card-icon" style={{backgroundColor: 'rgba(46, 204, 113, 0.1)'}}>
                  <i className="fas fa-stethoscope" style={{color: '#2ecc71'}}></i>
                </div>
                <div className="card-content">
                  <h4>کل جلسات</h4>
                  <p className="card-value">{patientDebtSummary?.totalSessions}</p>
                </div>
              </div>

              <div className="summary-card">
                <div className="card-icon" style={{backgroundColor: 'rgba(155, 89, 182, 0.1)'}}>
                  <i className="fas fa-money-bill-wave" style={{color: '#9b59b6'}}></i>
                </div>
                <div className="card-content">
                  <h4>کل مبلغ بیمه</h4>
                  <p className="card-value">{patientDebtSummary?.totalInsuranceAmount.toLocaleString('fa-IR')} تومان</p>
                </div>
              </div>

              <div className="summary-card">
                <div className="card-icon" style={{backgroundColor: 'rgba(230, 126, 34, 0.1)'}}>
                  <i className="fas fa-hand-holding-usd" style={{color: '#e67e22'}}></i>
                </div>
                <div className="card-content">
                  <h4>سهم بیمه</h4>
                  <p className="card-value">{patientDebtSummary?.totalInsuranceShare.toLocaleString('fa-IR')} تومان</p>
                </div>
              </div>

              <div className="summary-card">
                <div className="card-icon" style={{backgroundColor: 'rgba(231, 76, 60, 0.1)'}}>
                  <i className="fas fa-wallet" style={{color: '#e74c3c'}}></i>
                </div>
                <div className="card-content">
                  <h4>بدهی مراجعین</h4>
                  <p className="card-value">{patientDebtSummary?.totalPatientShare.toLocaleString('fa-IR')} تومان</p>
                </div>
              </div>
            </div>

            <div className="results-table-container">
              <table className="results-table">
                <thead>
                  <tr>
                    <th>نام مراجع</th>
                    <th>تلفن</th>
                    <th>شرکت بیمه</th>
                    <th>نوع بیمه</th>
                    <th>تعداد جلسات</th>
                    <th>کل مبلغ</th>
                    <th>سهم بیمه</th>
                    <th>بدهی مراجع</th>
                    <th>عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="9" className="loading-cell">در حال بارگذاری...</td>
                    </tr>
                  ) : (
                    patientDebts.map((patient) => (
                      <tr key={patient.patientId}>
                        <td>{patient.patientName}</td>
                        <td>{patient.patientPhone || '-'}</td>
                        <td>{patient.insuranceName}</td>
                        <td>{patient.patientBimehKind || '-'}</td>
                        <td>{patient.totalSessions}</td>
                        <td>{patient.totalAmount.toLocaleString('fa-IR')} تومان</td>
                        <td>{patient.totalInsuranceShare.toLocaleString('fa-IR')} تومان</td>
                        <td>
                          <span className={patient.totalPatientShare > 0 ? 'debt-amount' : 'paid-amount'}>
                            {patient.totalPatientShare.toLocaleString('fa-IR')} تومان
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn-detail"
                            onClick={() => alert(`جزئیات بدهی ${patient.patientName}`)}
                          >
                            <i className="fas fa-eye"></i>
                            جزئیات
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {!loading && patientDebts.length === 0 && (
                <div className="no-results">
                  <i className="fas fa-search"></i>
                  <p>هیچ بدهی بیمه‌ای با فیلترهای انتخاب شده یافت نشد</p>
                </div>
              )}
            </div>

            {/* Pagination for patient debts */}
            {patientDebts.length > 0 && (
              <div className="pagination-container">
                <button
                  className="pagination-btn"
                  disabled={patientDebtCurrentPage === 1}
                  onClick={() => setPatientDebtCurrentPage(prev => prev - 1)}
                >
                  قبلی
                </button>

                <span className="pagination-info">
                  صفحه {patientDebtCurrentPage} از {Math.ceil(patientDebtSummary.totalPatients / itemsPerPage)}
                </span>

                <button
                  className="pagination-btn"
                  disabled={patientDebtCurrentPage >= Math.ceil(patientDebtSummary.totalPatients / itemsPerPage)}
                  onClick={() => setPatientDebtCurrentPage(prev => prev + 1)}
                >
                  بعدی
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default InsuranceReports;