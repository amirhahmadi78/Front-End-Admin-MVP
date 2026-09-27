import { useState, useEffect, useRef } from "react";
import "./patientFinance.css";
import moment from "moment-jalaali";

import { useFindPatient } from "../../hooks/patient";

import { ModalLoading } from "../loadingOverlay/LoadingOverlay";
import { useFinancePatient } from "../../hooks/finance";
import type { DTOget_finance_Patient } from "../../types/finance";
import { useTransactionsPatient } from "../../hooks/transaction";

import AppointmentModal from "../dashboard/modals/AppointmentModalt";
import paymentMethodMap from "../../utils/payments";
import BatchPaymentModal from "./BatchPaymentModal";
import { GetOnePatient } from "../../services/patients";

const PatientFinance = () => {
  const [queryFinantial, setQueryFinantial] =
    useState<DTOget_finance_Patient | null>(null);
  const {
    data: financialData,
    isLoading: financialLoading,
    refetch: fetchFinancial,
  } = useFinancePatient(queryFinantial);
  const {
    data: transactionData,
    isLoading: PaymentsLoading,
    refetch: fetchTransaction,
  } = useTransactionsPatient({ patientId: queryFinantial?.patientId ?? "" });
  const [batchModal, setBatchModal] = useState(false);

  const payments = transactionData?.transactions || [];
  const { data: patients,refetch:fetchPatient } = useFindPatient({});
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [month, setMonth] = useState(moment().jMonth() + 1);
  const [year, setYear] = useState(moment().jYear());
  const [showModal, setSowModal] = useState(false);
  const [appointment, setAppointment] = useState(null);
  const [showPatientList, setShowPatientList] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    sessions: false,
    wallet: false,
  });
  const loading = financialLoading || PaymentsLoading;
