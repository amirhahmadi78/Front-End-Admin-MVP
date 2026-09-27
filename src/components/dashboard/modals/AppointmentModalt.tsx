import React, { useEffect, useState } from "react";
import moment from "moment-jalaali";
import Swal from "sweetalert2";
import { useForm } from "react-hook-form";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

import GroupModal from "./GroupModal";
import "./AddModal.css";

import {
  useChangeStatus,
  useDeleteAppointment,
} from "../../../hooks/appointment";
import { useGetOnePatient } from "../../../hooks/patient";

import { AlertSwal } from "../../../utils/errorSwal";



export default function AppointmentModal({
  showForm,
  setAllAppointments,
  allAppointments,
  setShowForm,
  appointment,
  setShowModal,
  onEdit,
  onEditGroup,
  todayTherapists,
  patientlist,
  onSuccess
}) {
    useEffect(() => {
    if (!appointment) return;

    if (appointment.sessionType === "group") {
      if (!onEditGroup) {
        setShowModal(false);
        AlertSwal.Error(
          "قابلیت ویرایش وجود ندارد. برای تغییر وضعیت پرداخت جلسات گروهی به برنامه روزانه ی تاریخ مورد نظر مراجعه فرمایید!"
        );
        return;
      }

      setShowGroupModal(true);
    }
  }, [appointment, onEditGroup, setShowModal]);

  if (!appointment) return null;


  const { data: onePatient } = useGetOnePatient(appointment.patient);



  const { mutate: deletAppointment } = useDeleteAppointment();
  const { mutateAsync: changeStatus } = useChangeStatus();


  const patientWallet = onePatient?.[0]?.wallet ?? 0;

  

  const [walletLoading, setWalletLoading] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);

const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm();


  const newStatus = watch("status_clinic");
  const payment = watch("payment");

  useEffect(() => {
    if (appointment.sessionType === "group") {
      setShowGroupModal(true);
    }
  }, [appointment]);

  useEffect(() => {
    if (appointment) {
      reset({
        status_clinic: appointment.status_clinic,
        payment: appointment.payment || "card",
        date:
          appointment.paidAt && appointment.paidAt !== "0"
            ? moment(appointment.paidAt, "jYYYY/jMM/jDD-HH:mm").format(
                "jYYYY/jMM/jDD"
              )
            : moment().format("jYYYY/jMM/jDD"),
        time:
          appointment.paidAt && appointment.paidAt !== "0"
            ? moment(appointment.paidAt, "jYYYY/jMM/jDD-HH:mm").format("HH:mm")
            : moment().format("HH:mm"),
        pay_details:
          appointment.pay_details && appointment.pay_details !== "0"
            ? appointment.pay_details
            : "",
      });
    }
  }, [appointment, reset]);

  
  const onSubmit = async (data) => {
    let payAt = 0;
    let payment = data.payment;
    let pay_details = data.pay_details;

    if (data.status_clinic === "completed-paid") {
      

      payAt = `${data.date}-${data.time}`;
    }

   

    const query = {
      appointmentId: appointment._id,
      status_clinic: data.status_clinic,
      payAt,
      pay_details,
      payment,
    };

    if (query.status_clinic !== "completed-paid") {
      query.payment = 0;
    }
       if (query.status_clinic == "completed-paid"&&(query.payment=="0"||query.payment==0)) {
        return alert("لطفا اول روش پرداخت را انتخاب نمایید!")
      
    }
  
   
    const dataa=await changeStatus(query);
    if(onSuccess){
      onSuccess(dataa)
    }
    
    setShowModal(false);
  };

  const handleDeleteApp = async (id) => {
    setShowModal(false);

    const result = await Swal.fire({
      title: "آیا اطمینان دارید؟",
      text: "برای حذف این جلسه تایید کنید",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "تایید",
      cancelButtonText: "لغو",
    });

    if (result.isConfirmed) {
      deletAppointment(id);
    }
  };

  if (appointment.sessionType === "group") {
    // if(!onEditGroup||onEditGroup==null||onEditGroup==undefined){
    //    setShowModal(false)
    //     AlertSwal.Error("قابلیت ویرایش وجود ندارد. برای تغییر وضعیت پرداخت جلسات گروهی به برنامه روزانه ی تاریخ مورد نظر مراجعه فرمایید!")
    //   return
    // }
    return (
      showGroupModal && (
        <GroupModal
          isOpen={showGroupModal}
          onClose={() => {
            setShowGroupModal(false);
            setShowModal(false);
          }}
          patientlist={patientlist}
          appointment={appointment}
          setShowModal={setShowModal}
          allAppointments={allAppointments}
          setAllAppointments={setAllAppointments}
          onEdit={onEditGroup}
          todayTherapists={todayTherapists}
          showForm={showForm}
          setShowForm={setShowForm}
        />
      )
    );
  }

