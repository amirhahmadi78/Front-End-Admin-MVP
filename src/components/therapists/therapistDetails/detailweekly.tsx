import moment from "moment-jalaali";
import "./detailweekly.css";

import { useDefapp_day_th_pa } from "../../../hooks/defAppointment";






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



export default function WeeklyTable({ selectedTherapist }) {
  if (!selectedTherapist || !selectedTherapist.workDays.length){
    return <p>درمانگر برنامه‌ای ندارد</p>;
  }else{


    const sortedWorkDays = sortDaysByPersianOrder(selectedTherapist.workDays)

    const{data:defApp}=useDefapp_day_th_pa({therapist:selectedTherapist._id})



const columnHeight = 840; 
const dayStartTime = 8; 
const dayEndTime = 22;  





  return (
    <div className="weekly-schedule-wrapper">
      {sortedWorkDays.map((day) => {
        const appointments =defApp&&Array.isArray(defApp)? (defApp.filter(item=>item.day==day.day) || []).slice().sort(
          (a, b) => moment(a.start).diff(moment(b.start))
        ):[]

        return (
          <div key={day._id} className="day-column">
            <div className="day-header">{getPersianDay(day.day)}</div>
            <div className="day-body" style={{ height: `${columnHeight}px` }}>
              {appointments.length > 0 ? (
                appointments.map((app, idx) => {
                  const appStart = moment(app.start);
                  const appEnd = moment(app.end);

                  // محاسبه top و height نسبت به 08:00 صبح
                  const startMinutes = (appStart.hours() - dayStartTime) * 60 + appStart.minutes();
                  const endMinutes = (appEnd.hours() - dayStartTime) * 60 + appEnd.minutes();

                  const top = startMinutes; // 1px = 1 دقیقه
                  const height = endMinutes - startMinutes;

                  return (
                    <div
                      key={idx}
                      className="appointment-slot"
                      style={{ top: `${top}px`, height: `${height}px` }}
                    >
                      {app.patientName} ({appStart.format("HH:mm")} - {appEnd.format("HH:mm")})
                      <br />
                      {app.duration} دقیقه
                    </div>
                  );
                })
              ) : (
                <div className="no-appointment">جلسه‌ای وجود ندارد</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
  }
    

}
