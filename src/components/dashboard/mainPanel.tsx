import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
// import gregorian from "react-date-object/calendars/gregorian";

import "./mainpanel.css";
import { useEffect, useState, type SetStateAction } from "react";

import moment from "moment-jalaali";
import DailyTable from "./DailyTable";
import Swal from "sweetalert2";
import { useTherapists } from "../../hooks/therapist";
import { DayOfWeek } from "../../types/therapists";
import {
  useCreateAppointment,
  useEditAppointment,
  useFindAppointments,
  usePublishDef,
} from "../../hooks/appointment";
import AppointmentForm from "./modals/ addAppointmetModal";
import { GetDailyDefAppointmets } from "../../services/DefAppointment"; // بزارم باشه

import type {
  DTOEditAppointment,
  DTONewAppointment,
} from "../../types/appointment";

import { useFindeLeavesPatients } from "../../hooks/leaves-patients";
import { useFindNotes } from "../../hooks/notes";

import GroupSessionModal from "./modals/GroupSessionModal";
import { useFindPatient } from "../../hooks/patient";
import NoteModal from "../patientManagement/NoteModal";
import LeaveModal from "../patientManagement/LeaveModal";
import QuickAccessPatientModal from "./quick-access/Make-Edit-Patient";
import QuickAccessTransaction from "./quick-access/wallet-transaction";
import QuickAccessPayment from "./quick-access/QuickAccessPayment";
import QuickAccessLeave from "./quick-access/QuickAccessLeave";
import QuickAccessTherapist from "./quick-access/QuickAccessTherapist";
import QuickAccessAccess from "./quick-access/QuickAccessAccess";

function getDayName(dayNumber: number): string {
  type DayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;
  const days: Record<DayIndex, string> = {
    0: "Sunday",
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday",
  };

  if (dayNumber in days) {
    return days[dayNumber as DayIndex];
  }

  return "invalid date";
}

