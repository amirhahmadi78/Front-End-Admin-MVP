import "./Layout.css";
import {  Outlet, useLocation, useNavigate } from "react-router-dom";

import Swal from "sweetalert2";
import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";
import { ChangePasswordModal } from "../util/changePasword";
import { useLeavesCount } from "../../hooks/leaves";





const LayoutDashboard = () => {
  const{user,logout}=useAuth()

  const location = useLocation();
const isActive = (path: string) => location.pathname === path;
const fullName=(user?.firstName+" "+user?.lastName)||""
const [showModalChange,setShowModalChange]=useState(false)
const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
const{data:pendingCount}=useLeavesCount()

  const handleLogout = () => {
    Swal.fire({
      title: "آیا اطمینان دارید؟",
      text: "برای خروج از حساب کاربری تایید کنید!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "تایید",
      cancelButtonText: "لغو",
    }).then((result) => {
      if (result.isConfirmed) {
        logout().then(() => {
          Swal.fire({
            title: "خروج موفق!",
            text: "با موفقیت خارج شدید!",
            icon: "success",
          });
          navigate("/");
        });
      }
    });
  };

  return (
    <div className={`admin-layout ${!isSidebarOpen ? "sidebar-closed" : ""}`}>
      <aside className={`admin-sidebar ${!isSidebarOpen ? "closed" : ""}`}>
        <div className="sidebar-header p-1! ">
          <button
            className="toggle-btn"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
            
          
        </div>

        {isSidebarOpen && (
          <>
          <div className="flex-col! text-center!">
 <p className="min-w-45 mx-2! p-1!  text-center mb-1 border-purple-400 border-2 rounded-xl bg-blue-900  text"> کاربر فعال :{fullName}</p>
          <button onClick={()=>setShowModalChange(true)} className="min-w-45 mx-2! p-1! mb-3!  border-purple-400 border-2 rounded-xl bg-blue-800  text">تغییر رمز عبور</button>
           
          </div>
         
            <button onClick={handleLogout} className="logout-btn">
              خروج از حساب
            </button>
            <ul className="pb-20!">
              <li className={isActive("/dashboard") ? "active" : ""} onClick={() => {navigate("/dashboard"); setIsSidebarOpen(false)}}>داشبورد</li>

<li className={isActive("/therapists") ? "active" : ""} onClick={() => {navigate("/therapists"); setIsSidebarOpen(false)}}>درمانگران</li>

<li className={isActive("/patients") ? "active" : ""} onClick={() => {navigate("/patients"); setIsSidebarOpen(false)}}>مراجعین</li>

<li className={isActive("/weeklydef") ? "active" : ""} onClick={() => {navigate("/weeklydef"); setIsSidebarOpen(false)}}>برنامه ثابت هفتگی</li>

<li className={isActive("/patient-therapist") ? "active" : ""} onClick={() => {navigate("/patient-therapist"); setIsSidebarOpen(false)}}>ارتباط درمانگر و مراجع</li>

<li className={isActive("/patientprofile") ? "active" : ""} onClick={() => {navigate("/patientprofile"); setIsSidebarOpen(false)}}>پرونده ی درمانی</li>

<li className={isActive("/exercise-assessment") ? "active" : ""} onClick={() => {navigate("/exercise-assessment"); setIsSidebarOpen(false)}}>بخش تمرینات و ارزیابی ها</li>

<li className={isActive("/finance") ? "active" : ""} onClick={() => {navigate("/finance"); setIsSidebarOpen(false)}}>امور مالی</li>

<li className={isActive("/leave-requests") ? "active" : ""} onClick={() => {navigate("/leave-requests"); setIsSidebarOpen(false)}}>
  بررسی مرخصی های درمانگران
  {pendingCount > 0 && <span className="pending-badge">{pendingCount}</span>}
</li>

<li className={isActive("/patient-management") ? "active" : ""} onClick={() => {navigate("/patient-management"); setIsSidebarOpen(false)}}>یادداشت ها و مرخصی مراجعین</li>

{user?.role==="Admin" && <li className={isActive("/advance") ? "active" : ""} onClick={() => {navigate("/advance"); setIsSidebarOpen(false)}}>تنظیمات پیشرفته</li>}

{user?.role==="Admin" && <li className={isActive("/adminmanagement") ? "active" : ""} onClick={() => {navigate("/adminmanagement"); setIsSidebarOpen(false)}}>مدیریت کارکنان</li>}
               <button
            className=" p-1! w-50! rounded-xl bg-blue-300 text-black font-bold border  mt-3!"
            onClick={() => {window.location.reload()
              setIsSidebarOpen(false)
            }}
          >
            بروزرسانی
          </button>
            </ul>
          </>
        )}
      </aside>

      <main className="admin-main">
        {!isSidebarOpen && (
          <button
            className="floating-toggle-btn"
            onClick={() => setIsSidebarOpen(true)}
          >
            <FaBars />
          </button>
        )}
        <Outlet />
      </main>
      <ChangePasswordModal isOpen={showModalChange} onClose={setShowModalChange}/>
    </div>
  );
};

export default LayoutDashboard;
