import moment from "moment-jalaali";
import AddDefAppointment from "./addDefAppointment";



export default function DailyTable({ todayTherapists, editingAppointment,selectedDay,defAppointments ,showModal,setShowModal,editMode,setEditMode,setEditingAppointment}) {
  const eng = selectedDay.eng;
  const startHour = 8;
  const endHour = 22;
  const slotHeight = 60; // ارتفاع هر ساعت به پیکسل

 
return (
  <div
    className="overflow-x-auto border pb-4! border-gray-300 rounded-lg shadow-sm mt-2 rtl"
  >
    <div className="inline-block min-w-full">
      {/* header */}
      <div className="flex min-w-max bg-gradient-to-b from-gray-100 to-gray-50 border-b-2 border-gray-300">
        <div className="w-20 flex-shrink-0 flex items-center justify-center font-bold text-gray-700 border-l border-gray-300 py-3">
          ساعت
        </div>

        {!Array.isArray(todayTherapists) || !todayTherapists.length ? (
          <div className="flex-1 flex items-center justify-center py-8">
            <h2 className="text-lg font-semibold text-gray-600">
              درمانگری وجود ندارد
            </h2>
          </div>
        ) : (
          todayTherapists.map((t) => (
            <div
              key={t._id}
              className="w-[200px] flex-shrink-0 flex items-center justify-center font-semibold text-gray-800 border-l border-gray-300 py-3 px-2 text-center"
            >
              {t.firstName + " " + t.lastName}
            </div>
          ))
        )}
      </div>

      {/* body */}
      <div className="flex min-w-max">
        {/* time column */}
        <div className="w-20 flex-shrink-0 border-l border-gray-300 bg-slate-50">
          {Array.from({ length: endHour - startHour }, (_, i) => (
            <div
              key={i}
              className="h-[60px] flex items-center justify-center text-sm font-medium text-gray-600 border-b border-gray-200"
            >
              {startHour + i}:00
            </div>
          ))}
        </div>

        {/* therapists */}
        {!Array.isArray(todayTherapists) || !todayTherapists.length ? (
          <div className="flex-1 flex items-center justify-center py-8">
            <h2 className="text-lg font-semibold text-gray-600">
              درمانگری وجود ندارد
            </h2>
          </div>
        ) : (
          todayTherapists.map((t) => {
            const allAppointments =
              defAppointments.filter((item) => item?.therapist == t._id) || [];

            const appsForDay = allAppointments?.filter((app) => {
              const appDay = moment(app.start).format("dddd");
              return appDay === eng;
            });

            const workDay = t.workDays?.find((wd) => wd.day === eng);

            return (
              <div
                key={t._id}
                className="relative w-[200px] shrink-0 border-l border-gray-300 text-center"
                style={{ height: `${(endHour - startHour) * slotHeight}px` }}
              >
                {/* background work blocks */}
                {(() => {
                  const blocks = [];

                  if (workDay) {
                    const { startTime, endTime } = workDay;
                    const [startH, startM] = startTime.split(":").map(Number);
                    const [endH, endM] = endTime.split(":").map(Number);

                    if (startH > startHour || (startH === startHour && startM > 0)) {
                      const height =
                        (startH - startHour) * slotHeight +
                        (startM / 60) * slotHeight;

                      blocks.push(
                        <div
                          key="off-before"
                          className="absolute top-0 w-full bg-slate-100 flex items-center justify-center text-slate-500 text-[11px] border-b border-slate-200 pointer-events-none"
                          style={{ height: `${height}px` }}
                        >
                          شروع از {startTime}
                        </div>
                      );
                    }

                    if (endH < endHour || (endH === endHour && endM < 60)) {
                      const top =
                        (endH - startHour) * slotHeight +
                        (endM / 60) * slotHeight;

                      const height =
                        (endHour - endH) * slotHeight -
                        (endM / 60) * slotHeight;

                      blocks.push(
                        <div
                          key="off-after"
                          className="absolute w-full bg-slate-100 flex items-center justify-center text-slate-500 text-[11px] border-t border-slate-200 pointer-events-none"
                          style={{
                            top: `${top}px`,
                            height: `${height}px`,
                          }}
                        >
                          اتمام در {endTime}
                        </div>
                      );
                    }
                  } else {
                    blocks.push(
                      <div
                        key="full-off"
                        className="absolute top-0 w-full bg-slate-100 flex items-center justify-center text-slate-500 text-[11px] pointer-events-none"
                        style={{
                          height: `${(endHour - startHour) * slotHeight}px`,
                        }}
                      >
                        امروز حضور ندارد
                      </div>
                    );
                  }

                  return blocks;
                })()}

                {/* appointments */}
                {appsForDay?.map((app) => {
                  const startMoment = moment(app.start);
                  const endMoment = moment(app.end);

                  const top =
                    (startMoment.hours() - startHour) * slotHeight +
                    (startMoment.minutes() / 60) * slotHeight;

                  const height =
                    (endMoment.diff(startMoment, "minutes") / 60) * slotHeight;

                  return (
                    <div
                      key={app._id}
                      onClick={() => {
                        setShowModal(true);
                        setEditMode(true);
                        setEditingAppointment(app);
                      }}
                      className="absolute  w-[100%] border-b-1 border-x-2 text-white rounded cursor-pointer overflow-hidden text-[10px] leading-tight z-20 p-1"
                      style={{
                        top: `${top}px`,
                        height: `${height}px`,
                        background:
                          app.type == "braek" || app.type == "lunch"
                            ? "#000000"
                            : "#4caf50",
                      }}
                    >
                      <div className="font-bold">{app.patientName}</div>
                      <div>
                        {startMoment.format("HH:mm")} -{" "}
                        {endMoment.format("HH:mm")} ({app.duration} دقیقه)
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })
        )}
      </div>
    </div>

    <AddDefAppointment
      editingAppointment={editingAppointment}
      setEditingAppointment={setEditingAppointment}
    />
  </div>
);

}
