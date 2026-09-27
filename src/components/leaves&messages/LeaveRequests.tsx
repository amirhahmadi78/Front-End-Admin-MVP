import { useState, useEffect, useRef } from "react";
import "./LeaveRequests.css";

import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

import moment from "moment-jalaali";
import Swal from "sweetalert2";

import { useTherapists } from "../../hooks/therapist";
import {
  useDayLeaveRequest_TH,
  useDeleteLeaveTh,
  useFindeLeavesTherapist,
  useResToLeaveR,
} from "../../hooks/leaves";

import type { StatusLeavesTherapistType } from "../../types/enums";
import { AlertSwal } from "../../utils/errorSwal";
import LeaveRequestForm from "./CreateLeaveRequest";

const LeaveRequests = () => {
  const { data: therapists } = useTherapists();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [statusFilter, setStatusFilter] = useState<
    StatusLeavesTherapistType | "all"
  >("all");
  const [showTherapistList, setShowTherapistList] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [activeTab, setActiveTab] = useState("requests"); // 'requests' or 'calendar'
  const searchRef = useRef(null);
  const listRef = useRef(null);
  const {
    data: dayLeavesData,
    refetch: fetchDayLeaves,
    isLoading: dayLeavesLoading,
  } = useDayLeaveRequest_TH(
    new Date(selectedDate || "").toISOString().split("T")[0],
    ["pending", "approved", "rejected"],
  );
const {mutate:DeleteLeave}=useDeleteLeaveTh()
const dayLeaves=dayLeavesData?.leaveRequests||[]
const [showForm, setShowForm] = useState(false);



  const {
    data: leaveRequests,
    refetch: fetchLeaveRequests,
    isLoading: findLoading,
  } = useFindeLeavesTherapist({
    therapist: selectedTherapist?._id||null,
    status:
      statusFilter !== "all"
        ? statusFilter
        : ["pending", "approved", "rejected"],
  });
const{mutate:ResToLeaveR}=useResToLeaveR()

  const loading = dayLeavesLoading || findLoading;
  function status(status) {
    switch (status) {
      case "pending":
        return "در انتظار بررسی";
      case "approved":
        return "تایید شده";
      case "rejected":
        return "رد شده";
    }
  }

  useEffect(() => {
    fetchLeaveRequests();

    fetchDayLeaves();
  }, []);

  useEffect(() => {
    fetchLeaveRequests();
  }, [selectedTherapist, statusFilter]);

  useEffect(() => {
    if (activeTab === "calendar") {
      fetchDayLeaves();
    }
  }, [selectedDate, activeTab]);

  // هندل کلیک بیرون از لیست
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        listRef.current &&
        !listRef.current.contains(event.target)
      ) {
        setShowTherapistList(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleApproveReject = async (requestId, status, adminNotes ) => {
   
      const result = await Swal.fire({
        title: "تایید عملیات",
        text: `آیا مطمئن هستید که می‌خواهید این درخواست را ${
          status === "approved" ? "تایید" : "رد"
        } کنید؟`,
        input: "textarea",
        inputPlaceholder: "توضیحات خود را اینجا بنویسید (اختیاری)...",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: status === "approved" ? "#28a745" : "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: status === "approved" ? "تایید" : "رد",
        cancelButtonText: "لغو",
      });

      if (result.isConfirmed) {
         ResToLeaveR({
          requestId,
          status,
          adminNotes: result.value || "",
        });

       
      }
  
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <span className="status-badge pending">در انتظار بررسی</span>;
      case "approved":
        return <span className="status-badge approved">تایید شده</span>;
      case "rejected":
        return <span className="status-badge rejected">رد شده</span>;
      default:
        return <span className="status-badge">نامشخص</span>;
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case "daily":
        return "روزانه";
      case "hourly":
        return "ساعتی";
      default:
        return type;
    }
  };



 const getUserRoleText = (role) => {
  switch (role) {
    case "PSY":
      return "روانشناس";
   
    case "therapist":
      return "درمانگر";
    case "OT":
      return "کاردرمانگر";
    case "SLP":
      return "گفتاردرمانگر";
    case "PT":
      return "فیزیوتراپیست";
    default:
      return role || "نامشخص";
  }
};

  const filteredRequests =Array.isArray(leaveRequests)? leaveRequests.filter((request) => {
    const userName = (request?.therapist?.firstName||null) + " " + (request?.therapist?.lastName||null);
    return userName.toLowerCase().includes(searchTerm.toLowerCase());
  }):[]

  // آمار کلی
  const stats =Array.isArray(leaveRequests)? {
    total:Array.isArray(leaveRequests)? leaveRequests.length:0,
    pending:Array.isArray(leaveRequests)? leaveRequests.filter((r) => r?.status === "pending").length:0,
    approved:Array.isArray(leaveRequests)? leaveRequests.filter((r) => r?.status === "approved").length:0,
    rejected: Array.isArray(leaveRequests)?leaveRequests.filter((r) => r?.status === "rejected").length:0,
  }:{
    total:0,
 pending:0,
 approved:0,
rejected:0
    

  }

  return (
    <div className="leave-requests-container">
      <h1>مدیریت درخواست‌های مرخصی</h1>

      {/* تب‌ها */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === "requests" ? "active" : ""}`}
          onClick={() => setActiveTab("requests")}
        >
          بررسی درخواست‌ها
        </button>
        <button
          className={`tab-btn ${activeTab === "calendar" ? "active" : ""}`}
          onClick={() => setActiveTab("calendar")}
        >
          تقویم مرخصی‌ها
        </button>
         <button
    className={`tab-btn ${activeTab === "register" ? "active" : ""}`}
    onClick={() => setActiveTab("register")}
  >
    ثبت مرخصی جدید
  </button>
      </div>

      {activeTab === "requests" && (
        <>
          {/* آمار کلی */}
          <div className="stats-grid">
            <div className="stat-card">
              <h3>کل درخواست‌ها</h3>
              <span className="stat-number">{stats.total}</span>
            </div>
            <div className="stat-card pending">
              <h3>در انتظار بررسی</h3>
              <span className="stat-number">{stats.pending}</span>
            </div>
            <div className="stat-card approved">
              <h3>تایید شده</h3>
              <span className="stat-number">{stats.approved}</span>
            </div>
            <div className="stat-card rejected">
              <h3>رد شده</h3>
              <span className="stat-number">{stats.rejected}</span>
            </div>
          </div>

          {/* فیلترها */}
          <div className="filters-section">
            <div className="filter-group">
              <label>جستجو بر اساس نام کاربر:</label>
              <input
                type="text"
                placeholder="نام درمانگر را وارد کنید..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-group">
              <label>انتخاب درمانگر:</label>
              <div className="therapist-selector" ref={searchRef}>
                <input
                  type="text"
                  placeholder="نام درمانگر را انتخاب کنید..."
                  value={
                    selectedTherapist
                      ? `${selectedTherapist.firstName} ${selectedTherapist.lastName}`
                      : ""
                  }
                  onClick={() => setShowTherapistList(!showTherapistList)}
                  readOnly
                  className="therapist-input"
                />
                {showTherapistList && (
                  <div className="therapist-list" ref={listRef}>
                    <div
                      className="therapist-item"
                      onClick={() => {
                        setSelectedTherapist(null);
                        setShowTherapistList(false);
                      }}
                    >
                      همه کاربران
                    </div>
                    {Array.isArray(therapists)&& therapists.map((therapist) => (
                      <div
                        key={therapist._id}
                        className="therapist-item"
                        onClick={() => {
                          setSelectedTherapist(therapist);
                          setShowTherapistList(false);
                        }}
                      >
                        {therapist.firstName} {therapist.lastName}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="filter-group">
              <label>فیلتر وضعیت:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="status-select"
              >
                <option value="all">همه</option>
                <option value="pending">در انتظار بررسی</option>
                <option value="approved">تایید شده</option>
                <option value="rejected">رد شده</option>
              </select>
            </div>
          </div>

          {/* لیست درخواست‌ها */}
          <div className="requests-list">
            {loading ? (
              <div className="loading">در حال بارگذاری...</div>
            ) : filteredRequests.length === 0 ? (
              <div className="no-data">هیچ درخواست مرخصی یافت نشد</div>
            ) : (
              filteredRequests?.map((request) => (
                <div key={request?._id} className="request-card">
                  <div className="request-header">
                    <div className="therapist-info">
                      <h4>
                        {request?.therapist?.firstName} {request?.therapist?.lastName}
                      </h4>
                      <div className="user-details"> 
                    
                      {
                          request?.therapist?.role && (
                            <span className="user-role">
                              ({getUserRoleText(request?.therapist?.role)})
                            </span>
                          )}
                      </div>
                      <span className="request-type">
                        {getTypeText(request?.type)}
                      </span>
                    </div>
                    {getStatusBadge(request?.status)}
                  </div>

                  <div className="request-details">
                     
                    <div className="detail-row">
                      <span className="label">تاریخ شروع:</span>
                      <span>
                        {request?.type === "daily"
                          ? moment(request?.startDate).format("jYYYY/jMM/jDD")
                          : moment(request?.startDate).format("jYYYY/jMM/jDD")}
                      </span>
                    </div>

                    {request?.type === "daily" && request?.endDate && (
                      <div className="detail-row">
                        <span className="label">تاریخ پایان:</span>
                        <span>
                          {moment(request?.endDate).format("jYYYY/jMM/jDD")}
                        </span>
                      </div>
                    )}

                    {request?.type === "hourly" && (
                      <>
                        <div className="detail-row">
                          <span className="label">زمان شروع:</span>
                          <span>{request?.startTime}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">زمان پایان:</span>
                          <span>{request?.endTime}</span>
                        </div>
                      </>
                    )}

                    <div className="detail-row">
                      <span className="label">دلیل:</span>
                      <span>{request?.reason}</span>
                    </div>

                    {request?.adminNotes && (
                      <div className="detail-row">
                        <span className="label">یادداشت ادمین:</span>
                        <span>{request?.adminNotes}</span>
                      </div>
                    )}

                    <div className="detail-row">
                      <span className="label">تاریخ ثبت:</span>
                      <span>
                        {moment(request?.createdAt).format(
                          "jYYYY/jMM/jDD HH:mm",
                        )}
                      </span>
                    </div>
                  </div>

                  {request?.status === "pending" && (
                    <div className="request-actions">
                      <button
                        className="approve-btn"
                        onClick={() =>
                          handleApproveReject(request?._id, "approved")
                        }
                      >
                        تایید
                      </button>
                      <button
                        className="reject-btn"
                        onClick={() =>
                          handleApproveReject(request?._id, "rejected")
                        }
                      >
                        رد
                      </button>
                    </div>
                  )}
                
                <button className="delete-btn" onClick={()=>
                  AlertSwal.doYouWant("آیا از حذف مرخصی درمانگر رضایت دارید؟").then(res=>res.isConfirmed?DeleteLeave(request._id):null)
                  }>حذف</button>
                
                </div>
              ))
            )}
          </div>
        </>
      )}

      {activeTab === "calendar" && (
        <div className="calendar-section">
          <div className="calendar-header">
            <h2>مرخصی‌های روز انتخابی</h2>
            <div className="date-picker-container">
              <label>انتخاب تاریخ:</label>
              <DatePicker
                value={selectedDate}
                onChange={handleDateChange}
                calendar={persian}
                locale={persian_fa}
                format="YYYY/MM/DD"
                calendarPosition="bottom-right"
                style={{
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  padding: "8px 12px",
                }}
              />
            </div>
          </div>

          <div className="day-leaves-list">
            {loading ? (
              <div className="loading">در حال بارگذاری...</div>
            ) : dayLeaves.length === 0 ? (
              <div className="no-data">
                هیچ مرخصی تایید شده‌ای برای این تاریخ یافت نشد
              </div>
            ) : (
              dayLeaves?.map((leave) => (
                <div key={leave._id} className="day-leave-card">
                  <div className="day-leave-card-header">
                    <div className="leave-user-info">
                      <h4>
                        {leave.therapist?.firstName || "نامشخص"}{" "}
                        {leave.therapist?.lastName || ""}
                      </h4>
                      <div className="user-details">
                       
                        { leave.therapist?.role && (
                          <span className="user-role">
                            ({getUserRoleText(leave.therapist?.role)})
                          </span>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(leave.status)}
                  </div>

                  <div className="leave-details">
                    <div className="detail-item">
                      <span className="label">نوع مرخصی:</span>
                      <span>{getTypeText(leave.type)}</span>
                    </div>

                    {leave.type === "daily" ? (
                      <>
                        <div className="detail-item">
                          <span className="label">از تاریخ:</span>
                          <span>
                            {moment(leave.startDate).format("jYYYY/jMM/jDD")}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="label">تا تاریخ:</span>
                          <span>
                            {moment(leave.endDate).format("jYYYY/jMM/jDD")}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="detail-item">
                          <span className="label">زمان شروع:</span>
                          <span>{leave.startTime}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">زمان پایان:</span>
                          <span>{leave.endTime}</span>
                        </div>
                      </>
                    )}

                    <div className="detail-item">
                      <span className="label">دلیل:</span>
                      <span>{leave.reason}</span>
                    </div>

                    {leave.adminNotes && (
                      <div className="detail-item full-width">
                        <span className="label">یادداشت ادمین:</span>
                        <span>{leave.adminNotes}</span>
                      </div>
                    )}
                  </div>

                  {leave.status === "pending" && (
                    <div className="request-actions calendar-actions">
                      <button
                        className="approve-btn"
                        onClick={() =>
                          handleApproveReject(leave._id, "approved")
                        }
                      >
                        تایید
                      </button>
                      <button
                        className="reject-btn"
                        onClick={() =>
                          handleApproveReject(leave._id, "rejected")
                        }
                      >
                        رد
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {activeTab === "register" && (
  <div className="register-section">
    <LeaveRequestForm
            therapists={therapists} onCancel={setShowForm} onSuccess={undefined}    />
  </div>
)}
    </div>
  );
};

export default LeaveRequests;
