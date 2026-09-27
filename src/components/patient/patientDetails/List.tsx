import WeeklyTable from "./detailweekly";
import moment from "moment-jalaali";

import { useCheckPatient } from "../../../hooks/patient";

function getPersianDay(englishDay) {
  switch (englishDay) {
    case "Saturday":
      return "شنبه";
    case "Sunday":
      return "یکشنبه";
    case "Monday":
      return "دوشنبه";
    case "Tuesday":
      return "سه‌شنبه";
    case "Wednesday":
      return "چهارشنبه";
    case "Thursday":
      return "پنج‌شنبه";
    case "Friday":
      return "جمعه";
    default:
      return "نامشخص";
  }
}
const getDayOrder = (englishDay) => {
  const dayOrder = {
    Saturday: 1, // شنبه
    Sunday: 2, // یکشنبه
    Monday: 3, // دوشنبه
    Tuesday: 4, // سه‌شنبه
    Wednesday: 5, // چهارشنبه
    Thursday: 6, // پنج‌شنبه
    Friday: 7, // جمعه
  };
  return dayOrder[englishDay] || 8;
};


// تابع برای مرتب‌سازی آرایه روزها
const sortDaysByPersianOrder = (days) => {
  return [...days].sort((a, b) => {
    return getDayOrder(a.day) - getDayOrder(b.day);
  });
};

export default function List({
  closeModal,
  activeTab,
  setActiveTab,
  selectedPatient,
  isModalOpen,
}) {
  if (!selectedPatient) {
    return null
  }

  const {
    data: detPatient,
    isLoading: detLoading,
    isError: detError,
  } = useCheckPatient(selectedPatient._id, 1);


  return (
    <>
      {isModalOpen && selectedPatient && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="close-modal" onClick={closeModal}>
              ×
            </button>

            {/* Tab headers */}
            <div className="tabs">
              <button
                className={activeTab === "details" ? "active" : ""}
                onClick={() => setActiveTab("details")}
              >
                مشخصات
              </button>
              <button
                className={activeTab === "cancelDet" ? "active" : ""}
                onClick={() => {
                  setActiveTab("cancelDet");
                }}
              >
                کنسل ها
              </button>
              <button
                className={activeTab === "available" ? "active" : ""}
                onClick={() => setActiveTab("available")}
              >
                روزهای قابل برنامه ریزی
              </button>
              <button
                className={activeTab === "weekly" ? "active" : ""}
                onClick={() => setActiveTab("weekly")}
              >
                برنامه هفتگی
              </button>
            </div>

            {/* Tab content */}
            <div className="tab-content">
              {activeTab === "details" && (
                <div>
                  <p>نام: {selectedPatient.firstName}</p>
                  <p>نام خانوادگی: {selectedPatient.lastName}</p>
                  <p>شماره تماس: {selectedPatient.phone}</p>
                  <p>آدرس: {selectedPatient.address}</p>
                  <p>شیوه ی پرداخت: {selectedPatient.paymentType}</p>
                  <p>درصد تخفیف: {selectedPatient.discountPercent}</p>
                  {!selectedPatient.introducedBy ? (
                    <p>فاقد درمانگر معرف</p>
                  ) : (
                    <p>
                      درمانگر معرف:{" "}
                      {selectedPatient.introducedBy.firstName +
                        " " +
                        selectedPatient.introducedBy.lastName}
                    </p>
                  )}
                </div>
              )}
              {activeTab === "cancelDet" && detLoading == true ? (
                <p>در حال دریافت داده ...</p>
              ) : detError == true ? (
                <p>خطا در دریافت داده ها !</p>
              ) : (
                <div>
                  <p>
                    درصد کنسل کردن:{" "}
                    {Math.round(detPatient?.stats?.CancelPercent)}
                  </p>
                  {detPatient?.stats?.totalAppointments == 0 ? (
                    <p> فاقد هر گونه کلاس!</p>
                  ) :
                  detPatient?.stats?.canceledCount==0?(<p>این مراجع جلسه ی کنسل شده ندارد</p>):
                  (
                    detPatient.canceledAppointments?.map((item) => (
                      <p>
                        {" "}
                        # درمانگر: {item.therapistName}/ ساعت شروع :{" "}
                        {moment(item.start).format("HH:mm")}/ طول جلسه:
                        {item.duration}/ مبلغ:{item.patientFee}/ تاریخ:{" "}
                        {moment(item.localDay).format("jYYYY/jMM/jDD")}{" "}
                      </p>
                    ))
                  )}
                  {/* میتونی داده مالی بیشتر اضافه کنی */}
                </div>
              )}
              {activeTab === "weekly" && (
                <WeeklyTable selectedPatient={selectedPatient} />
              )}
              {activeTab === "available" && (
                <div>
                  {sortDaysByPersianOrder(selectedPatient.workDays).map(
                    (item) => (
                      <p key={item.day}>
                        {getPersianDay(item.day)} از ساعت {item.startTime} الی{" "}
                        {item.endTime}
                      </p>
                    ),
                  )}
                  {/* میتونی داده مالی بیشتر اضافه کنی */}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