return (
  <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-[8px] animate-[fadeIn_0.3s_ease-out]">
    
    <div className="relative max-h-[90vh] w-[90%] max-w-[500px] overflow-y-auto rounded-[20px] border border-white/20 bg-white shadow-[0_25px_50px_rgba(0,0,0,0.25)] animate-[slideUp_0.4s_cubic-bezier(0.4,0,0.2,1)]">
      <div className="p-6!">
      {/* gradient line */}
      <div className="absolute top-0 left-0 right-0 h-[4px] rounded-t-[20px] bg-gradient-to-r from-blue-500 via-emerald-500 to-amber-500"></div>

      {/* close button */}
      <button
        onClick={() => setShowModal(false)}
        className="absolute left-5 top-[15px] z-10 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-[18px] text-white transition-all duration-300 hover:rotate-90 hover:bg-red-600"
      >
        ×
      </button>

      <h3 className="m-0 border-b border-slate-100 bg-gradient-to-br from-slate-800 to-slate-600 bg-clip-text px-10 pb-5 pt-[30px] text-center text-[22px] font-bold text-transparent">
        جزئیات جلسه درمانی
      </h3>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="px-10 py-[30px]"
      >

        {/* status */}
        <label className="mb-2 block text-right text-[14px] font-semibold text-gray-700">
          وضعیت مراجع
        </label>

        <select
          {...register("status_clinic")}
          className="mb-4 w-full rounded-[10px] border-2 border-gray-200 bg-white px-4 py-3 text-right text-[14px] transition-all duration-300 focus:-translate-y-[1px] focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
        >
          <option value="scheduled">برنامه ریزی شده</option>
          <option value="completed-notpaid">ویزیت شده بدون پرداخت</option>
          <option value="completed-paid">ویزیت شده و پرداخت شده</option>
          <option value="canceled">لغو شده</option>
          <option value="bimeh">ویزیت شده بیمه</option>
        </select>

        {newStatus === "completed-paid" && (
          <>
            <label className="mb-2 block text-right text-[14px] font-semibold text-gray-700">
              روش پرداخت
            </label>

            <select
              {...register("payment", {
                validate: (value) => {
                  if (newStatus === "completed-paid" && (value === "0" || !value)) {
                    return "لطفا ابتدا روش پرداخت را انتخاب کنید";
                  }
                  return true;
                },
              })}
              className="mb-2 w-full rounded-[10px] border-2 border-gray-200 bg-white px-4 py-3 text-right text-[14px] transition-all duration-300 focus:-translate-y-[1px] focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="0">نامشخص</option>
              <option value="card">کارت خوان</option>
              <option value="transfer">کارت به کارت</option>
              <option value="cash">نقدی</option>
              <option value="wallet">کیف پول</option>
            </select>

            {errors.payment && (
              <p className="mt-1 text-right text-[13px] text-red-500">
                {errors.payment.message}
              </p>
            )}

            {payment !== "0" && (
              <>
                <label className="mt-4 mb-2 block text-right text-[14px] font-semibold text-gray-700">
                  ساعت
                </label>

                <input
                  type="time"
                  {...register("time")}
                  className="mb-4 w-full rounded-[10px] border-2 border-gray-200 px-4 py-3 text-right text-[14px] transition-all duration-300 focus:-translate-y-[1px] focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                />

                <label className="mb-2 block text-right text-[14px] font-semibold text-gray-700">
                  تاریخ
                </label>

                <div className="mb-4">
                  <DatePicker
                    value={watch("date")}
                    onChange={(e) => {
                      const month =
                        e.month.number < 10
                          ? "0" + e.month.number
                          : e.month.number;
                      const day = e.day < 10 ? "0" + e.day : e.day;

                      setValue("date", `${e.year}/${month}/${day}`);
                    }}
                    calendar={persian}
                    locale={persian_fa}
                    format="YYYY/MM/DD"
                  />
                </div>

                <label className="mb-2 block text-right text-[14px] font-semibold text-gray-700">
                  جزئیات پرداخت
                </label>

                <input
                  {...register("pay_details")}
                  className="w-full rounded-[10px] border-2 border-gray-200 px-4 py-3 text-right text-[14px] transition-all duration-300 focus:-translate-y-[1px] focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                />
              </>
            )}
          </>
        )}

        {/* appointment info */}
        <div className="mt-[15px] space-y-1 text-right text-[14px] text-gray-800">
          <p>
            <strong>درمانگر:</strong> {appointment.therapistName}
          </p>
 
          <p>
            <strong>مراجع:</strong> {appointment.patientName}
          </p>
 <p>
            <strong>شماره تماس:</strong> {Array.isArray(onePatient)&&onePatient.length>0? onePatient[0]?.phone:0}
          </p>
          <p>
            <strong>مبلغ:</strong>{" "}
            {appointment?.patientFee?.toLocaleString()} تومان
          </p>
<p>
            <strong>موجودی کیف پول:</strong>{" "}
            {patientWallet?.toLocaleString()} تومان
          </p>
          <p>
            <strong>زمان:</strong>{" "}
            {moment(appointment.start).format("HH:mm")} -{" "}
            {moment(appointment.end).format("HH:mm")}
          </p>

          <p>
            <strong>مدت:</strong> {appointment.duration} دقیقه
          </p>
        </div>

        {/* buttons */}
        <div className="mt-[30px] flex justify-between gap-3 border-t border-slate-100 pt-5 max-md:flex-col">

          <button
            type="button"
            onClick={() =>{
              if((!onEdit||onEdit==null||onEdit==undefined)){
                setShowModal(false)
                return AlertSwal.Error("فاقد قابلیت ویرایش!")
              }
              
              onEdit(appointment)} }
            className="flex-1 rounded-[10px] bg-gradient-to-br from-gray-500 to-gray-600 px-5 py-[14px] text-[15px] font-semibold text-white shadow-[0_4px_15px_rgba(107,114,128,0.3)] transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_8px_25px_rgba(107,114,128,0.5)]"
          >
            ویرایش
          </button>

          <button
            type="button"
            onClick={() => handleDeleteApp(appointment._id)}
            className="flex-1 rounded-[10px] bg-gradient-to-br from-red-500 to-red-600 px-5 py-[14px] text-[15px] font-semibold text-white shadow-[0_4px_15px_rgba(239,68,68,0.3)] transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_8px_25px_rgba(239,68,68,0.5)]"
          >
            حذف جلسه
          </button>

          <button
            type="submit"
            className="flex-1 rounded-[10px] bg-gradient-to-br from-blue-500 to-blue-700 px-5 py-[14px] text-[15px] font-semibold text-white shadow-[0_4px_15px_rgba(59,130,246,0.3)] transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_8px_25px_rgba(59,130,246,0.5)]"
          >
            {walletLoading ? "در حال پرداخت..." : "ثبت تغییرات"}
          </button>

        </div>

      </form>
    </div>
  </div>
  </div>
);

}
