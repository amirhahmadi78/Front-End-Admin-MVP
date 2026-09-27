// ClinicFinance.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
import moment from "moment-jalaali";
import AppointmentSummaryModal from "./AppointmentSummaryModal";
import Pagination from "./Pagination";
import "./ClinicFinance.css";
import { IsoTOJYJMJD } from "../../utils/timechange";
import { use_REFETC_FinantialFindAppointments } from "../../hooks/finance";
import { useAppDetails } from "../../hooks/appointment";
import { useQueryClient } from "@tanstack/react-query";
import AdvancedSearch from "./clinic_Dep/search";
import DatePick from "./DateDocker_VIP";
import { AlertSwal } from "../../utils/errorSwal";
import { useFindPatient } from "../../hooks/patient";
import { useTherapists } from "../../hooks/therapist";
import AppointmentModal from "../dashboard/modals/AppointmentModalt";

// تابع تبدیل وضعیت به فارسی
function SwitchStatus(status_clinic) {
  switch (status_clinic) {
    case "scheduled":
      return "برنامه‌ریزی‌شده";
    case "completed-notpaid":
      return "ویزیت شده (تسویه نشده)";
    case "completed-paid":
      return "ویزیت شده (تسویه شده)";
    case "canceled":
      return "لغو شده";
    case "bimeh":
      return "بیمه";
    case "absent":
      return "غیبت";
    case "break":
      return "استراحت";
    default:
      return "نامشخص";
  }
}

// فیلترهای اولیه (بدون تاریخ)
const INITIAL_FILTERS = {
  patientName: "",
  therapistName: "",
  status_clinic: "",
  payment: "",
  type: "",
  sessionType: "",
  room: "",
  minAmount: "",
  maxAmount: "",
  therapist: "",
  patient: "",
};

const INITIAL_PAGINATION = {
  page: 1,
  limit: 10,
};