export default function MainAdmin() {
  const [showDailyModal, setShowDailyModal] = useState(false);
  const [date, setDate] = useState(new Date());
  const [trueDate, setTrueDate] = useState(new Date(date));
  const [showModal, setShowModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [showForm, setShowForm] = useState(false); // برای فرم افزودن/ویرایش
  const [noteForm, setNoteForm] = useState(false);
  const [leavesForm, setLeavesForm] = useState(false);
  const [day, setDay] = useState(DayOfWeek[new Date().getDay()]);


  const [patientQA,setPatientQA]=useState(false)
  const [walletQA,setWalletQA]=useState(false)
    const [paymentQA,setPaymentQA]=useState(false)
        const [leaveQA,setLeaveQA]=useState(false)
  const [therapistQA,setTherapistQA]=useState(false)
    const [accessQA,setAccessQA]=useState(false)
  const [localDay, setLocalDay] = useState(
    moment(new Date()).format("YYYY-MM-DD"),
  );

  const {
    data: todayTherapists,
    isLoading: dayTherapistLoading,
    error: dayTherapistError,
  } = useTherapists({ days: [day] });

  const {
    data: allAppointments,
    isLoading: allAppointmentsLoadin,
    error: allAppointmentsError,
    refetch: refetcAllApps,
  } = useFindAppointments({
    localDay: localDay,
  });

  const {
    data: patientLeaves,
    isLoading: patientLeavesLoading,
    error: patientLeavesError,
  } = useFindeLeavesPatients(trueDate);


  const {
    data: adminNotes,
    isLoading: adminNotesLoading,
    error: adminNotesError,
  } = useFindNotes(trueDate);
  const dayWeek = DayOfWeek[moment(trueDate).day()];
  const {
    data: patientlist,
    isLoading: patientListLoading,
    error: patientListError,
  } = useFindPatient({ days: [dayWeek] });
  const { mutateAsync: publishPlan, isPending } = usePublishDef();
  const { mutate: editAppointment } = useEditAppointment();

  const { mutate: createAppointment } = useCreateAppointment();

  useEffect(() => {
    const newTrueDate = date?.toDate ? date.toDate() : new Date(date);
    setTrueDate(newTrueDate);
  }, [date]);

  useEffect(() => {
    // این قسمت بعد از آنکه trueDate تغییر کرد اجرا می‌شود
    setDay(DayOfWeek[trueDate.getDay()]);
    setLocalDay(moment(trueDate).format("YYYY-MM-DD"));
  }, [trueDate]);

  const handleChange = (d: SetStateAction<Date>) => {
    setDate(d);
  };

  const handleEditAppointment = async (data) => {
    delete data.time;
    delete data.date;
    delete data.useCustomPrice;
    delete data.priceNotFound;
    const payload: DTOEditAppointment = {
      ...data,
      appointmentId: editingAppointment._id,
    };
    editAppointment(payload);

    setShowForm(false);
    setShowModal(false);

    setEditingAppointment(null);
  };

  const handleAddAppointment = async (data: DTONewAppointment) => {
    delete data.time;
    delete data.date;
    delete data.useCustomPrice;
    delete data.priceNotFound;
    createAppointment(data);

    setShowForm(false);
  };

  const handlePublishplan = async () => {
    try {
      if (allAppointments.length != 0) {
        return Swal.fire({
          title: "خطا",
          text: "بعلت وجود کلاس برنامه ریزی شده در این تاریخ امکان تعبیه ی برنامه ی ثابت وجود ندارد! لطفا اول جلسات را حذف کنید",
          icon: "error",
        });
      }
      const day = getDayName(moment(trueDate).day());

      const res = await GetDailyDefAppointmets(day);
      const AppoinList = res.data;
      if (AppoinList.length == 0) {
        return Swal.fire({
          title: "خطا",
          text: "هیچ جلسه ای در برنامه ی ثابت برای امروز وجود ندارد",

          icon: "error",
        });
      }

      const result = await Swal.fire({
        title: "اطمینان دارید?",
        text: "برنامه ی ثابت برای این تاریخ وجود دارد آیا از تعبیه آن مطمین هستید؟!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        cancelButtonText: "لغو",
        confirmButtonText: "بله انجام شود!",
      });

      if (result.isConfirmed) {
        publishPlan(trueDate).then(() => refetcAllApps());
      }
    } catch {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      (error: unknown) => {
        Swal.fire({
          title: "انجام نشد!",
          text: "عملیات تعبیه ی برنامه ثابت ناموفق بود!",
          icon: "error",
        });
      };
    }
  };

  // فیلتر کردن یادداشت‌ها و مرخصی‌ها برای تاریخ انتخاب شده
  const selectedDateStr = moment(trueDate).format("YYYY-MM-DD");
  const filteredNotes =
    adminNotes && Array.isArray(adminNotes)
      ? adminNotes?.filter((note) => {
          const start = moment(note.startDate).format("YYYY-MM-DD");
          const end = moment(note.endDate).format("YYYY-MM-DD");
          return selectedDateStr >= start && selectedDateStr <= end;
        })
      : [];

  const filteredLeaves =
    patientLeaves && Array.isArray(patientLeaves)
      ? patientLeaves?.filter((leave) => {
          const start = moment(leave.startDate).format("YYYY-MM-DD");
          const end = moment(leave.endDate).format("YYYY-MM-DD");
          return selectedDateStr >= start && selectedDateStr <= end;
        })
      : [];

  return (
    <div className="m-4! flex flex-col box-border  mx-auto mt-20 ">
      {/* Main content */}
      <main className="w-full p-0  box-border flex-1 flex flex-col min-h-full ">
        <div className="flex gap-5 p-5 flex-1">
          <div className="flex-[4] flex flex-col min-w-0">
            <div className="flex-col pr-[50px] pl-5 pt-2.5 flex justify-between  mr-2! mb-5">
              <div className="flex mt-12! gap-2.5 ">
                <label className="">تاریخ:</label>
                <DatePicker
                  value={date}
                  onChange={handleChange}
                  calendar={persian}
                  locale={persian_fa}
                  format="YYYY/MM/DD"
                  calendarPosition="bottom-right"
                  style={{
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    padding: "6px 10px",
                  }}
                />
              </div>

              <button
                onClick={() => handlePublishplan()}
                disabled={isPending}
                className="h-8 m-1!  overflow-x-auto min-w-0 bg-[#5c66f6] hover:bg-[#7c3aed] text-white  py-6 px-12 rounded-lg text-[15px] font-semibold cursor-pointer transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(139,92,246,0.3)] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                تعبیه ی برنامه ثابت روز
              </button>

              {!editingAppointment && (
                <AppointmentForm
                  allAppointments={allAppointments}
                  onSubmit={handleAddAppointment}
                  todayTherapists={todayTherapists}
                  trueDate={trueDate}
                  date={date}
                  showForm={showForm}
                  setShowForm={setShowForm}
                  setEditingAppointment={setEditingAppointment}
                />
              )}
            </div>
            <button
              className="h-9  overflow-x-auto min-w-0 mb-1! left-2! bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg shadow-md transition-colors duration-200"
              onClick={() => setShowForm(true)}
            >
              افزودن جلسه درمانی
            </button>
            <button
              className="h-9  overflow-x-auto min-w-0 mb-1! left-2! bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg shadow-md transition-colors duration-200"
              onClick={() => setShowGroupModal(true)}
            >
              افزودن جلسه گروهی
            </button>
            <button
              className="md:hidden h-10 w-full bg-indigo-600 text-white rounded-lg"
              onClick={() => setShowDailyModal(true)}
            >
              مشاهده برنامه روز
            </button>
            <div className="hidden md:block overflow-x-auto min-w-0">
              <DailyTable
                onSubmit={
                  !editingAppointment
                    ? handleAddAppointment
                    : handleEditAppointment
                }
                patientlist={patientlist}
                showModal={showModal}
                trueDate={trueDate}
                setShowModal={setShowModal}
                showForm={showForm}
                setShowForm={setShowForm}
                editingAppointment={editingAppointment}
                setEditingAppointment={setEditingAppointment}
                todayTherapists={todayTherapists}
                allAppointments={allAppointments}
                showGroupModal={showGroupModal}
                setShowGroupModal={setShowGroupModal}
              />
            </div>
            {showDailyModal && (
              <div className="fixed m-3!  inset-0 z-50  bg-black/40 flex items-end md:hidden">
                <div className="w-full h-[100dvh] bg-white rounded-t-2xl p-3 overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between border-b pb-2 px-2">
                    <h2 className="font-bold text-lg">برنامه روز</h2>

                    <button
                      onClick={() => setShowDailyModal(false)}
                      className="text-red-500 text-xl"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="flex-1 overflow-auto">
                    <DailyTable
                      patientlist={patientlist}
                      onSubmit={
                        !editingAppointment
                          ? handleAddAppointment
                          : handleEditAppointment
                      }
                      showModal={showModal}
                      trueDate={trueDate}
                      setShowModal={setShowModal}
                      showForm={showForm}
                      setShowForm={setShowForm}
                      editingAppointment={editingAppointment}
                      setEditingAppointment={setEditingAppointment}
                      todayTherapists={todayTherapists}
                      allAppointments={allAppointments}
                      showGroupModal={showGroupModal}
                      setShowGroupModal={setShowGroupModal}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
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
              editingGroup={null}
            />
          )}
          <aside className="overflow-scroll!  flex-[0.8] min-w-37.5 flex flex-col gap-5 bg-[#f8fafc] p-5 rounded-xl border border-[#e2e8f0] max-h-250">
            {/* یادداشت‌ها */}
            <div className="bg-white p-51 items-center! overflow-visible! rounded-[10px] shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
              <h3 className="mt-0 text-[1.1rem] text-[#1e293b] border-b-2 border-[#3b82f6] pb-2 mb-3">
                یادداشت‌های امروز
              </h3>

              {filteredNotes.length === 0 ? (
                <p className="text-[#94a3b8] italic text-[0.9rem] text-center">
                  یادداشتی ثبت نشده است.
                </p>
              ) : (
                <ul className="list-none p-0 m-0">
                  {filteredNotes.map((note) => (
                    <li
                      key={note._id}
                      className="text-center wrap-break-word p-1 m-1! bg-[#fff9db] border-r-4 border-[#fab005] rounded mb-2.5 text-[0.9rem] text-[#444] leading-[1.5]"
                    >
                      {note.text}
                    </li>
                  ))}
                </ul>
              )}
        <button
  onClick={() => setNoteForm(true)}
  className="block w-full mx-auto! bg-yellow-300 rounded-2xl p-1! border-yellow-400 text-x border-2!"
>
  ثبت یادداشت
</button>
            </div>

            {/* مرخصی‌ها */}
            <div className=" overflow-visible!  bg-white gap-1 rounded-[10px] shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
              <h3 className="mt-1 text-[1.1rem] text-[#1e293b] border-b-2 border-[#3b82f6] p-1 mb-1">
                مرخصی‌های مراجعین
              </h3>

              {filteredLeaves?.length === 0 ? (
                <p className="text-[#94a3b8] italic text-[0.9rem] text-center">
                  مرخصی ثبت نشده است.
                </p>
              ) : (
                <ul className="flex flex-col gap-1 list-none p-0 m-0">
                  {filteredLeaves?.map((leave) => (
                    <li
                      key={leave._id}
                      className="text-center bg-[#e3fafc] border-r-4 border-[#15aabf] rounded mb-2.5 text-[0.9rem] text-[#444]"
                    >
                      <strong className="block text-[#0b7285] mb-1">
                        {leave.patientId?.firstName} {leave.patientId?.lastName}
                      </strong>

                      {leave.reason && (
                        <p className="m-0 wrap-break-word text-[0.85rem] text-[#495057] italic">
                          {leave.reason}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
           <button
  onClick={() => setLeavesForm(true)}
  className="block mx-auto! w-full bg-sky-300 rounded-2xl p-1! border-sky-400 text-x border-2!"
>
  ثبت مرخصی
</button>
            </div>
            {/* دسترسی سریع */}
<div className="bg-white p-3! rounded-[10px] shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
  <h3 className="mt-0! text-[1.1rem] text-[#1e293b] border-b-2 border-[#3b82f6] pb-2! mb-3!">
    دسترسی سریع
  </h3>

  <div className="grid grid-cols-1 gap-2">
    <button
      type="button"
      onClick={() => {
        setPatientQA(true)
      }}
      className="w-full text-right bg-[#e7f5ff] hover:bg-[#d0ebff] border-r-4 border-[#1c7ed6] text-[#0b4a80] font-medium text-[0.9rem] py-2.5! px-3! rounded-lg transition-colors duration-200 cursor-pointer"
    >
      ثبت نام و ویرایش مراجع
    </button>

    <button
      type="button"
      onClick={() => {
        setWalletQA(true)
      }}
      className="w-full text-right bg-[#e6fcf5] hover:bg-[#c3fae8] border-r-4 border-[#0ca678] text-[#085041] font-medium text-[0.9rem] py-2.5! px-3! rounded-lg transition-colors duration-200 cursor-pointer"
    >
      تراکنش کیف پول
    </button>

    <button
      type="button"
      onClick={() => {
              setPaymentQA(true)
      }}
      className="w-full text-right bg-[#fff5f5] hover:bg-[#ffe3e3] border-r-4 border-[#e03131] text-[#8a1c1c] font-medium text-[0.9rem] py-2.5! px-3! rounded-lg transition-colors duration-200 cursor-pointer"
    >
      پرداخت بدهی مراجع
    </button>

    <button
      type="button"
      onClick={() => {
        setAccessQA(true)
      }}
      className="w-full text-right bg-[#f3f0ff] hover:bg-[#e5dbff] border-r-4 border-[#7048e8] text-[#3b1e8a] font-medium text-[0.9rem] py-2.5! px-3! rounded-lg transition-colors duration-200 cursor-pointer"
    >
      دسترسی درمانگر به پرونده درمانی
    </button>
        <button
      type="button"
      onClick={() => {
   setLeaveQA(true)
      }}
      className="w-full text-right bg-[#fff5f5] hover:bg-[#ffe3e3] border-r-4 border-[#e03131] text-[#8a1c1c] font-medium text-[0.9rem] py-2.5! px-3! rounded-lg transition-colors duration-200 cursor-pointer"
    >
      ثبت مرخصی درمانگر
    </button>
      <button
      type="button"
      onClick={() => {
    setTherapistQA(true)
      }}
      className="w-full text-right bg-[#e7f5ff] hover:bg-[#d0ebff] border-r-4 border-[#1c7ed6] text-[#0b4a80] font-medium text-[0.9rem] py-2.5! px-3! rounded-lg transition-colors duration-200 cursor-pointer"
    >
      ثبت نام درمانگر
    </button>
  </div>
</div>
          </aside>
        </div>
      </main>
      {noteForm && (
        <NoteModal
          isOpen={noteForm}
          onClose={() => setNoteForm(false)}
          date={date}
        />
      )}
      {leavesForm && (
        <LeaveModal
          isOpen={leavesForm}
          onClose={() => setLeavesForm(false)}
          date={date}
        />
      )}
      {patientQA&& <QuickAccessPatientModal onClose={()=>setPatientQA(false)}/>}
          {walletQA&& <QuickAccessTransaction onClose={()=>setWalletQA(false)}/>}
                {paymentQA&& <QuickAccessPayment onClose={()=>setPaymentQA(false)}/>}
                   {leaveQA&& <QuickAccessLeave onClose={()=>setLeaveQA(false)}/>}
                                 {therapistQA&& <QuickAccessTherapist onClose={()=>setTherapistQA(false)}/>}
                                           {accessQA&& <QuickAccessAccess onClose={()=>setAccessQA(false)}/>}
    </div>
  );
}
