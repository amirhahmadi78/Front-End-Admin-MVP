import { useState, useEffect, useRef, useMemo } from "react";
import "./therapistFinance.css";

import moment from "moment-jalaali";
import { useTherapists } from "../../hooks/therapist";

import type {
  DTOfinanceMonthSalaryTH,
  DTOget_finance_TH_PA,
} from "../../types/finance";
import { useFinanceMounthSalary_TH, useFinanceTH_PA } from "../../hooks/finance";
import { ModalLoading } from "../loadingOverlay/LoadingOverlay";
import Pagination from "../util/pagination";

const TherapistFinance = () => {
  const limit=10
  const [page, setPage] = useState<number>(1);
  const { data: therapists } = useTherapists();
  const [query, setQuery] = useState<DTOget_finance_TH_PA | null>();
  const [querysalary, setQuerysalary] =
    useState<DTOfinanceMonthSalaryTH | null>(null);
  const [search, setSearch] = useState("");
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [month, setMonth] = useState(moment().jMonth() + 1);
  const [year, setYear] = useState(moment().jYear());

  const [showTherapistList, setShowTherapistList] = useState(false);

  const [expandedSections, setExpandedSections] = useState({
    dailyIncome: false,
    payments: false,
  });

  const listRef = useRef(null);
  const { data: financialData,isLoading:loadingFinance, refetch: fetchData } = useFinanceTH_PA(query);
 
  const { data: SalaryData,isLoading:loadingSalary, refetch: fetchDataSalary } = useFinanceMounthSalary_TH(querysalary);

  const loading = loadingFinance || loadingSalary;
useEffect(() => {
  if (!query) return;

  setQuery(prev => prev ? { ...prev, page, limit } : prev);
}, [page]);

const clearSearch = () => {
   setSearch("");
  inputRef.current?.focus();
};
useEffect(() => {
  if (!selectedTherapist || !year || !month) return;

  setPage(1); // ✅ ریست صفحه

  const therapistId = selectedTherapist._id;

  const queryget: DTOget_finance_TH_PA = {
    startDay: moment(`${year}/${month}/01`, "jYYYY/jM/jD")
      .startOf("jMonth")
      .format("YYYY-MM-DD"),
    endDay: moment(`${year}/${month}/01`, "jYYYY/jM/jD")
      .endOf("jMonth")
      .format("YYYY-MM-DD"),
    therapistId,
    page,      // ✅ اضافه می‌کنیم
    limit,     // ✅ اضافه می‌کنیم
  };

  setQuery(queryget);

  const querygetsalary = {
    YYYYMM: year + "-" + (month < 10 ? "0" + month : month),
    therapistId,
  };

  setQuerysalary(querygetsalary);
}, [selectedTherapist, month, year]);

  useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (
      boxRef.current &&
      !boxRef.current.contains(event.target as Node) &&
      listRef.current &&
      !listRef.current.contains(event.target as Node)
    ) {
      setShowTherapistList(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

const boxRef = useRef<HTMLDivElement | null>(null);
const inputRef = useRef<HTMLInputElement | null>(null);


  const payments = SalaryData?.salaries || [];
  const monthSalary = SalaryData?.monthsalary || 0;
  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };



  useEffect(() => {
     if (!selectedTherapist||!year||!month) return;

    const therapistId = selectedTherapist._id;
    const queryget: DTOget_finance_TH_PA = {
      startDay: moment(`${year}/${month}/01`, "jYYYY/jM/jD")
      .startOf("jMonth")
      .format("YYYY-MM-DD"),
      endDay: moment(`${year}/${month}/01`, "jYYYY/jM/jD")
      .endOf("jMonth")
      .format("YYYY-MM-DD"),
       therapistId,
       page,
       limit
    };

    setQuery(queryget);

    const querygetsalary = {
      YYYYMM:year + "-" + (month < 10 ? "0" + month : month),
      therapistId,
    };
    setQuerysalary(querygetsalary);
  }, [selectedTherapist, month, year]);


  useEffect(() => {
    if (query == null || querysalary == null) return;
    fetchData();
    fetchDataSalary();
  }, [query, querysalary]);
  // فیلتر کردن درمانگرها بر اساس جستجو
const filteredTherapists = useMemo(() => {
  if (!therapists||!Array.isArray(therapists)) return [];
  const q = search.trim().toLowerCase();
  if (!q) return therapists;
  return therapists.filter(t =>
    `${t.firstName || ""} ${t.lastName || ""}`
      .toLowerCase()
      .includes(q)
  );
}, [therapists, search]);

  const handleTherapistSelect = (therapist) => {
    setSelectedTherapist(therapist);
    setSearch(`${therapist.firstName} ${therapist.lastName}`);
    setShowTherapistList(false);

    clearSearch()
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    setShowTherapistList(true);

    // اگر جستجو پاک شد، درمانگر انتخاب شده رو هم پاک کن
    if (!value.trim()) {
      setSelectedTherapist(null);
    }
  };

  const handleSearchFocus = () => {
    setShowTherapistList(true);
  };

  // محاسبات مالی
  const totalPayment = payments
    .filter((p) => p.type === "payment")
    .reduce((sum, p) => sum + (p.fee || 0), 0);

  const totalRefund = Math.round(payments
    .filter((p) => p.type === "refund")
    .reduce((sum, p) => sum + (p.fee || 0), 0))

  const totalIncome = Math.round(financialData?.TotalFinancial || 0)

  let therapistIncome = Math.round(financialData?.therapistIncome || 0)
  let clinicIncome = Math.round(financialData?.clinicIncome || 0)
  const remaining = therapistIncome - totalPayment + totalRefund;
  return (
    <div className="therapist-finance">
      <div className="finance-header">
        <h3>💰 امور مالی درمانگران</h3>
      </div>

      {/* بخش جستجو */}
      <div className="search-section">
        <div className="search-container">
          <div className="search-box" ref={boxRef}>
            <input
              ref={inputRef}
              type="text"
              placeholder="جستجوی درمانگر (اسم یا فامیلی)..."
              value={search}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              className="search-input"
            />
            
          </div>

          {showTherapistList && filteredTherapists.length > 0 && (
            <div className="therapist-dropdown" ref={listRef}>
              <div className="dropdown-list">
                {Array.isArray(filteredTherapists)&&filteredTherapists.map((t) => (
                  <div
                    key={t._id}
                    className={`dropdown-item ${
                      selectedTherapist?._id === t._id ? "selected" : ""
                    }`}
                    onClick={() =>{
                      handleTherapistSelect(t)
                                   setShowTherapistList(false)
                    } }
                  >
                    <span className="therapist-name">
                      {t.firstName} {t.lastName}
                    </span>
                    {t.phone && (
                      <span className="therapist-phone">{t.phone}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {showTherapistList && filteredTherapists.length === 0 && search && (
            <div className="no-results" ref={listRef}>
              درمانگری یافت نشد
            </div>
          )}
        </div>

        {selectedTherapist && (
          <div className="selected-therapist-info">
            <div className="selected-badge">
              <span className="selected-name">
                درمانگر انتخاب شده:{" "}
                <strong>
                  {selectedTherapist.firstName} {selectedTherapist.lastName}
                </strong>
              </span>
              <button
                className="clear-btn"
                onClick={() => {
                  setSelectedTherapist(null);
     
                  setSearch("");
                }}
              >
                ✕ حذف
              </button>
            </div>
          </div>
        )}
      </div>

      {/* انتخاب ماه و سال */}
      {selectedTherapist && (
        <div className="date-filters">
          <div className="filter-group">
            <div className="filter-item">
              <label>📅 ماه:</label>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="filter-select"
                disabled={loading}
              >
                <option value="1">فروردین</option>
                <option value="2">اردیبهشت</option>
                <option value="3">خرداد</option>
                <option value="4">تیر</option>
                <option value="5">مرداد</option>
                <option value="6">شهریور</option>
                <option value="7">مهر</option>
                <option value="8">آبان</option>
                <option value="9">آذر</option>
                <option value="10">دی</option>
                <option value="11">بهمن</option>
                <option value="12">اسفند</option>
              </select>
            </div>

            <div className="filter-item">
              <label>📅 سال:</label>
              <select
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                min="1400"
                max="1420"
                className="year-input"
                disabled={loading}
              >
                <option value="1404">1404</option>
                <option value="1405">1405</option>
                <option value="1406">1406</option>
                <option value="1407">1407</option>
                <option value="1408">1408</option>
                <option value="1409">1409</option>
                <option value="1410">1410</option>
                <option value="1411">1411</option>
                <option value="1412">1412</option>
                <option value="1413">1413</option>
                <option value="1414">1414</option>
                <option value="1415">1415</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* نمایش بارگذاری */}
      {loading && ModalLoading()}

      {/* کارت‌های خلاصه مالی */}
      {financialData && !loading && (
        <div className="financial-summary">
          <div className="summary-cards">
            <div className="summary-card total-income">
              <h4>📊 کل درآمد ماه</h4>
              <p className="amount">
                {totalIncome.toLocaleString()}
                <span> تومان</span>
              </p>
            </div>
            <div className="summary-card total-income">
              <h4>📊 کل سهم درمانگر</h4>
              <p className="amount">
                {therapistIncome.toLocaleString()}
                <span> تومان</span>
              </p>
            </div>
            <div className="summary-card total-income">
              <h4>📊 کل سهم کلینیک</h4>
              <p className="amount">
                {clinicIncome.toLocaleString()}
                <span> تومان</span>
              </p>
            </div>
            <div className="summary-card paid">
              <h4>💸   حقوق پرداخت‌شده به درمانگر</h4>
              <p className="amount">
                {totalPayment.toLocaleString()}
                <span> تومان</span>
              </p>
            </div>

            <div className="summary-card refunded">
              <h4>↪️ بازگشت‌شده از درمانگر</h4>
              <p className="amount">
                {totalRefund.toLocaleString()}
                <span> تومان</span>
              </p>
            </div>

            <div className="summary-card remaining">
              <h4>⏳ باقی‌مانده</h4>
              <p className="amount">
                {remaining.toLocaleString()}
                <span> تومان</span>
              </p>
            </div>
          </div>

          {/* بخش درآمد روزانه */}
          {/* بخش درآمد روزانه */}
          <div className="data-section">
            <div
              className="section-title clickable"
              onClick={() => toggleSection("dailyIncome")}
            >
              <h4>
                📈 جزئیات درآمد ماهانه
                <span className="toggle-icon">
                  {expandedSections.dailyIncome ? "▲" : "▼"}
                </span>
              </h4>
              <span className="count-badge">
                {financialData?.pagination.totalReports || 0} مورد

              </span>
            </div>

            {expandedSections.dailyIncome && (
              <div className="section-content">
                {!financialData.reports ||
                financialData.reports.length === 0 ? (
                  <div className="empty-state">
                    <p>⛔️ هیچ تراکنش مالی در این ماه ثبت نشده است</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>تاریخ</th>
                          <th>نام مراجع</th>
                          <th>مبلغ پرداختی</th>
                          <th>سهم درمانگر</th>
                        </tr>
                      </thead>
                      <tbody>
                        {financialData.reports.map((r, i) => (
                          <tr key={i}>
                            <td>
                              {moment(r?.localDay).format("jYYYY/jMM/jDD")}
                            </td>
                            <td>{r?.patientName || "جلسه ی گروهی"}</td>
                            <td className="amount-cell">
                              {(r.patientFee || 0).toLocaleString()} تومان
                            </td>
                           <td>{r.therapistShare?.toLocaleString()  || "نامشخص"} تومان</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <Pagination page={page} setPage={setPage} totalPages={(financialData.pagination.totalPages)||0}/>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* بخش پرداختی‌ها */}
          {/* بخش پرداختی‌ها */}
          <div className="data-section">
            <div
              className="section-title clickable"
              onClick={() => toggleSection("payments")}
            >
              <h4>
                💳 تراکنش‌های حقوق
                <span className="toggle-icon">
                  {expandedSections.payments ? "▲" : "▼"}
                </span>
              </h4>
              <span className="count-badge">{payments.length} مورد</span>
            </div>

            {expandedSections.payments && (
              <div className="section-content">
                {payments.length === 0 ? (
                  <div className="empty-state">
                    <p>⛔️ هیچ تراکنش حقوقی در این ماه ثبت نشده است</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="data-table payments-table">
                      <thead>
                        <tr>
                          <th>تاریخ</th>
                          <th>نوع</th>
                          <th>مبلغ</th>
                          <th>روش پرداخت</th>
                          <th>توسط</th>
                          <th>توضیحات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((p, i) => (
                          <tr
                            key={p._id || i}
                            className={
                              p.type === "refund" ? "refund-row" : "payment-row"
                            }
                          >
                            <td>{p.payDate || "نامشخص"}</td>
                            <td>
                              <span className={`type-badge ${p.type}`}>
                                {p.type === "payment" ? "واریز" : "بازگشت"}
                              </span>
                            </td>
                            <td
                              className={`amount-cell ${p.type === "refund" ? "refund-amount" : ""}`}
                            >
                              {p.type === "refund" && "⛔ "}
                              {(p.fee || 0).toLocaleString()} تومان
                            </td>
                            <td>
                              {p.payment === "cash" && "💵 نقدی"}
                              {p.payment === "sheba" && "🏦 شبا"}
                              {p.payment === "cart" && "💳 کارت"}
                              {p.payment === "satna" && "⚡ ساتنا"}
                              {p.payment === "havale" && "📤 حواله"}
                              {!p.payment && "نامشخص"}
                            </td>
                            <td>{p.payBy?.fullName || "نامشخص"}</td>
                            <td>{p.note || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* پیام انتخاب درمانگر */}
      {!selectedTherapist && !loading && (
        <div className="placeholder-message">
          <div className="placeholder-content">
            <div className="placeholder-icon">👨‍⚕️</div>
            <h3>لطفاً یک درمانگر انتخاب کنید</h3>
            <p>
              برای مشاهده اطلاعات مالی، ابتدا از کادر جستجو بالای صفحه یک
              درمانگر انتخاب نمایید.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapistFinance;