const [wallet ,setWallet]=useState(selectedPatient?.wallet?.toLocaleString() || 0)
  const searchRef = useRef(null);
  const listRef = useRef(null);
  const [startDate, setStartDate] = useState(
    moment(`${year}/${month}/01`, "jYYYY/jM/jD")
      .startOf("jMonth")
      .format("YYYY-MM-DD"),
  );
  const [endDate, setEndDate] = useState(
    moment(`${year}/${month}/01`, "jYYYY/jM/jD")
      .endOf("jMonth")
      .format("YYYY-MM-DD"),
  );

  // هندل کلیک بیرون از لیست
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        listRef.current &&
        !listRef.current.contains(event.target)
      ) {
        setShowPatientList(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(()=>{
setWallet(selectedPatient?.wallet?.toLocaleString() ?? 0)
  },[selectedPatient])
  const Onsuccess = async (a) => {

const pt=await GetOnePatient(selectedPatient._id)


   setWallet(pt[0]?.wallet?.toLocaleString() ?? 0)
    

   await fetchFinancial()
   await fetchTransaction()
   
    
  };

  useEffect(() => {
    if (!selectedPatient || !month || !year) return;

    const startDay = moment(`${year}/${month}/01`, "jYYYY/jM/jD")
      .startOf("jMonth")
      .format("YYYY-MM-DD");

    const endDay = moment(`${year}/${month}/01`, "jYYYY/jM/jD")
      .endOf("jMonth")
      .format("YYYY-MM-DD");
    setEndDate(endDay);
    setStartDate(startDay);
    const patientId = selectedPatient._id;

    setQueryFinantial({ startDay, endDay, patientId });
  }, [selectedPatient, month, year]);

  useEffect(() => {
    if (!queryFinantial) return;
    fetchFinancial();
    fetchTransaction();
  }, [fetchFinancial, fetchTransaction, queryFinantial]);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setSearch(`${patient.firstName} ${patient.lastName}`);
    setShowPatientList(false);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    setShowPatientList(true);

    if (!value.trim()) {
      setSelectedPatient(null);
    }
  };

  const handleSearchFocus = () => {
    setShowPatientList(true);
  };

  // فیلتر کردن مراجعین
  const filteredPatients = Array.isArray(patients)
    ? patients?.filter((p) =>
        `${p.firstName || ""} ${p.lastName || ""}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      )
    : [];

  // محاسبه مجموع‌ها
  const totalFinancial = financialData?.TotalFinancial || 0;
  const totalComplete = financialData?.TotalComplete || 0;
  const totalBimeh = financialData?.Totalbimeh || 0;
  const totalNotComplete = financialData?.TotalNotComplete || 0;

  // محاسبه تراکنش‌های کیف پول

  const totalWalletInduce = payments
    ?.filter((t) => t.type === "induce")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalWalletReduce = payments
    ?.filter((t) => t.type === "reduce")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const netWallet = selectedPatient?.wallet || 0;
  const www = totalWalletInduce - totalWalletReduce;

  return (
    <div className="patient-finance">
      <div className="finance-header">
        <h3>💰 امور مالی مراجعین</h3>
      </div>

      {/* بخش جستجو */}
      <div className="search-section">
        <div className="search-container">
          <div className="search-box" ref={searchRef}>
            <input
              ref={searchRef}
              type="text"
              placeholder="جستجوی مراجع (نام یا نام خانوادگی)..."
              value={search}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              className="search-input"
            />
            {loading && (
              <div className="loading-spinner">در حال بارگیری...</div>
            )}
          </div>

          {showPatientList && filteredPatients.length > 0 && (
            <div className="patient-dropdown" ref={listRef}>
              <div className="dropdown-list">
                {filteredPatients.map((p) => (
                  <div
                    key={p._id}
                    className={`dropdown-item ${
                      selectedPatient?._id === p._id ? "selected" : ""
                    }`}
                    onClick={() => handlePatientSelect(p)}
                  >
                    <span className="patient-name">
                      {p.firstName} {p.lastName}
                    </span>
                    {p.phone && (
                      <span className="patient-phone">{p.phone}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {showPatientList && filteredPatients.length === 0 && search && (
            <div className="no-results" ref={listRef}>
              مراجعی یافت نشد
            </div>
          )}
        </div>

        {selectedPatient && (
          <div className="selected-patient-info">
            <div className="selected-badge">
              <span className="selected-name">
                مراجع انتخاب شده:{" "}
                <strong>
                  {selectedPatient.firstName} {selectedPatient.lastName}
                </strong>
                <span className="wallet-badge">
                  💼 کیف پول: {wallet}{" "}
                  تومان
                </span>
              </span>
              <button
                className="clear-btn"
                onClick={() => {
                  setSelectedPatient(null);
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
      {selectedPatient && (
        <div className="date-filters">
          <div className="filter-group">
            <div className="filter-item">
              <label>📅 ماه:</label>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="filter-select"
                style={{ color: "black" }}
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
                className="year-input red-text"
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
            <button
              onClick={() => setBatchModal(true)}
              className="bg-blue-600 min-w-70! text-amber-50 p-2! m-2! rounded-2xl border-2 border-amber-950"
            >
              پرداخت بدهی
            </button>
          </div>
        </div>
      )}

      {/* نمایش بارگذاری */}
      {loading && ModalLoading()}

      {/* خلاصه مالی */}
      {financialData && !loading && (
        <div className="financial-summary">
          <div className="summary-cards">
            <div className="summary-card total-cost">
              <h4>💰 مجموع هزینه جلسات</h4>
              <p className="amount">
                {totalFinancial.toLocaleString()}
                <span> تومان</span>
              </p>
            </div>

            <div className="summary-card paid">
              <h4>✅ جلسات پرداخت‌شده</h4>
              <p className="amount">
                {totalComplete.toLocaleString()}
                <span> جلسه</span>
              </p>
            </div>

            <div className="summary-card insurance">
              <h4>🏥 جلسات بیمه‌ای</h4>
              <p className="amount">
                {totalBimeh.toLocaleString()}
                <span> تومان</span>
              </p>
            </div>

            <div className="summary-card unpaid">
              <h4>⏳ جلسات پرداخت‌نشده</h4>
              <p className="amount">
                {totalNotComplete.toLocaleString()}
                <span> جلسه</span>
              </p>
            </div>
          </div>

          {/* بخش جلسات درمانی */}
          <div className="data-section">
            <div
              className="section-title clickable"
              onClick={() => toggleSection("sessions")}
            >
              <h4>
                📋 لیست جلسات درمانی
                <span className="toggle-icon">
                  {expandedSections.sessions ? "▲" : "▼"}
                </span>
              </h4>
              <span className="count-badge">
                {financialData.financialList?.length || 0} جلسه
              </span>
            </div>

            {expandedSections.sessions && (
              <div className="section-content">
                {!financialData.financialList ||
                financialData.financialList.length === 0 ? (
                  <div className="empty-state">
                    <p>⛔️ در ماه انتخابی هیچ جلسه درمانی انجام نشده است</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>تاریخ</th>
                          <th>درمانگر</th>
                          <th>مبلغ (تومان)</th>
                          <th>وضعیت پرداخت</th>
                          <th>نوع پرداخت</th>
                        </tr>
                      </thead>
                      <tbody>
                        {financialData.financialList.map((s, i) => (
                          <tr
                            key={i}
                            className={
                              s.status_clinic === "completed-notpaid"
                                ? "unpaid-row"
                                : ""
                            }
                          >
                            <td>
                              {moment(s.localDay).format("jYYYY/jMM/jDD")}
                            </td>
                            <td>{s.therapistName || "جلسه ی گروهی"}</td>
                            <td className="amount-cell">
                              {(s.sessionType === "group"
                                ? s.groupSession.onePatientFee
                                : s.patientFee || 0
                              ).toLocaleString()}
                            </td>
                            <td
                              onClick={() => {
                                setSowModal(true);
                                setAppointment(s);
                              }}
                            >
                              <span
                                className={`status-badge ${
                                  s.status_clinic === "completed-paid"
                                    ? "paid"
                                    : s.status_clinic === "bimeh"
                                      ? "insurance"
                                      : s.status_clinic ===
                                            "completed-notpaid" &&
                                          Array.isArray(
                                            s.Paids?.filter(
                                              (e) =>
                                                e.id ===
                                                queryFinantial?.patientId,
                                            ),
                                          ) &&
                                          s.Paids?.filter(
                                            (e) =>
                                              e.id ===
                                              queryFinantial?.patientId,
                                          ).length === 1
                                        ? "paid"
                                        : "unpaid"
                                }`}
                              >
                                {s.status_clinic === "completed-paid"
                                  ? "پرداخت‌شده"
                                  : s.status_clinic === "bimeh"
                                    ? "بیمه"
                                    : s.status_clinic === "completed-notpaid" &&
                                        Array.isArray(
                                          s.Paids?.filter(
                                            (e) =>
                                              e.id ===
                                              queryFinantial?.patientId,
                                          ),
                                        ) &&
                                        s.Paids?.filter(
                                          (e) =>
                                            e.id === queryFinantial?.patientId,
                                        ).length === 1
                                      ? "پرداخت شده"
                                      : "پرداخت نشده"}
                              </span>
                            </td>
                            <td>
                              {paymentMethodMap[s?.payment ?? "0"] ||
                                s.pay_details ||
                                "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* بخش تراکنش‌های کیف پول */}
          <div className="data-section">
            <div
              className="section-title clickable"
              onClick={() => toggleSection("wallet")}
            >
              <h4>
                💳 تراکنش‌های کیف پول
                <span className="toggle-icon">
                  {expandedSections.wallet ? "▲" : "▼"}
                </span>
              </h4>
              <span className="count-badge">{payments?.length} تراکنش</span>
            </div>

            {expandedSections.wallet && (
              <div className="section-content">
                {payments?.length === 0 ? (
                  <div className="empty-state">
                    <p>⛔️ هیچ تراکنشی ثبت نشده است</p>
                  </div>
                ) : (
                  <>
                    {/* خلاصه کیف پول */}
                    <div className="wallet-summary">
                      <div className="wallet-summary-item">
                        <span className="label">مجموع واریزی‌ها:</span>
                        <span className="value induce">
                          + {totalWalletInduce.toLocaleString()} تومان
                        </span>
                      </div>
                      <div className="wallet-summary-item">
                        <span className="label">مجموع برداشت‌ها:</span>
                        <span className="value reduce">
                          - {totalWalletReduce.toLocaleString()} تومان
                        </span>
                      </div>
                      <div className="wallet-summary-item total">
                        <span className="label">موجودی خالص:</span>
                        <span className="value">
                          {wallet} تومان
                        </span>
                      </div>
                    </div>

                    {/* جدول تراکنش‌ها */}
                    <div className="table-responsive">
                      <table className="data-table wallet-table">
                        <thead>
                          <tr>
                            <th>تاریخ</th>
                            <th>نوع تراکنش</th>
                            <th>مبلغ (تومان)</th>
                            <th>دلیل</th>
                            <th>توضیحات</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payments?.map((p) => (
                            <tr
                              key={p._id}
                              className={
                                p.type === "reduce"
                                  ? "reduce-row"
                                  : "induce-row"
                              }
                            >
                              <td>
                                {moment(p.createdAt).format(
                                  "jYYYY/jMM/jDD - HH:mm",
                                )}
                              </td>
                              <td>
                                <span className={`type-badge ${p.type}`}>
                                  {p.type === "induce"
                                    ? "➕ واریز"
                                    : "➖ برداشت"}
                                </span>
                                <span className="for-badge">
                                  {p.for === "wallet"
                                    ? "کیف پول"
                                    : "جلسه درمان"}
                                </span>
                              </td>
                              <td className={`amount-cell ${p.type}`}>
                                {p.type === "induce" ? "+ " : "- "}
                                {(p.amount || 0).toLocaleString()}
                              </td>
                              <td>
                                {p.for === "appointment" && p.appointmentId ? (
                                  <div className="appointment-info">
                                    <div>
                                      جلسه با: {p.appointmentId.therapistName}
                                    </div>
                                    <div className="small-text">
                                      تاریخ:{" "}
                                      {moment(p.appointmentId.localDay).format(
                                        "jYYYY/jMM/jDD",
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  p.description || "-"
                                )}
                              </td>
                              <td>{p.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* پیام انتخاب مراجع */}
      {!selectedPatient && !loading && (
        <div className="placeholder-message">
          <div className="placeholder-content">
            <div className="placeholder-icon">👤</div>
            <h3>لطفاً یک مراجع انتخاب کنید</h3>
            <p>
              برای مشاهده اطلاعات مالی، ابتدا از کادر جستجو بالای صفحه یک مراجع
              انتخاب نمایید.
            </p>
          </div>
        </div>
      )}
      {batchModal && (
        <BatchPaymentModal
          open={batchModal}
          onClose={() => {
            setBatchModal(false);
          }}
          patientId={queryFinantial?.patientId}
          startDate={startDate}
          endDate={endDate}
          wallet={selectedPatient.wallet}
          onSuccess={Onsuccess}
        />
      )}
      {showModal && appointment && (
        <AppointmentModal
          showForm={undefined}
          setAllAppointments={undefined}
          allAppointments={undefined}
          setShowForm={undefined}
          appointment={appointment}
          setShowModal={setSowModal}
          onEdit={undefined}
          onEditGroup={undefined}
          todayTherapists={undefined}
          patientlist={undefined}
          onSuccess={Onsuccess}
        />
      )}
    </div>
  );
};

export default PatientFinance;


