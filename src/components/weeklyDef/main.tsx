import {  useState } from "react";
import DailyTable from "./dailyTable";
import "./maindef.css";

// import { GetDailyDefAppointmets, GetDailyDefTherapist, PostAddDefAppointment, PostEditDefAppointment } from "../../../api/adminpanel";


import AddDefAppointment from "./addDefAppointment";

import { useTherapists } from "../../hooks/therapist";


import type { DayOfWeek } from "../../types/enums";
import { useCreateDefApp, useDefapp_day_th_pa, useEditDefApp } from "../../hooks/defAppointment";
import type { editDefAppDto, NewDefAppDto } from "../../types/defAppointment";

type weekDayDef = {
  name: string;
  eng: DayOfWeek;
  index: number;
};

const weekDays: weekDayDef[] = [
  { name: "شنبه", eng: "Saturday", index: 0 },
  { name: "یکشنبه", eng: "Sunday", index: 1 },
  { name: "دوشنبه", eng: "Monday", index: 2 },
  { name: "سه‌شنبه", eng: "Tuesday", index: 3 },
  { name: "چهارشنبه", eng: "Wednesday", index: 4 },
  { name: "پنجشنبه", eng: "Thursday", index: 5 },
  { name: "جمعه", eng: "Friday", index: 6 },
];
export default function MainWeeklydef() {
  const getCurrentDayIndex = () => {
    const today = new Date();
    let jsDay = today.getDay();
    if (jsDay == 6) {
      jsDay = 0;
    } else {
      jsDay += 1;
    }
    return weekDays[jsDay];
  };
const [showDailyModal, setShowDailyModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(getCurrentDayIndex());
  const [edidMode, setEditMode] = useState(false);

  const [editingAppointment, setEditingAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);
const {data: defAppointments}=useDefapp_day_th_pa({day:[selectedDay.eng]})
  const {data:todayTherapists} = useTherapists({ days: [selectedDay.eng] });
const{mutate:CreateDefApp}=useCreateDefApp()
const{mutate:EditDefApp}=useEditDefApp()
  const handleAddAppointment = async (data: NewDefAppDto) => {

      setEditMode(false);
      setEditingAppointment(null);
      setShowModal(false);
      data = { ...data, date: selectedDay.eng };

      CreateDefApp(data);
  };

  const handleEditAppointment = async (data:editDefAppDto) => {
   
      data = { ...data, date: selectedDay.eng, _id: editingAppointment._id };
      setEditMode(false);
      setEditingAppointment(null);
      setShowModal(false);

      EditDefApp(data)


  };

return (
  <div className=" overflow-auto! mr-[100px]  bg-[#f9fafb]  p-5! ">
    
    <AddDefAppointment
      defAppointments={defAppointments}
      editingAppointment={editingAppointment}
      setEditingAppointment={setEditingAppointment}
      todayTherapists={todayTherapists}
      setSelectedDay={setSelectedDay}
      selectedDay={selectedDay}
      onSubmit={edidMode == true ? handleEditAppointment : handleAddAppointment}
      setShowModal={setShowModal}
      edidMode={edidMode}
      setEditMode={setEditMode}
      showModal={showModal}
    />
  <button
  className="md:hidden m-2! h-10 w-full bg-indigo-600 text-white rounded-lg"
  onClick={() => setShowDailyModal(true)}
>
  مشاهده برنامه روز
</button>
    <div className="flex! justify-center flex-wrap gap-[10px] rtl">
      {weekDays.map((day) => (
        <button
          key={day.index}
          className={`min-w-[80px] px-3 py-2 border-none rounded-lg bg-[#f1f5f9] text-[#1e3b2e] font-medium cursor-pointer transition-all duration-300 text-center hover:bg-[#e2e8f0] ${
            selectedDay === day
              ? "bg-gradient-to-br from-[#3bf6b2] to-[#25ebcd] text-white shadow-[0_4px_12px_rgba(59,130,246,0.3)] -translate-y-[2px]"
              : ""
          }`}
          onClick={() => setSelectedDay(day)}
        >
          {day.name}
        </button>
      ))}
    </div>
<div className="hidden md:block">
    <DailyTable
      todayTherapists={todayTherapists}
      selectedDay={selectedDay}
      editingAppointment={editingAppointment}
      setEditingAppointment={setEditingAppointment}
      defAppointments={defAppointments}
      showModal={showModal}
      setShowModal={setShowModal}
      editMode={edidMode}
      setEditMode={setEditMode}
    />
    </div>
     {showDailyModal && (
      <div className="fixed inset-0 z-50  bg-black/40 flex items-end md:hidden">
        
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
    
          <div className="flex-1 p-2! overflow-auto">
             <DailyTable
      todayTherapists={todayTherapists}
      selectedDay={selectedDay}
      editingAppointment={editingAppointment}
      setEditingAppointment={setEditingAppointment}
      defAppointments={defAppointments}
      showModal={showModal}
      setShowModal={setShowModal}
      editMode={edidMode}
      setEditMode={setEditMode}
    />
          </div>
    
        </div>
      </div>
    )}
  </div>
);

}
