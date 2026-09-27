import { DayOfWeek } from "../../../types/enums";
import Detailweekly from "./detailweekly";

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
    "Saturday": 1,  // شنبه
    "Sunday": 2,    // یکشنبه
    "Monday": 3,    // دوشنبه
    "Tuesday": 4,   // سه‌شنبه
    "Wednesday": 5, // چهارشنبه
    "Thursday": 6,  // پنج‌شنبه
    "Friday": 7     // جمعه
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
  selectedTherapist,
  isModalOpen,
}) {
 

  return (
    <>
      {isModalOpen && selectedTherapist && (
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
                className={activeTab === "available-time" ? "active" : ""}
                onClick={() => setActiveTab("available-time")}
              >
                روز ها و زمان های در دسترس
              </button>
              <button
                className={activeTab === "weekly" ? "active" : ""}
                onClick={() => setActiveTab("weekly")}
              >
                برنامه هفتگی
              </button>
              {/* <button
                className={activeTab === "daily" ? "active" : ""}
                onClick={() => setActiveTab("daily")}
              >
                برنامه روزانه
              </button> */}
            </div>

            {/* Tab content */}
            <div className="tab-content">
              {activeTab === "details" && (
                <div>
                  <p>نام: {selectedTherapist.firstName}</p>
                  <p>نام خانوادگی: {selectedTherapist.lastName}</p>
                  <p>شماره تماس: {selectedTherapist.phone}</p>
                  <p>تخصص: {selectedTherapist.role}</p>
                  <p>درصد پیش‌فرض: {selectedTherapist.percentDefault}</p>
                  <p>درصد معرفی: {selectedTherapist.percentIntroduced}</p>
                </div>
              )}
              {activeTab === "available-time" && (
                <div>
                  {sortDaysByPersianOrder(selectedTherapist.workDays).map((item) => (

                    <p key={item.day} >
                        {getPersianDay(item.day)}  از ساعت  {item.startTime}  الی  {item.endTime}
                    </p>
                  ))}
                  {/* میتونی داده مالی بیشتر اضافه کنی */}
                </div>
              )}
              {activeTab === "weekly" && (
                <div>
                  <Detailweekly
                  activeTab={activeTab}
selectedTherapist={selectedTherapist}/>
                </div>
              )}
              {activeTab === "daily" && (
                <div>
                  <p>برنامه روزانه این درمانگر</p>
                  {/* جدول یا اطلاعات برنامه روزانه */}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
