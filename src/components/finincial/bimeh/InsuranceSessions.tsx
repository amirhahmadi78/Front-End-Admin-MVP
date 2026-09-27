import { useState, useEffect, useRef } from "react";
import "./InsuranceSessions.css";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";


import moment from "moment-jalaali";


import { useFinantialFindAppointments } from "../../../hooks/finance";
import { LoadingOverlay } from "../../loadingOverlay/LoadingOverlay";
import { useGetFintInsuranceContract } from "../../../hooks/insurance";


const InsuranceSessions = () => {
const paramsRef = useRef({
  status_clinic: "bimeh",
  page: 1,
  limit: 10,
});

  const {
    data: sessionsData,
    refetch: sessionFetch,
    isLoading: sessionLoading,
  } = useFinantialFindAppointments(paramsRef.current);
  const sessions= sessionsData?.AppList || [];
  const {data:insurances,isLoading:insuranceLoading , refetch:insuranceRefetch} = useGetFintInsuranceContract()
  insuranceRefetch()
  const loading=sessionLoading||insuranceLoading
  const [filters, setFilters] = useState({
    insuranceType: "",
    start: null,
    end: null,
    status_clinic: "bimeh",
    patientName: "",
    therapistName: "",
  });


  const summary = {
    totalSessions: sessionsData?.Amar?.[0]?.count || 0,
    totalAmount: sessionsData?.Amar?.[0]?.totalAmount || 0,
    totalPaid: sessionsData?.Amar?.[0]?.totalBimeh || 0,
    totalUnpaid:
      sessionsData?.Amar?.[0]?.totalAmount -
        sessionsData?.Amar?.[0]?.totalBimeh || 0,
    insuranceCount: insurances?.length || 0,
  };
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
const totalPages = sessionsData?.pagination?.totalPages || 1;
   const hasNextPage = sessionsData?.pagination?.hasNextPage ?? currentPage < totalPages;
  // تابع تبدیل تاریخ



const fetchSessions = async () => {
  const p = {
    status_clinic: "bimeh",
    page: currentPage,
    limit: itemsPerPage,
    insuranceType: filters.insuranceType,
    patientName: filters.patientName,
    therapistName: filters.therapistName,
    start: filters.start,
    end: filters.end,
  };

  Object.keys(p).forEach((k) => {
    if (p[k] === "" || p[k] === null || p[k] === undefined) delete p[k];
  });

  if (p.start)
    p.start = moment(p.start, "jYYYY-jMM-jDD").format("YYYY-MM-DD");

  if (p.end)
    p.end = moment(p.end, "jYYYY-jMM-jDD").format("YYYY-MM-DD");

  paramsRef.current = p;  // ← فقط نگه می‌داریم

  await sessionFetch();   // ← فقط یک ریکوئست
};

  useEffect(() => {
    sessionFetch();
  }, []);


  
  const handleFilterChange = (field, value) => {
    if (field == "start" || field == "end") {
      const day = value.day < 10 ? "0" + value.day : value.day;
      const month =
        value.monthIndex + 1 < 10
          ? "0" + (value.monthIndex + 1)
          : value.monthIndex + 1;
      const year = value.year;
      const tarikh = year + "-" + month + "-" + day;


      setFilters((prev) => ({ ...prev, [field]: tarikh }));
    } else {
      setFilters((prev) => ({ ...prev, [field]: value }));
      if (field !== "insuranceType") {
        // تغییر بیمه نباید جستجو کند
        setCurrentPage(1); // ریست به صفحه اول
      }
    }
  };

  const clearFilters = () => {
    setFilters({
      insuranceType: "",
      start: null,
      end: null,
      status: "",
      patientName: "",
      therapistName: "",
    });
    setCurrentPage(1);
  };

  const getInsuranceName = (session) => {
    // اگر بیمار بیمه‌ای است، نام بیمه را برمی‌گردانیم
    if (session.patientId && session.patientId.bimehKind) {
      return session.patientId.bimehKind;
    }
    // در غیر این صورت، اگر نوع پرداخت بیمه است، بیمه نامشخص برمی‌گردانیم
    if (session.payment === "bimeh") {
      return "بیمه نامشخص";
    }
    return "-";
  };

  const formatCurrency = (amount) => {
    const num = Number(amount) || 0;
    return num.toLocaleString("fa-IR") + " تومان";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fa-IR");
    } catch (error) {
      return dateString;
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      bimeh: {
        class: "status-paid",
        text: "بیمه‌ای",
        icon: "fas fa-shield-alt",
      },
      paid: {
        class: "status-paid",
        text: "پرداخت شده",
        icon: "fas fa-check-circle",
      },
      unpaid: {
        class: "status-unpaid",
        text: "پرداخت نشده",
        icon: "fas fa-clock",
      },
    };
    const config = statusConfig[status] || statusConfig.bimeh;

    return (
      <span className={`status-badge ${config.class}`}>
        <i className={config.icon}></i>
        {config.text}
      </span>
    );
  };

  return (
    <div className="insurance-sessions">
      <h2>جلسات بیمه‌ای</h2>

      {/* آمار کلی */}
      <div className="summary-cards">
        <div className="summary-card">
          <div
            className="card-icon"
            style={{ backgroundColor: "rgba(102, 126, 234, 0.1)" }}
          >
            <i
              className="fas fa-calendar-check"
              style={{ color: "#667eea" }}
            ></i>
          </div>
          <div className="card-content">
            <h4>کل جلسات بیمه‌ای</h4>
            <p className="card-value">{summary.totalSessions}</p>
            {filters.start && filters.end && (
              <small
                style={{ color: "#666", fontSize: "12px", marginTop: "5px" }}
              >
                در بازه انتخابی
              </small>
            )}
          </div>
        </div>

        <div className="summary-card">
          <div
            className="card-icon"
            style={{ backgroundColor: "rgba(255, 193, 7, 0.1)" }}
          >
            <i
              className="fas fa-money-bill-wave"
              style={{ color: "#ffc107" }}
            ></i>
          </div>
          <div className="card-content">
            <h4>مجموع مبلغ جلسات</h4>
            <p className="card-value">{formatCurrency(summary.totalAmount)}</p>
          </div>
        </div>

        <div className="summary-card">
          <div
            className="card-icon"
            style={{ backgroundColor: "rgba(76, 175, 80, 0.1)" }}
          >
            <i className="fas fa-check-circle" style={{ color: "#4caf50" }}></i>
          </div>
          <div className="card-content">
            <h4>مبلغ پرداخت شده</h4>
            <p className="card-value">{formatCurrency(summary.totalPaid)}</p>
            {summary.totalAmount > 0 && (
              <small
                style={{ color: "#666", fontSize: "12px", marginTop: "5px" }}
              >
                {Math.round((summary.totalPaid / summary.totalAmount) * 100)}%
                از کل
              </small>
            )}
          </div>
        </div>

        <div className="summary-card">
          <div
            className="card-icon"
            style={{ backgroundColor: "rgba(244, 67, 54, 0.1)" }}
          >
            <i
              className="fas fa-exclamation-triangle"
              style={{ color: "#f44336" }}
            ></i>
          </div>
          <div className="card-content">
            <h4>مبلغ پرداخت نشده</h4>
            <p className="card-value">{formatCurrency(summary.totalUnpaid)}</p>
            {summary.totalAmount > 0 && (
              <small
                style={{ color: "#666", fontSize: "12px", marginTop: "5px" }}
              >
                {Math.round((summary.totalUnpaid / summary.totalAmount) * 100)}%
                از کل
              </small>
            )}
          </div>
        </div>

        <div className="summary-card">
          <div
            className="card-icon"
            style={{ backgroundColor: "rgba(156, 39, 176, 0.1)" }}
          >
            <i className="fas fa-building" style={{ color: "#9c27b0" }}></i>
          </div>
          <div className="card-content">
            <h4>تعداد شرکت‌های بیمه</h4>
            <p className="card-value">{summary?.insuranceCount||0}</p>
          </div>
        </div>
      </div>

      {/* پنل جستجو */}
      <div className="search-panel">
        <div className="search-header">
          <h3>
            <i className="fas fa-search"></i>
            جستجوی پیشرفته
          </h3>
          <div className="search-actions">
            <button className="btn-search" onClick={() => fetchSessions()}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  در حال جستجو...
                </>
              ) : (
                <>
                  <i className="fas fa-search"></i>
                  اجرای جستجو
                </>
              )}
            </button>
            <button
              className="btn-clear"
              onClick={() => clearFilters()}
              disabled={loading}
            >
              <i className="fas fa-eraser"></i>
              پاک کردن فیلترها
            </button>
          </div>
        </div>

        <div className="filters-grid">
          <div className="filter-group">
            <label>نوع بیمه:</label>
            <select
              value={filters.insuranceType}
              onChange={(e) =>
                handleFilterChange("insuranceType", e.target.value)
              }
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "2px solid #ced4da",
                borderRadius: "6px",
                fontSize: "14px",
                backgroundColor: "white",
                cursor: "pointer",
                color: "black",
              }}
            >
              <option value="">همه بیمه‌ها</option>
              {Array.isArray(insurances)&&insurances.map((insurance) => (
                <option key={insurance._id} value={insurance.name}>
                  {insurance.name}
                </option>
              ))}
            </select>
            {filters.insuranceType && (
              <small
                style={{ color: "#666", marginTop: "5px", display: "block" }}
              >
                بیمه انتخاب شده: {filters.insuranceType}
              </small>
            )}
          </div>

          <div className="filter-group">
            <label>از تاریخ:</label>
            <DatePicker
              value={filters.start}
              onChange={(date) => handleFilterChange("start", date)}
              format="YYYY/MM/DD"
              calendar={persian}
              locale={persian_fa}
              calendarPosition="bottom-right"
              inputClass="date-picker-input"
              style={{
                color: "black",
                width: "100%",
                padding: "10px 12px",
                border: "2px solid #ced4da",
                borderRadius: "6px",
                fontSize: "14px",
                backgroundColor: "white",
                boxSizing: "border-box",
              }}
            />
            {filters.start && (
              <small
                style={{ color: "#666", marginTop: "5px", display: "block" }}
              >
                از:{" "}
                {filters.start.format
                  ? filters.start.format("YYYY/MM/DD")
                  : filters.start}
              </small>
            )}
          </div>

          <div className="filter-group">
            <label>تا تاریخ:</label>
            <DatePicker
              value={filters.end}
              onChange={(date) => handleFilterChange("end", date)}
              format="YYYY/MM/DD"
              calendar={persian}
              locale={persian_fa}
              calendarPosition="bottom-right"
              inputClass="date-picker-input"
              style={{
                color: "black",
                width: "100%",
                padding: "10px 12px",
                border: "2px solid #ced4da",
                borderRadius: "6px",
                fontSize: "14px",
                backgroundColor: "white",
                boxSizing: "border-box",
              }}
            />
            {filters.end && (
              <small
                style={{ color: "#666", marginTop: "5px", display: "block" }}
              >
                تا:{" "}
                {filters.end.format
                  ? filters.end.format("YYYY/MM/DD")
                  : filters.end}
              </small>
            )}
          </div>

          <div className="filter-group">
            <label>نام بیمار:</label>
            <input
              type="text"
              value={filters.patientName}
              onChange={(e) =>
                handleFilterChange("patientName", e.target.value)
              }
              placeholder="جستجو بر اساس نام بیمار"
              style={{
                color: "black",
                width: "100%",
                padding: "10px 12px",
                border: "2px solid #ced4da",
                borderRadius: "6px",
                fontSize: "14px",
                backgroundColor: "white",
              }}
            />
            {filters.patientName && (
              <small
                style={{ color: "#666", marginTop: "5px", display: "block" }}
              >
                بیمار: {filters.patientName}
              </small>
            )}
          </div>

          <div className="filter-group">
            <label>نام درمانگر:</label>
            <input
              type="text"
              value={filters.therapistName}
              onChange={(e) =>
                handleFilterChange("therapistName", e.target.value)
              }
              placeholder="جستجو بر اساس نام درمانگر"
              style={{
                color: "black",
                width: "100%",
                padding: "10px 12px",
                border: "2px solid #ced4da",
                borderRadius: "6px",
                fontSize: "14px",
                backgroundColor: "white",
              }}
            />
            {filters.therapistName && (
              <small
                style={{ color: "#666", marginTop: "5px", display: "block" }}
              >
                درمانگر: {filters.therapistName}
              </small>
            )}
          </div>
        </div>
      </div>

      {/* جدول نتایج */}
      <div className="results-section">
        <div className="results-header">
          <h3>لیست جلسات بیمه‌ای ({sessions.length} جلسه)</h3>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <span style={{ fontSize: "14px", color: "#666" }}>
              صفحه {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || loading}
              style={{
                padding: "5px 10px",
                background: "#f8f9fa",
                border: "1px solid #dee2e6",
                borderRadius: "4px",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                opacity: currentPage === 1 ? 0.5 : 1,
              }}
            >
              قبلی
            </button>
            <button
               onClick={() => setCurrentPage((prev) => prev + 1)}
     disabled={!hasNextPage || loading}
              style={{
                padding: "5px 10px",
                background: "#f8f9fa",
                border: "1px solid #dee2e6",
                borderRadius: "4px",
                cursor:
                  sessions.length < itemsPerPage ? "not-allowed" : "pointer",
                opacity: sessions.length < itemsPerPage ? 0.5 : 1,
              }}
            >
              بعدی
            </button>
          </div>
        </div>

        <div className="results-table-container">
          {loading ? <LoadingOverlay/> : sessions.length > 0 ? (
            <table className="results-table">
              <thead>
                <tr>
                  <th>تاریخ ویزیت</th>
                  <th>نام بیمار</th>
                  <th>نام درمانگر</th>
                  <th>نوع بیمه</th>
                  <th>مبلغ جلسه</th>
                  <th>وضعیت پرداخت</th>
                  <th>نوع خدمت</th>
                  <th>توضیحات</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session, index) => (
                  <tr key={session._id || index}>
                    <td>{formatDate(session.localDay)}</td>
                    <td>
                      <div style={{ fontWeight: "600", color: "#2c3e50" }}>
                        {session.patientName || "-"}
                      </div>
                      {session.patientPhone && (
                        <div style={{ fontSize: "12px", color: "#666" }}>
                          {session.patientPhone}
                        </div>
                      )}
                    </td>
                    <td>{session.therapistName || "-"}</td>
                    <td>
                      <span
                        style={{
                          backgroundColor: "#e3f2fd",
                          color: "#1976d2",
                          padding: "4px 8px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "600",
                        }}
                      >
                        {getInsuranceName(session)}
                      </span>
                    </td>
                    <td style={{ fontWeight: "bold" }}>
                      {formatCurrency(session.patientFee || 0)}
                    </td>
                    <td>{getStatusBadge(session.status_clinic || "bimeh")}</td>
                    <td>
                      <span
                        style={{
                          backgroundColor:
                            session.sessionType === "individual"
                              ? "#e8f5e9"
                              : "#fff3e0",
                          color:
                            session.sessionType === "individual"
                              ? "#2e7d32"
                              : "#ef6c00",
                          padding: "4px 8px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "600",
                        }}
                      >
                        {session.sessionType === "individual"
                          ? "فردی"
                          : "گروهی"}
                      </span>
                    </td>
                    <td>{session.description || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-results">
              <i className="fas fa-search"></i>
              <p>هیچ جلسه بیمه‌ای با فیلترهای انتخاب شده یافت نشد</p>
            </div>
          )}
        </div>
      </div>

      {/* Debug Info */}
      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          background: "#f8f9fa",
          borderRadius: "8px",
          fontSize: "12px",
          color: "#666",
        }}
      >
        <strong>اطلاعات فیلترها (برای دیباگ):</strong>
        <div>نوع بیمه: {filters.insuranceType || "همه"}</div>
        <div>
          از تاریخ:{" "}
          {filters.start
            ? filters.start.format
              ? filters.start.format("YYYY/MM/DD")
              : filters.start
            : "تعیین نشده"}
        </div>
        <div>
          تا تاریخ:{" "}
          {filters.end
            ? filters.end.format
              ? filters.end.format("YYYY/MM/DD")
              : filters.end
            : "تعیین نشده"}
        </div>
        <div>نام بیمار: {filters.patientName || "همه"}</div>
        <div>نام درمانگر: {filters.therapistName || "همه"}</div>
      </div>
    </div>
  );
};

export default InsuranceSessions;
