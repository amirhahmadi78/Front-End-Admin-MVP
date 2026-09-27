import moment from "moment-jalaali";
import { useEffect, useState } from "react";

import AppointmentForm from "./modals/ addAppointmetModal";
import GroupSessionModal from "./modals/GroupSessionModal";

import Swal from "sweetalert2";
import AppointmentModal from "./modals/AppointmentModalt";

import { useFindPatient } from "../../hooks/patient";
import { DayOfWeek } from "../../types/enums";
import {
  useDayLeaveRequest_TH,
} from "../../hooks/leaves";
import { AlertSwal } from "../../utils/errorSwal";

export default function DailyTable({
  showForm,
  trueDate,
  setShowForm,
  todayTherapists,
  editingAppointment,
  setEditingAppointment,
  onSubmit,
  allAppointments,
  showModal,
  setShowModal,
  setAllAppointments,
  showGroupModal, setShowGroupModal,
  dayWeek,
patientlist,
patientListLoading,
patientListError
}) {


  const [selectedAppointment, setSelectedAppointment] = useState(null);
  // const [showGroupModal, setShowGroupModal] = useState(false);

  const [showGroupEditModal, setShowGroupEditModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
const [filteradTh,setFilteredTH]=useState(todayTherapists||[])
const [filteradApp,setFilteredApp]=useState(allAppointments||[])
const [isFilter,setIsfilter]=useState(null)
 
  const startHour = 8;
  const endHour = 22;
  const slotHeight = 60;

  const {
    data: todayLeaves,
    isLoading: todayLeavesLoading,
    refetch:GetLeaves,
    error: todayLeavesError,
  } = useDayLeaveRequest_TH(trueDate, ["approved"]);
useEffect(()=>{
  GetLeaves()
},[trueDate])

useEffect(() => {
  // if(Array.isArray(filteradApp)&&filteradApp.length===0&&isFilter!=null){
  // return setIsfilter(null)
  // }
  
  

  if (!isFilter) {
    setFilteredApp(allAppointments || []);
    setFilteredTH(todayTherapists || []);
    return;
  }
if(isFilter.sessionType==="group"){
  return AlertSwal.Error("این قابلیت برای کلاس های گروهی میسر نیست!")
}
  const apps = (allAppointments || []).filter(
    (item) => {
      if(item.sessionType===
"individual")
        return (item.patient === isFilter.patient) 
   
    }
      
    

  );

  const thIds = new Set();

  apps.forEach((app) => {
    if (app.therapist) {
      thIds.add(app.therapist);
    }

    if (app.groupSession?.therapists) {
      app.groupSession.therapists.forEach((t) =>
        thIds.add(t.therapist?.therapistId )
      );
    }
  });

  const ths = (todayTherapists || []).filter((t) =>
    thIds.has(t._id)
  );
if (apps.length === 0) {
  setIsfilter(null);
  return
}
  setFilteredApp(apps);
  setFilteredTH(ths);

}, [isFilter, allAppointments, todayTherapists]);




return (
  <>



    {/* راهنمای وضعیت جلسات */}
    <div className="h-auto w-auto flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 overflow-visible">
      <div className="flex items-center gap-2">
        <span className="w-4 h-4 rounded bg-[#838e9eff] border border-gray-300"></span>
        <span className="text-sm text-gray-700">برنامه‌ریزی شده</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-4 h-4 rounded bg-[#05973bff] border border-gray-300"></span>
        <span className="text-sm text-gray-700">انجام شده (پرداخت‌شده)</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-4 h-4 rounded bg-[#a1a601ff] border border-gray-300"></span>
        <span className="text-sm text-gray-700">انجام شده (بدون پرداخت)</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-4 h-4 rounded bg-[#0b91a9ff] border border-gray-300"></span>
        <span className="text-sm text-gray-700">بیمه‌ای</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-4 h-4 rounded bg-red-600 border border-gray-300"></span>
        <span className="text-sm text-gray-700">لغو شده</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-4 h-4 rounded bg-black border border-gray-300"></span>
        <span className="text-sm text-gray-700">ناهار یا استراحت</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-base">✔️</span>
        <span className="text-sm text-gray-700">ویزیت درمانگر</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-base">❌</span>
        <span className="text-sm text-gray-700">غیبت درمانگر</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-4 h-4 rounded bg-red-100 border border-dashed border-red-500"></span>
        <span className="text-sm text-gray-700">مرخصی</span>
      </div>
    </div>

    {/* wrapper اصلی جدول با اسکرول افقی */}
 <div
    className="overflow-x-auto border pb-4! border-gray-300 rounded-lg shadow-sm mt-2 rtl"
  >


      <div className="inline-block min-w-full  "> {/* اضافه شد: wrapper داخلی */}
        {/* هدر جدول */}
       <div className="flex min-w-max bg-gradient-to-b from-gray-100 to-gray-50 border-b-2 border-gray-300 sticky top-0 z-50">

          <div className="w-20 flex-shrink-0 flex items-center justify-center font-bold text-gray-700 border-l border-gray-300 py-3">
            ساعت
          </div>
          {!filteradTh || !Array.isArray(filteradTh) || filteradTh.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-8">
              <h2 className="text-lg font-semibold text-gray-600">در روز مورد نظر درمانگر وجود ندارد</h2>
            </div>
          ) : (
            filteradTh.map((t) => (
              <div 
                key={t._id} 
                className="w-45 flex-shrink-0 flex items-center justify-center font-semibold text-gray-800 border-l border-gray-300 py-3 px-2 text-center" // اضافه شد: flex-shrink-0
              >
                {t.firstName + " " + t.lastName}
            
              </div>
             
            ))
          )}
        </div>

        {/* بدنه جدول */}
        <div className="flex min-w-max">
          {/* ستون زمان */}
         <div className="w-20 flex-shrink-0 border-l border-gray-300 sticky left-0 bg-white z-30">


            {Array.from({ length: endHour - startHour }, (_, i) => (
              <div 
                key={i} 
                className="h-[60px] flex items-center justify-center text-sm font-medium text-gray-600 border-b border-gray-200"
              >
                {startHour + i}:00
              </div>
            ))}
          </div>

          {/* ستون درمانگران */}
          {!Array.isArray(filteradTh) ||
          filteradTh === undefined ||
          filteradTh.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-8">
              <h2 className="text-lg font-semibold text-gray-600">در روز مورد نظر درمانگر وجود ندارد</h2>
            </div>
          ) : (
            filteradTh.map((t) => {
              const dayName = moment(trueDate).locale("en").format("dddd");
              const workDay = t.workDays?.find((wd) => wd.day === dayName);

              return (
                <div
                  key={t._id}
                  className=" text-center w-45 shrink-0 relative border-l border-gray-300" // اضافه شد: flex-shrink-0
                  style={{ height: `${(endHour - startHour) * slotHeight}px` }}
                >
                  {/* پس‌زمینه ساعت کاری */}
                  {(() => {
                    const blocks = [];
                    if (workDay) {

                      
                      const { startTime, endTime } = workDay;
                      const [startH, startM] = startTime.split(":").map(Number);
                      const [endH, endM] = endTime.split(":").map(Number);

                      // بلوک قبل از شروع کار
                      if (
                        startH > startHour ||
                        (startH === startHour && startM > 0)
                      ) {
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

                      // بلوک بعد از اتمام کار
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
                              height: `${height}px` 
                            }}
                          >
                            اتمام در {endTime}
                          </div>
                        );
                      }
                    } else {
                      // کلاً حضور ندارد
                      blocks.push(
                        <div
                          key="full-off"
                          className="absolute top-0 w-full bg-slate-100 flex items-center justify-center text-slate-500 text-[11px] pointer-events-none"
                          style={{ height: `${(endHour - startHour) * slotHeight}px` }}
                        >
                          امروز حضور ندارد
                        </div>
                      );
                    }
                    return blocks;
                  })()}

                  {/* نمایش مرخصی‌های تایید شده */}
                  {todayLeaves?.leaveRequests
                    ?.filter(
                      (leave) =>
                        (leave.therapist?._id ||
                          leave.therapist ||
                          leave.user?._id ||
                          leave.user) === t._id
                    )
                    .map((leave, idx) => {
                      let top = 0;
                      let height = (endHour - startHour) * slotHeight;

                      if (leave.type === "hourly") {
                        const [startH, startM] = leave.startTime
                          .split(":")
                          .map(Number);
                        const [endH, endM] = leave.endTime
                          .split(":")
                          .map(Number);

                        top =
                          (startH - startHour) * slotHeight +
                          (startM / 60) * slotHeight;
                        height =
                          (endH - startH) * slotHeight +
                          ((endM - startM) / 60) * slotHeight;
                      }

                      return (
                        <div
                          key={`leave-${idx}`}
                          className="absolute w-full bg-red-100 border border-dashed border-red-500 text-red-800 z-10 flex items-center justify-center text-[11px] pointer-events-none text-center"
                          style={{
                            top: `${top}px`,
                            height: `${height}px`
                          }}
                        >
                          مرخصی{" "}
                          {leave.type === "hourly"
                            ? `(${leave.startTime}-${leave.endTime})`
                            : "(روزانه)"}
                        </div>
                      );
                    })}

                  {/* جلسات */}
                  {Array.isArray(filteradApp) &&
                    filteradApp
                     .filter(
  (app) =>
    // اول جلسات فردی را چک کن
    app.therapist === t._id ||
    // بعد جلسات گروهی
    (app.sessionType === "group" && // مطمئن شو که جلسه گروهی است
      app.groupSession?.therapists?.some(
        (therapistEntry) => //therapistEntry یک آبجکت از نوع GroupTherapistDto است
          therapistEntry.therapistId === t._id // <<< درست: دسترسی به therapistId داخل آبجکت
      ))
)

                      .map((app, idx) => {
                        const startMoment = moment(app.start);
                        const endMoment = moment(app.end);

                        const top =
                          (startMoment.hours() - startHour) * slotHeight +
                          (startMoment.minutes() / 60) * slotHeight;
                        const height =
                          (endMoment.hours() - startMoment.hours()) * slotHeight +
                          ((endMoment.minutes() - startMoment.minutes()) / 60) *
                            slotHeight;

                        let backgroundColor = "#010101ff";
                        switch (app.status_clinic) {
                          case "scheduled":
                            backgroundColor = "#838e9eff";
                            break;
                          case "completed-paid":
                            backgroundColor = "#05973bff";
                            break;
                          case "completed-notpaid":
                            backgroundColor = "#a1a601ff";
                            break;
                          case "bimeh":
                            backgroundColor = "#0b91a9ff";
                            break;
                          case "canceled":
                            backgroundColor = "#dc2626";
                            break;
                          case "break":
                            backgroundColor = "#000000ff";
                            break;
                          default:
                            backgroundColor = "#000000ff";
                        }

                        let cornerIcon = "";
                        if (app.status_therapist === "completed") {
                          cornerIcon = "✔️";
                        } else if (app.status_therapist === "absent") {
                          cornerIcon = "❌";
                        }

                        return (
                          <div key={idx+3}>
                          <div
                            key={idx}
                            className=" border-b border absolute w-[calc(85%)] text-white rounded cursor-pointer overflow-hidden text-[10px] leading-tight z-20 p-0.5 px-1.5 mx-1"
                            style={{
                              top: `${top}px`,
                              height: `${height}px`,
                              background: backgroundColor
                            }}
                            onClick={() => {
                              setSelectedAppointment(app);
                              setShowModal(true);
                            }}
                          >
                            {cornerIcon && (
                              <span className="absolute top-0.5 right-1 text-xs">
                                {cornerIcon}
                              </span>
                            )}
         
                            <div className="font-bold">
  {app.sessionType === "group"
    ? `گروهی (${app.groupSession?.patients?.length || 0} نفر)`
    : app.patientName}
</div>
                            <div>
                              {startMoment.format("HH:mm")} -{" "}
                              {endMoment.format("HH:mm")} ({app.duration} دقیقه)
                            </div>
                          </div>
                              <button 
  style={{
    top: `${top}px`,
    height: `${height}px`,
    background: backgroundColor
  }}
  onClick={(e) => {
    e.stopPropagation();

    if (isFilter?.patient === app.patient) {
      setIsfilter(null); // برگشت به حالت عادی
    } else {
      setIsfilter({
        patient: app.patient
      });
    }
  }}
  className="rounded-2xl absolute top-0.5 left-1 text-xl"
>
{isFilter?.patient === app.patient ? "✖" : "🔍"}
</button>

                          </div>
                        );
                      })}
                </div>
              );
            })
          )}
        </div>
      </div>
      
    </div>

    {showModal && selectedAppointment && (
      <AppointmentModal
      patientlist={patientlist}
        todayTherapists={todayTherapists}
        appointment={selectedAppointment}
        allAppointments={allAppointments}
        setAllAppointments={setAllAppointments}
        setShowModal={setShowModal}
        setShowForm={setShowForm}
        showForm={showForm}
        onEdit={(app) => {
          setEditingAppointment(app);
          setShowForm(true);
        }}
        onEditGroup={(groupApp) => {
          setEditingGroup(groupApp);
          setShowGroupEditModal(true);
          setShowModal(false);
        }}
      />
    )}

    {/* مودال ویرایش کلاس گروهی */}
    {showGroupEditModal && editingGroup && (
      <GroupSessionModal
        isOpen={showGroupEditModal}
        onClose={() => {
          setShowGroupEditModal(false);
          setEditingGroup(null);
        }}
        trueDate={moment(editingGroup.start).format("YYYY-MM-DD")}
        todayTherapists={todayTherapists}
        patientlist={patientlist}
        patientListLoading={patientListLoading}
        patientListError={patientListError}
        allAppointments={allAppointments}
        setAllAppointments={setAllAppointments}
        editingGroup={editingGroup}
        onGroupUpdated={(updatedGroup) => {
          const updated = Array.isArray(allAppointments)
            ? allAppointments.map((app) =>
                app._id === updatedGroup._id ? updatedGroup : app
              )
            : [];
          setAllAppointments(updated);
          setShowGroupEditModal(false);

          Swal.fire({
            title: "✅ ویرایش موفق",
            text: "کلاس گروهی با موفقیت ویرایش شد",
            icon: "success",
            timer: 2000,
          });
        }}
      />
    )}

    {showGroupModal && (
      <GroupSessionModal
        isOpen={showGroupModal}
        onClose={() => {
          setShowGroupModal(false);
        }}
        trueDate={trueDate}
        todayTherapists={todayTherapists}
        patientlist={patientlist}
        patientListLoading={patientListLoading}
        patientListError={patientListError}
        allAppointments={allAppointments}
        setAllAppointments={setAllAppointments}
        editingGroup={null}
        onGroupUpdated={(newGroup) => {
          setAllAppointments((prev) => [...prev, newGroup]);
          setShowGroupModal(false);

          Swal.fire({
            title: "✅ ایجاد موفق",
            text: "کلاس گروهی با موفقیت ایجاد شد",
            icon: "success",
            timer: 2000,
          });
        }}
      />
    )}

    {showForm && (
      <AppointmentForm
        allAppointments={allAppointments}
        setAllAppointments={setAllAppointments}
        setEditingAppointment={setEditingAppointment}
        onSubmit={(data) => onSubmit(data)}
        date={editingAppointment ? editingAppointment.start : trueDate}
        setShowForm={setShowForm}
        showForm={showForm}
        editingAppointment={editingAppointment}
        trueDate={editingAppointment ? editingAppointment.start : trueDate}
        todayTherapists={todayTherapists} 
        groupModal={undefined} 
        setGroupModal={undefined}
      />
    )}
  </>
);



}