const ClinicFinance = () => {
  const queryClient = useQueryClient();
  const { data: patientList } = useFindPatient({});
  const { data: therapistList } = useTherapists();
  const [showModal2, setShowModal2] = useState(false);

  // State فیلترهای پیشرفته
  const [formFilters, setFormFilters] = useState(INITIAL_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState({
    ...INITIAL_FILTERS,
    start: "",
    end: "",
    ...INITIAL_PAGINATION,
  });
  const [shouldSearch, setShouldSearch] = useState(false);

  // State تاریخ‌ها (شی moment)
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // State نمایش مودال
  const [showModal, setShowModal] = useState(false);
  const [appointmentId, setAppointmentId] = useState(null);

  // دریافت دیتا با فیلترهای اعمال شده
  const {
    data: searchResult,
    refetch: searchAppsFinance,
    isLoading,
    isError,
    error,
  } = use_REFETC_FinantialFindAppointments(
    (startDate && endDate) || startDate != "" || endDate != ""
      ? appliedFilters
      : null,
  );

  const { data: appointment, refetch: getAppDetails } =
    useAppDetails(appointmentId);

  // تبدیل تاریخ moment به رشته برای API
  const getDateString = useCallback((date) => {
    if (!date) return "";
    if (typeof date === "string") return date;
    if (moment.isMoment(date)) return date.format("YYYY-MM-DD");
    return "";
  }, []);

  // جستجو با فیلترهای فعلی (تاریخ + پیشرفته)
  const handleSearch = useCallback(
    async (e) => {
      e?.preventDefault();

      const start = getDateString(startDate);
      const end = getDateString(endDate);

      if (!start || !end) {
        AlertSwal.Error("لطفاً هر دو تاریخ شروع و پایان را انتخاب کنید");
        return;
      }

      const nextFilters = {
        ...formFilters,
        start: start,
        end: end,
        page: 1,
        limit: 10,
      };

      setAppliedFilters(nextFilters);
      setShouldSearch(true);
    },
    [formFilters, startDate, endDate, getDateString],
  );
useEffect(()=>{
  if(showModal2==false){
    setAppointmentId(null)
  }
},[showModal2])
  // بازنشانی همه فیلترها (تاریخ و پیشرفته)
  const handleReset = useCallback(() => {
    setFormFilters(INITIAL_FILTERS);
    setStartDate(null);
    setEndDate(null);
    setAppliedFilters({
      ...INITIAL_FILTERS,
      start: "",
      end: "",
      ...INITIAL_PAGINATION,
    });
    setShouldSearch(false);
  }, []);

  // استخراج دیتا از نتیجه جستجو
  const filteredData = searchResult?.AppList || [];
  const pagination = searchResult?.pagination || {
    totalPages: 1,
    totalRecords: 0,
    page: 1,
  };

  // آمارها
  const analyze = searchResult?.Amar?.[0] || {
    count: 0,
    paidAmount: 0,
    totalAmount: 0,
    totalClinicShare: 0,
    totalTherapistShare: 0,
    totalBimeh: 0,
    totalNot: 0,
    totalNotBimeh: 0,
    totalIncome: 0,
  };

  // ساخت لیست فیلترهای فعال برای نمایش
  const activeFilters = useMemo(() => {
    const filters = [];

    Object.entries(appliedFilters).forEach(([key, value]) => {
      if (!value || key === "page" || key === "limit") return;

      let label = "";
      let displayValue = value;

      switch (key) {
        case "start":
          label = "از تاریخ";
          displayValue = IsoTOJYJMJD(value);
          break;
        case "end":
          label = "تا تاریخ";
          displayValue = IsoTOJYJMJD(value);
          break;
        case "patientName":
          label = "مراجع";
          break;
        case "therapistName":
          label = "درمانگر";
          break;
        case "status_clinic":
          label = "وضعیت";
          displayValue = SwitchStatus(value);
          break;
        case "payment":
          label = "نوع پرداخت";
          break;
        case "type":
          label = "نوع جلسه";
          break;
        case "sessionType":
          label = "نوع سشن";
          displayValue = value === "individual" ? "انفرادی" : "گروهی";
          break;
        case "room":
          label = "اتاق";
          break;
        case "minAmount":
          label = "حداقل مبلغ";
          displayValue = `${Number(value).toLocaleString()} تومان`;
          break;
        case "maxAmount":
          label = "حداکثر مبلغ";
          displayValue = `${Number(value).toLocaleString()} تومان`;
          break;
        default:
          label = key;
      }
      filters.push({ key, label, value: displayValue });
    });
    return filters;
  }, [appliedFilters]);

  // تغییر صفحه
  const handlePageChange = useCallback((page) => {
    setAppliedFilters((prev) => ({ ...prev, page, limit: 10 }));
  }, []);

  useEffect(() => {
    if (shouldSearch && appliedFilters.page) {
      searchAppsFinance();
    }
  }, [
    appliedFilters.page,
    appliedFilters.limit,
    shouldSearch,
    searchAppsFinance,
    appliedFilters,
  ]);

  // دریافت جزییات نوبت و نمایش مودال
  const getAppointmentDetails = useCallback(async (app) => {
    setAppointmentId(app._id);
  }, []);

  useEffect(() => {
    if (!appointmentId) return;
    const fetchAndShowModal = async () => {
      await getAppDetails();
      if (showModal2 == false) {
        setShowModal(true);
      }
    };
    fetchAndShowModal();
  }, [appointmentId, getAppDetails]);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setAppointmentId(null);
    queryClient.setQueryData(["appdetails", appointmentId], null);
  }, [queryClient, appointmentId]);

  const formatAmount = (amount) =>Math.round(amount??0)?.toLocaleString() || "0";

  return (
    <div className="clinic-finance">
      <h3>امور مالی کل کلینیک</h3>

      {/* بخش انتخاب تاریخ و دکمه جستجو (همیشه نمایش داده می‌شود) */}
      <div className="date-search-section">
        <div className="date-pickers">
          <div className="date-field">
            <label>از تاریخ</label>
            <DatePick varDate={startDate} setvarDate={setStartDate} />
          </div>
          <div className="date-field">
            <label>تا تاریخ</label>
            <DatePick varDate={endDate} setvarDate={setEndDate} />
          </div>
        </div>
        <div className="search-buttons">
          <button onClick={handleSearch} className="btn-primary">
            <i className="fas fa-search"></i> جستجو
          </button>
          <button onClick={handleReset} className="btn-secondary">
            <i className="fas fa-undo"></i> بازنشانی
          </button>
        </div>
      </div>

      {/* بخش جستجوی پیشرفته (قابل باز/بسته شدن) */}
      <AdvancedSearch
        formFilters={formFilters}
        therapistList={therapistList}
        patientList={patientList}
        handleInputChange={(e) => {
          const { name, value } = e.target;
          setFormFilters((prev) => ({ ...prev, [name]: value }));
        }}
        activeFilters={activeFilters}
        removeFilter={(filterKey) => {
          // حذف فیلتر از appliedFilters
          setAppliedFilters((prev) => ({ ...prev, [filterKey]: "", page: 1 }));
          // حذف از formFilters در صورت وجود
          if (filterKey in formFilters) {
            setFormFilters((prev) => ({ ...prev, [filterKey]: "" }));
          }
          // برای تاریخ‌ها
          if (filterKey === "start") setStartDate(null);
          if (filterKey === "end") setEndDate(null);
        }}
      />

      {/* بخش آمار */}
      <div className="stats-grid">
        <div className="stat-card">
          <h5>مجموع درآمد</h5>
          <div className="stat-value">
            {formatAmount(analyze.totalIncome)} تومان
          </div>
        </div>
        <div className="stat-card completed-paid">
          <h5>پرداخت شده نقدی</h5>
          <div className="stat-value">
            {formatAmount(analyze.paidAmount)} تومان
          </div>
        </div>
        <div className="stat-card bimeh">
          <h5>مبلغ بیمه‌ای</h5>
          <div className="stat-value">
            {formatAmount(analyze.totalBimeh)} تومان
          </div>
        </div>
        <div className="stat-card not-paid">
          <h5>بدهی مراجعین</h5>
          <div className="stat-value">
            {formatAmount(analyze.totalNot)} تومان
          </div>
        </div>
        <div className="stat-card clinic-share">
          <h5>سهم کلینیک</h5>
          <div className="stat-value">
            {formatAmount(analyze.totalClinicShare)} تومان
          </div>
        </div>
        <div className="stat-card therapist-share">
          <h5>سهم درمانگران</h5>
          <div className="stat-value">
            {formatAmount(analyze.totalTherapistShare)} تومان
          </div>
        </div>
      </div>

      {isLoading && <p className="loading">در حال بارگذاری داده‌ها...</p>}
      {isError && (
        <p className="error">خطا: {error?.message || "خطای ناشناخته"}</p>
      )}

      {!isLoading && !isError && (
        <>
          <div className="results-info">
            <strong>{formatAmount(analyze.count)}</strong> مورد یافت شد
          </div>
          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={appliedFilters.page}
              totalPages={pagination.totalPages}
              totalRecords={pagination.totalRecords}
              onPageChange={handlePageChange}
            />
          )}
           <div className="finance-table-wrapper">
   
           
              <table className="finance-table overflow-scroll!">
                <thead>
                  <tr>
                    <th>تاریخ ویزیت</th>
                    <th>تاریخ پرداخت</th>
                    <th>مراجع</th>
                    <th>درمانگر</th>
                    <th>نوع پرداخت</th>
                    <th>مبلغ</th>
                    <th>وضعیت</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: "center" }}>
                        هیچ داده‌ای یافت نشد
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item, idx) => (
                      <tr key={item._id || idx} style={{ cursor: "pointer" }}>
                        <td onClick={() => getAppointmentDetails(item)}>
                          {IsoTOJYJMJD(item.localDay)}
                        </td>

                        <td onClick={() => getAppointmentDetails(item)}>
                          {item.sessionType === "individual"
                            ? item.status_clinic === "completed-paid"
                              ? item.paidAt || "تاریخ ثبت نشده"
                              : item.status_clinic === "bimeh"
                                ? "وصول شده از بیمه"
                                : "بدون تاریخ پرداخت"
                            : "جلسه گروهی"}
                        </td>

                        <td onClick={() => getAppointmentDetails(item)}>
                          {item.sessionType === "individual"
                            ? item.patientName
                            : "برای مشاهده کلیک کنید"}
                        </td>

                        <td onClick={() => getAppointmentDetails(item)}>
  {item.sessionType === "individual"
    ? item.therapistName
    : therapistList.find(
        (t) => t?._id === item?.groupSession?.therapists?.[0]?.therapistId
      )
      ? `${therapistList.find(
          (t) => t?._id === item?.groupSession?.therapists?.[0]?.therapistId
        )?.firstName} ${therapistList.find(
          (t) => t?._id === item?.groupSession?.therapists?.[0]?.therapistId
        )?.lastName}`
      : "برای مشاهده کلیک کنید"}
</td>


                        <td onClick={() => getAppointmentDetails(item)}>
                          {" "}
                          {item.payment || "-"}
                        </td>

                        <td onClick={() => getAppointmentDetails(item)}>
                          {formatAmount(item.patientFee)}
                        </td>

                        <td
                          onClick={() => {
                            setShowModal2(true);
                            getAppointmentDetails(item);
                            
                          }}
                          className={
                            item.status_clinic === "completed-paid"
                              ? "completed bg-mist-300! rounded-2xl!"
                              : "bimeh bg-mist-300! rounded-2xl!"
                          }
                        >
                          { ((item.sessionType==="group")&&(item?.Paids?.length>0)?""+" "+(item.Paids.length*item.groupSession.onePatientFee).toLocaleString()+" تومان پرداخت شده":SwitchStatus(item.status_clinic))}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
         
           
          </table>
           </div>
        </>
      )}

      {showModal && appointment && (
        <AppointmentSummaryModal
          appointment={appointment}
          onClose={handleCloseModal}
        />
      )}
      {showModal2 && appointment && (
        <AppointmentModal
          showForm={true}
          setAllAppointments={undefined}
          allAppointments={undefined}
          setShowForm={undefined}
          appointment={appointment}
          setShowModal={setShowModal2}
          onEdit={undefined}
          onEditGroup={undefined}
          todayTherapists={therapistList}
          patientlist={patientList}
        />
      )}
    </div>
  );
};

export default ClinicFinance;
